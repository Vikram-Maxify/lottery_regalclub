require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const { dbConnect } = require("./config/database");
const websocket = require("./config/websocket");

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/TradeadminRoute");
const betRoute = require("./routes/TradebetRoute");
const dns = require("dns");
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require("path");

const {
  createTrade,
  checkwhichUserIsWinner,
} = require("./controllers/tradebetController");

const app = express();
const server = http.createServer(app);

// --------------------------------------------------
// WebSocket
// --------------------------------------------------
websocket.init(server);


// index.js
// --------------------------------------------------
// CORS
// --------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",

      // Main domain
      "https://lotterry.marinclub.site",

      // Trade subdomain
      "https://lotterry.trade.marinclub.site",
    ],
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------------------------------
// Routes
// --------------------------------------------------
app.use("/api", userRoute);
app.use("/api", adminRoute);
app.use("/api", betRoute);

// --------------------------------------------------
// Health Check
// --------------------------------------------------
// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Server is running",
//   });
// });

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working",
    database: "MongoDB",
  });
});

const userDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(userDistPath));


app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(userDistPath, "index.html"));
});

// --------------------------------------------------
// 30 Second Trading Timer
// --------------------------------------------------
// IMPORTANT:
// Do not keep a local countdown that starts from 30 when the server boots.
// Instead, derive the remaining time from Unix time so every browser sees
// exactly the same trading clock, even after reconnects/restarts.
const ROUND_SECONDS = 30;

let lastCreateCycle = null;
let lastWinnerCycle = null;

const getTradingClock = () => {
  const nowMs = Date.now();
  const unixSeconds = Math.floor(nowMs / 1000);
  const cycleSecond = unixSeconds % ROUND_SECONDS;
  const countdown = ROUND_SECONDS - cycleSecond;

  return {
    minute: Math.floor(countdown / 60),
    secondtime1: Math.floor((countdown % 60) / 10),
    secondtime2: countdown % 10,
    countdown,
    cycleSecond,
    timestamp: nowMs,
    nextRoundAt: nowMs + (countdown * 1000),
  };
};

const broadcastTradingClock = () => {
  const clock = getTradingClock();

  websocket.broadcast({
    event: "timeUpdate_30",
    ...clock,
  });

  return clock;
};

// Send the current clock every second.
// The exact value is calculated from Date.now(), so it cannot drift.
const timer = setInterval(async () => {
  try {
    const clock = broadcastTradingClock();

    // At 5 seconds remaining, open/create the next trade round.
    if (clock.countdown === 5) {
      const cycleId = Math.floor(clock.timestamp / 1000 / ROUND_SECONDS);

      if (lastCreateCycle !== cycleId) {
        lastCreateCycle = cycleId;

        try {
          await createTrade();
          console.log("✅ Trade created");
          websocket.broadcast({
            event: "tradeCreated",
            countdown: 5,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("❌ createTrade error:", error);
        }
      }
    }

    // At 4 seconds remaining, settle/check the current round.
    if (clock.countdown === 4) {
      const cycleId = Math.floor(clock.timestamp / 1000 / ROUND_SECONDS);

      if (lastWinnerCycle !== cycleId) {
        lastWinnerCycle = cycleId;

        try {
          await checkwhichUserIsWinner();
          console.log("✅ Winner checking completed");
          websocket.broadcast({
            event: "winnerChecked",
            countdown: 4,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("❌ checkwhichUserIsWinner error:", error);
        }
      }
    }
  } catch (error) {
    console.error("❌ Trading timer error:", error);
  }
}, 1000);

// Immediately publish a synchronized clock after the server starts.
setTimeout(() => {
  broadcastTradingClock();
}, 100);

// --------------------------------------------------
// Cron Jobs
// --------------------------------------------------
try {
  require("./controllers/cronJob");
  console.log("Cron jobs loaded successfully");
} catch (error) {
  console.error("Cron job loading error:", error);
}

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down server...`);

  clearInterval(timer);

  try {
    websocket.close();

    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// --------------------------------------------------
// MongoDB Connection + Start Server
// --------------------------------------------------
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await dbConnect();

    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();
