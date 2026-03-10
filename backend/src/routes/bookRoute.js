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

bookRouter
  .route("/")
  .post(authUser, admin, upload.single("coverImage"), createBook)
  .get(authUser, admin, getBooks);

bookRouter
  .route("/:id")
  .get(authUser, admin, getBookById)
  .put(authUser, admin, upload.single("coverImage"), updateBook)
  .delete(authUser, admin, deleteBook);

export default bookRouter;
