import express from "express";
import {
  googleAuth,
  googleAuthCallback,
  handleOAuthSuccess,
  isAuthenticated,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  sendResetOtp,
  sendVerifyOTP,
  verifyAndCreateUser,
  verifyResetOtp,
} from "../controllers/authController.js";
import authUser from "../middlewares/userAuth.js";

const router = express.Router();

// Regular auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", authUser, sendVerifyOTP);
router.post("/verify-and-create", verifyAndCreateUser);
router.post("/resend-verification", resendVerification);
router.post("/is-auth", authUser, isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.get("/oauth-success", handleOAuthSuccess);

// Debug route for production
router.get("/debug-oauth", (req, res) => {
  res.json({
    environment: "production",
    googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,
    clientURL:
      process.env.CLIENT_URL || "https://cuet-central-mosque.onrender.com",
    redirectURI: `${process.env.CLIENT_URL || "https://cuet-central-mosque.onrender.com"}/oauth-success`,
    expectedGoogleRedirect: process.env.GOOGLE_CALLBACK_URL,
    googleClientIdPrefix:
      process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
  });
});

export default router;
