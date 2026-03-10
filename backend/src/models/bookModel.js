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
    isbn: {
      type: String,
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    publicationYear: {
      type: Number,
    },
    category: {
      type: String,
      required: [true, "Book category is required"],
      enum: [
        "Quran",
        "Hadith",
        "Tafsir",
        "Fiqh",
        "Seerah",
        "Islamic History",
        "Arabic",
        "General",
        "Children",
        "Other",
      ],
    },
    language: {
      type: String,
      default: "Bengali",
      enum: ["Bengali", "English", "Arabic", "Urdu", "Other"],
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    ownerHall: {
      hallName: String,
      quantity: String,
      libraryLocation: String,
    },
    coverImage: {
      public_id: String,
      url: String,
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

const Book = mongoose.model("Book", bookSchema);
export default Book;
