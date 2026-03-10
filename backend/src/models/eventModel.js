import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    endTime: {
      type: String,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    speaker: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Prayer",
        "Lecture",
        "Quran Class",
        "Hadith Class",
        "Youth Program",
        "Community",
        "Workshop",
        "Seminar",
        "Other",
      ],
      default: "Other",
    },
    image: {
      public_id: String,
      url: String,
    },
    capacity: {
      type: Number,
      min: 0,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isRegistrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ featured: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;
