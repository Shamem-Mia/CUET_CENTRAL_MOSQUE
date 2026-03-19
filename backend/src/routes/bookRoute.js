import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import upload from "../middlewares/uploadMiddleware.js";
import authUser from "../middlewares/userAuth.js";
import admin from "../middlewares/adminMiddleware.js";

const bookRouter = express.Router();

// ✅ PUBLIC ROUTES - No authentication needed for viewing books
bookRouter.get("/", getBooks); // Anyone can view books
bookRouter.get("/:id", getBookById); // Anyone can view a single book

// ✅ ADMIN ONLY ROUTES - Require admin privileges
bookRouter.post("/", authUser, admin, upload.single("coverImage"), createBook);
bookRouter.put(
  "/:id",
  authUser,
  admin,
  upload.single("coverImage"),
  updateBook,
);
bookRouter.delete("/:id", authUser, admin, deleteBook);

export default bookRouter;
