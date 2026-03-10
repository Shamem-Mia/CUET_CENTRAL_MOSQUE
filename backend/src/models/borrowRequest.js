import mongoose from "mongoose";

const borrowRequestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    issueDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "borrowed",
        "returned",
        "overdue",
      ],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
borrowRequestSchema.index({ user: 1, status: 1 });
borrowRequestSchema.index({ book: 1, status: 1 });
borrowRequestSchema.index({ dueDate: 1 });

const BorrowRequest = mongoose.model("BorrowRequest", borrowRequestSchema);
export default BorrowRequest;
