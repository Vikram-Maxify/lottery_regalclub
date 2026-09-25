const express = require("express");
const router = express.Router();

const c = require("../controllers/registerUser");
const { upload } = require("../utils/upload");
const { protect } = require("../middelWare/authMiddelWare");

// protectentication
router.post("/signup", c.registerUser);
router.post("/login", c.loginUser);
router.get("/getuser", protect, c.getUser);
router.put("/update-user", protect, c.updateUser);
router.get("/logout", c.logout);

// OTP / Password
router.post("/forgotpassword", c.verifyOtpAndUpdatePassword);

// Recharge
router.post("/recharge", protect, c.recharge);
router.post("/handleRecharge", protect, c.handleRecharge);
router.post(
  "/paynow/verify-sunpay",
  c.verifySunpayPayment
);

// Withdrawal
router.post("/withdrawal", protect, c.withdraw);
router.get(
  "/withdraw-history",
  protect,
  c.getWithdrawlHistory
);

// Transaction
router.post(
  "/transaction",
  protect,
  c.createTransaction
);

// Support
router.post(
  "/support",
  upload.single("image"),
  protect,
  c.support
);

// Promo Code
router.post(
  "/usePromocode",
  c.usePromocode
);

module.exports = router;