import express from "express";
import {
  createBorrowRequest,
  getMyBorrowRequests,
  getAllBorrowRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  markAsBorrowed,
  returnBook,
  getUserBorrowingHistory,
  checkOverdueBooks,
  deleteBorrowRequest,
  getAllBorrowers,
} from "../controllers/borrowController.js";
import authUser from "../middlewares/userAuth.js";
import admin from "../middlewares/adminMiddleware.js";
const borrowRouter = express.Router();

// User routes
borrowRouter.post("/request", authUser, createBorrowRequest);
borrowRouter.get("/my-requests", authUser, getMyBorrowRequests);

// Admin routes
borrowRouter.get("/all", authUser, admin, getAllBorrowRequests);
borrowRouter.put("/approve/:id", authUser, admin, approveBorrowRequest);
borrowRouter.put("/reject/:id", authUser, admin, rejectBorrowRequest);
borrowRouter.put("/borrow/:id", authUser, admin, markAsBorrowed);
borrowRouter.put("/return/:id", authUser, admin, returnBook);
borrowRouter.delete("/:id", authUser, admin, deleteBorrowRequest);
borrowRouter.get(
  "/user/:userId/history",
  authUser,
  admin,
  getUserBorrowingHistory,
);
borrowRouter.post("/check-overdue", authUser, admin, checkOverdueBooks);
borrowRouter.get("/borrowers", authUser, admin, getAllBorrowers);

export default borrowRouter;
