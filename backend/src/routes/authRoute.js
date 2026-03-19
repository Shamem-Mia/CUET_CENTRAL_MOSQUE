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

// Google OAuth routes - USE ROUTER, NOT APP
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.get("/oauth-success", handleOAuthSuccess);

// In your authRoute.js
router.get("/debug-oauth", (req, res) => {
  res.json({
    googleCallbackURL: "http://localhost:4000/api/auth/google/callback",
    clientURL: process.env.CLIENT_URL,
    redirectURI: `${process.env.CLIENT_URL}/oauth-success`,
    expectedGoogleRedirect: "http://localhost:4000/api/auth/google/callback",
  });
});

export default router;
