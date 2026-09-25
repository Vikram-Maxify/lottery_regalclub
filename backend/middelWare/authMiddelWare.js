const jwt = require("jsonwebtoken");
const User = require("../models/authmodel");

// ============================================================
// GET TOKEN
// Cookie priority:
// 1. powerhit
// 2. token
// 3. adminToken
// 4. Authorization Bearer
// ============================================================

const getToken = (req) => {
  const cookies = req.cookies || {};

  console.log("========== AUTH DEBUG ==========");
  console.log("HOST:", req.headers.host);
  console.log("ORIGIN:", req.headers.origin);
  console.log("RAW COOKIE:", req.headers.cookie);
  console.log("PARSED COOKIES:", cookies);
  console.log("AUTH HEADER:", req.headers.authorization);
  console.log("================================");

  // powerhit - preferred user cookie
  if (cookies.powerhit) {
    console.log("TOKEN SOURCE: powerhit");
    return cookies.powerhit;
  }

  // token - old/current login cookie
  if (cookies.token) {
    console.log("TOKEN SOURCE: token");
    return cookies.token;
  }

  // admin
  if (cookies.adminToken) {
    console.log("TOKEN SOURCE: adminToken");
    return cookies.adminToken;
  }

  // Authorization header
  const authHeader = req.headers?.authorization;

  if (
    authHeader &&
    authHeader.startsWith("Bearer ")
  ) {
    console.log("TOKEN SOURCE: Authorization");

    return authHeader
      .substring(7)
      .trim();
  }

  console.log("TOKEN SOURCE: NONE");

  return null;
};

// ============================================================
// PROTECT
// ============================================================

const protect = async (req, res, next) => {
  try {
    const token = getToken(req);
    
    console.log(token)
    // --------------------------------------------------------
    // TOKEN NOT FOUND
    // --------------------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - token not found",
      });
    }

    // --------------------------------------------------------
    // JWT SECRET
    // --------------------------------------------------------

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "JWT configuration error",
      });
    }

    // --------------------------------------------------------
    // VERIFY JWT
    // --------------------------------------------------------

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        JWT_SECRET
      );

      console.log("JWT DECODED:", decoded);
    } catch (jwtError) {
      console.error(
        "JWT VERIFY ERROR:",
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    let user = null;

    // --------------------------------------------------------
    // 1. MongoDB _id
    // --------------------------------------------------------

    if (decoded.id) {
      try {
        user = await User.findById(
          decoded.id
        )
          .select("-password -plainPassword")
          .lean();

        if (user) {
          console.log(
            "USER FOUND BY MONGO ID:",
            user.userId
          );
        }
      } catch (error) {
        console.log(
          "Mongo ID lookup skipped:",
          error.message
        );
      }
    }

    // --------------------------------------------------------
    // 2. Numeric userId
    // --------------------------------------------------------

    if (
      !user &&
      decoded.userId !== undefined &&
      decoded.userId !== null
    ) {
      const numericUserId = Number(
        decoded.userId
      );

      if (Number.isFinite(numericUserId)) {
        user = await User.findOne({
          userId: numericUserId,
        })
          .select("-password -plainPassword")
          .lean();

        if (user) {
          console.log(
            "USER FOUND BY USER ID:",
            user.userId
          );
        }
      }
    }

    // --------------------------------------------------------
    // USER NOT FOUND
    // --------------------------------------------------------

    if (!user) {
      console.error(
        "USER NOT FOUND FOR JWT:",
        decoded
      );

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // BLOCKED
    // --------------------------------------------------------

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    // --------------------------------------------------------
    // ATTACH USER
    // --------------------------------------------------------

    req.user = user;

    req.userId = Number(
      user.userId
    );

    req.id = user._id;

    console.log(
      "AUTH SUCCESS - USER:",
      user.userId
    );

    next();

  } catch (error) {
    console.error(
      "PROTECT ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

// ============================================================
// ADMIN ONLY
// ============================================================

const adminProtect = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

// ============================================================
// USER ONLY
// ============================================================

const userProtect = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "User access only",
    });
  }

  next();
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  protect,
  adminProtect,
  userProtect,
};