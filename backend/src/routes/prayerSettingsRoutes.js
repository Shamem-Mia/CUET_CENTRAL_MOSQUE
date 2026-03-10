import express from "express";
import {
  getPrayerSettings,
  updatePrayerSettings,
  resetToApiMode,
  getPrayerTimes,
} from "../controllers/prayerSettingsController.js";
import authUser from "../middlewares/userAuth.js";
import admin from "../middlewares/adminMiddleware.js";

const prayerSettingRouter = express.Router();

// Public route for getting prayer times
prayerSettingRouter.get("/times", getPrayerTimes);

// Admin routes for settings
prayerSettingRouter.get("/settings", authUser, admin, getPrayerSettings);
prayerSettingRouter.put("/settings", authUser, admin, updatePrayerSettings);
prayerSettingRouter.post("/settings/reset", authUser, admin, resetToApiMode);

export default prayerSettingRouter;
