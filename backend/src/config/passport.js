import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import { createToken } from "../libs/utils.js";
import bcrypt from "bcryptjs";

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://cuet-central-mosque.onrender.com/auth/google/callback"
          : "http://localhost:4000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile.emails[0].value);

        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create new user with Google data
          // Generate a random password for Google users
          const randomPassword =
            Math.random().toString(36).slice(-12) +
            Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);

          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            password: hashedPassword, // Random password (user will never use it)
            isAccountVerified: true, // Auto-verified for Google accounts
            googleId: profile.id,
            role: "user",
          });

          console.log("New user created via Google:", user.email);
        } else {
          // Update existing user with Google ID if not already set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          console.log("Existing user logged in via Google:", user.email);
        }

        // Generate token
        const token = createToken(user.email, user.role);

        return done(null, { user, token });
      } catch (error) {
        console.error("Google strategy error:", error);
        return done(error, null);
      }
    },
  ),
);

export default passport;
