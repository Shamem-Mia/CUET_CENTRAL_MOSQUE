import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
} from "../controllers/eventController.js";
import upload from "../middlewares/uploadMiddleware.js";
import authUser from "../middlewares/userAuth.js";
import admin from "../middlewares/adminMiddleware.js";

const eventRouter = express.Router();

// Public routes
eventRouter.get("/", getEvents);

// IMPORTANT: Specific routes must come BEFORE dynamic routes (/:id)
// Protected routes (require login) - specific paths first
eventRouter.get("/my-registrations", authUser, getMyRegistrations);

// Dynamic routes (with :id) - these should come AFTER all specific routes
eventRouter.get("/:id", getEventById);
eventRouter.post("/:id/register", authUser, registerForEvent);
eventRouter.delete("/registration/:id", authUser, cancelRegistration);

// Admin routes
eventRouter.post("/", authUser, admin, upload.single("image"), createEvent);
eventRouter.put("/:id", authUser, admin, upload.single("image"), updateEvent);
eventRouter.delete("/:id", authUser, admin, deleteEvent);
eventRouter.get("/:id/registrations", authUser, admin, getEventRegistrations);

export default eventRouter;
