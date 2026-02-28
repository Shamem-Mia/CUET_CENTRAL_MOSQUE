import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Book description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Book category is required"],
      enum: [
        "Tafsir",
        "Hadith",
        "Aqeedah",
        "Fiqh",
        "Seerah",
        "Islamic History",
        "Arabic Language",
        "Other",
      ],
      default: "Other",
    },
    publicationYear: {
      type: Number,
    },
    publisher: {
      type: String,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    pages: {
      type: Number,
    },
    language: {
      type: String,
      default: "Bengali",
      enum: ["Bengali", "English", "Arabic", "Urdu", "Other"],
    },
    bookCover: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    pdfFile: {
      public_id: String,
      url: String,
    },
    availableCopies: {
      type: Number,
      default: 1,
      min: 0,
    },
    totalCopies: {
      type: Number,
      default: 1,
      min: 1,
    },
    location: {
      type: String,
      default: "Main Library",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add text index for search functionality
bookSchema.index({ title: "text", author: "text", description: "text" });

const Book = mongoose.model("Book", bookSchema);
export default Book;
