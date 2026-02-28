import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBookCategories,
} from "../controllers/bookController.js";
import { uploadBookFiles } from "../middlewares/multerMiddleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/authMiddleware.js";

const bookRouter = express.Router();

// Public routes
bookRouter.get("/", getAllBooks);
bookRouter.get("/categories/list", getBookCategories);
bookRouter.get("/:id", getBookById);

// Admin routes
bookRouter.post("/", verifyJWT, verifyAdmin, uploadBookFiles, createBook);
bookRouter.put("/:id", verifyJWT, verifyAdmin, uploadBookFiles, updateBook);
bookRouter.delete("/:id", verifyJWT, verifyAdmin, deleteBook);

export default bookRouter;
