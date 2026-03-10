import Book from "../models/bookModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      publisher,
      publicationYear,
      category,
      language,
      description,
      quantity,
      ownerHall, // Changed from location to ownerHall
    } = req.body;

    // Parse ownerHall if it's a string
    let parsedOwnerHall = {};
    if (ownerHall) {
      try {
        parsedOwnerHall =
          typeof ownerHall === "string" ? JSON.parse(ownerHall) : ownerHall;
      } catch (e) {
        console.error("Error parsing ownerHall:", e);
      }
    }

    // Upload image to cloudinary if file exists
    let coverImage = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "cuet-mosque-library/books",
        use_filename: true,
      });

      // Delete file from local uploads
      fs.unlinkSync(req.file.path);

      coverImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const bookData = {
      title,
      author,
      isbn: isbn || "",
      publisher: publisher || "",
      publicationYear: publicationYear || null,
      category,
      language: language || "Bengali",
      description: description || "",
      quantity: parseInt(quantity) || 1,
      availableQuantity: parseInt(quantity) || 1,
      ownerHall: parsedOwnerHall,
      coverImage,
      createdBy: req.user._id,
    };

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all books
// @route   GET /api/books
// @access  Private/Admin
export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const books = await Book.find(query)
      .populate("createdBy", "name email")
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private/Admin
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Get book by id error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    let updateData = { ...req.body };

    // Handle ownerHall if it's a string
    if (updateData.ownerHall && typeof updateData.ownerHall === "string") {
      try {
        updateData.ownerHall = JSON.parse(updateData.ownerHall);
      } catch (e) {
        console.error("Error parsing ownerHall:", e);
      }
    }

    // Handle quantity conversion
    if (updateData.quantity) {
      updateData.quantity = parseInt(updateData.quantity);
      // Also update availableQuantity if needed
      if (!updateData.availableQuantity) {
        updateData.availableQuantity = parseInt(updateData.quantity);
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from cloudinary
      if (book.coverImage?.public_id) {
        await cloudinary.uploader.destroy(book.coverImage.public_id);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "cuet-mosque-library/books",
        use_filename: true,
      });

      fs.unlinkSync(req.file.path);

      updateData.coverImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Delete image from cloudinary
    if (book.coverImage?.public_id) {
      await cloudinary.uploader.destroy(book.coverImage.public_id);
    }

    await book.deleteOne();

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
