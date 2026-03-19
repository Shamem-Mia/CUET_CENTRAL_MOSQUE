import transporter from "../config/nodemailer.js";
import { createToken } from "../libs/utils.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Details are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate a 6-digit OTP
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create temporary user data
    const tempUserData = new User({
      fullName,
      email,
      password: hashedPassword,
      verifyOtp: OTP,
      verifyOtpExpireAt: otpExpiry,
    });

    // Email options with CUET CENTRAL MOSQUE branding
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Welcome to CUET CENTRAL MOSQUE - Verify Your Email",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #047857, #065f46); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CUET CENTRAL MOSQUE</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">"And establish prayer for My remembrance"</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #065f46; margin-top: 0;">Email Verification</h2>
          <p style="color: #374151; line-height: 1.6;">Assalamu Alaikum ${fullName},</p>
          <p style="color: #374151; line-height: 1.6;">Thank you for registering with CUET CENTRAL MOSQUE. Please verify your email address using the OTP below:</p>
          <div style="background: #ecfdf5; padding: 16px; text-align: center; margin: 24px 0; border-radius: 8px; border: 1px solid #a7f3d0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #065f46;">${OTP}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            CUET CENTRAL MOSQUE | Chittagong University of Engineering & Technology
          </p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    await tempUserData.save();

    res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err) {
      return res.redirect(
        `${process.env.CLIENT_URL}/register?error=google-auth-failed`,
      );
    }

    if (!data) {
      return res.redirect(
        `${process.env.CLIENT_URL}/register?error=google-auth-failed`,
      );
    }

    const { user, token } = data;

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with success
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
};

export const handleOAuthSuccess = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token and get user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isAccountVerified: user.isAccountVerified,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyAndCreateUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required!",
      });
    }

    const tempUserData = await User.findOne({ email });

    if (!tempUserData) {
      return res.status(400).json({
        success: false,
        message: "No verification request found for this email",
      });
    }

    // Convert both OTPS to string for consistent comparison
    const receivedOtp = String(otp).trim();
    const storedOtp = String(tempUserData.verifyOtp).trim();

    if (storedOtp !== receivedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (tempUserData.verifyOtpExpireAt < Date.now()) {
      await User.deleteOne({ _id: tempUserData._id });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Update the existing user
    tempUserData.isAccountVerified = true;
    tempUserData.verifyOtp = undefined;
    tempUserData.verifyOtpExpireAt = undefined;

    await tempUserData.save();

    // Generate token
    const token = createToken(tempUserData.email, tempUserData.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      user: {
        id: tempUserData._id,
        email: tempUserData.email,
        fullName: tempUserData.fullName,
        isAccountVerified: tempUserData.isAccountVerified,
        role: tempUserData.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "email and password is required",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist!",
      });
    }
    const isMatchedPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isMatchedPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect!",
      });
    }

    const token = createToken(email, existingUser.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Successfully logged in!",
      id: existingUser._id,
      email: existingUser.email,
      fullName: existingUser.fullName,
      isAccountVerified: existingUser.isAccountVerified,
      role: existingUser.role,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// backend/controllers/authController.js
export const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    // Always return success, even if cookie doesn't exist
    return res.status(200).json({
      success: true,
      message: "Successfully logged out!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Still return success to client - we want to clear client state anyway
    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  }
};

export const sendVerifyOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verifyOtp = OTP;
    user.verifyOtpExpireAt = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: "CUET CENTRAL MOSQUE - Email Verification OTP",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #047857, #065f46); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CUET CENTRAL MOSQUE</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">"And establish prayer for My remembrance"</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #065f46; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #374151; line-height: 1.6;">Assalamu Alaikum ${user.fullName},</p>
          <p style="color: #374151; line-height: 1.6;">Your verification code is:</p>
          <div style="background: #ecfdf5; padding: 16px; text-align: center; margin: 24px 0; border-radius: 8px; border: 1px solid #a7f3d0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #065f46;">${OTP}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            CUET CENTRAL MOSQUE | Chittagong University of Engineering & Technology
          </p>
        </div>
      </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        message: "Verification OTP sent to your email",
      });
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email, tempUserData } = req.body;

    if (!email || !tempUserData) {
      return res.status(400).json({
        success: false,
        message: "Email and user data are required",
      });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const updatedTempUserData = {
      ...tempUserData,
      otp: OTP,
      otpExpiry,
    };

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "CUET CENTRAL MOSQUE - New Verification Code",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #047857, #065f46); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CUET CENTRAL MOSQUE</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">"And establish prayer for My remembrance"</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #065f46; margin-top: 0;">New Verification Code</h2>
          <p style="color: #374151; line-height: 1.6;">Your new verification code is:</p>
          <div style="background: #ecfdf5; padding: 16px; text-align: center; margin: 24px 0; border-radius: 8px; border: 1px solid #a7f3d0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #065f46;">${OTP}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            CUET CENTRAL MOSQUE | Chittagong University of Engineering & Technology
          </p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "New verification code sent",
      otp: OTP,
      updatedTempUserData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "User is authenticated!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.resetOtp = OTP;
    user.resetOtpExpireAt = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: "CUET CENTRAL MOSQUE - Password Reset OTP",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #047857, #065f46); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CUET CENTRAL MOSQUE</h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0;">"And establish prayer for My remembrance"</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #065f46; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #374151; line-height: 1.6;">Assalamu Alaikum ${user.fullName},</p>
          <p style="color: #374151; line-height: 1.6;">Use the OTP below to reset your password:</p>
          <div style="background: #ecfdf5; padding: 16px; text-align: center; margin: 24px 0; border-radius: 8px; border: 1px solid #a7f3d0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #065f46;">${OTP}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            CUET CENTRAL MOSQUE | Chittagong University of Engineering & Technology
          </p>
        </div>
      </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        message: "OTP sent to your email to reset password",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP is required!",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email and New password is required!",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
