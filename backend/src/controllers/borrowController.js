import BorrowRequest from "../models/borrowRequest.js";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// @desc    Create a borrow request
// @route   POST /api/borrow/request
// @access  Private
export const createBorrowRequest = async (req, res) => {
  try {
    const { bookId, notes } = req.body;
    const userId = req.user._id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book is available
    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is not available for borrowing",
      });
    }

    // Check if user already has a pending request for this book
    const existingRequest = await BorrowRequest.findOne({
      book: bookId,
      user: userId,
      status: { $in: ["pending", "approved", "borrowed"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending or active request for this book",
      });
    }

    // Check user's borrowing limit (e.g., max 3 books at a time)
    const activeBorrows = await BorrowRequest.countDocuments({
      user: userId,
      status: { $in: ["borrowed", "approved"] },
    });

    if (activeBorrows >= 3) {
      return res.status(400).json({
        success: false,
        message: "You have reached the maximum borrowing limit (3 books)",
      });
    }

    // Create borrow request
    const borrowRequest = await BorrowRequest.create({
      book: bookId,
      user: userId,
      notes,
      status: "pending",
    });

    // Populate book and user details
    await borrowRequest.populate([
      { path: "book", select: "title author coverImage category" },
      { path: "user", select: "name email" },
    ]);

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: adminEmail,
      subject: "New Book Borrow Request - CUET Central Mosque",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #047857; margin: 0;">CUET Central Mosque Library</h1>
          <p style="color: #666;">New Borrow Request</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0;">Request Details</h2>
          
          <p><strong>Book:</strong> ${borrowRequest.book.title}</p>
          <p><strong>Author:</strong> ${borrowRequest.book.author}</p>
          <p><strong>Category:</strong> ${borrowRequest.book.category}</p>
          
          <h3 style="color: #333; margin-top: 20px;">User Information</h3>
          <p><strong>Name:</strong> ${borrowRequest.user.name}</p>
          <p><strong>Email:</strong> ${borrowRequest.user.email}</p>
          
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          
          <p><strong>Request Date:</strong> ${new Date(borrowRequest.requestDate).toLocaleString()}</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          <p>This is an automated message from CUET Central Mosque Library System.</p>
        </div>
      </div>
      `,
    };

    // Send email (don't await - let it run in background)
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending borrow request email:", err);
      } else {
        console.log("Borrow request email sent to admin");
      }
    });

    res.status(201).json({
      success: true,
      message: "Borrow request submitted successfully",
      data: borrowRequest,
    });
  } catch (error) {
    console.error("Create borrow request error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's borrow requests
// @route   GET /api/borrow/my-requests
// @access  Private
export const getMyBorrowRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ user: req.user._id })
      .populate("book", "title author coverImage category isbn")
      .sort("-createdAt");

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get my borrow requests error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all borrow requests (admin)
// @route   GET /api/borrow/all
// @access  Private/Admin
export const getAllBorrowRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const requests = await BorrowRequest.find(query)
      .populate("book", "title author coverImage category isbn quantity")
      .populate("user", "name email phone")
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BorrowRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get all borrow requests error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve borrow request and set issue date
// @route   PUT /api/borrow/approve/:id
// @access  Private/Admin
export const approveBorrowRequest = async (req, res) => {
  try {
    const { issueDate, dueDate } = req.body;
    const requestId = req.params.id;

    const request = await BorrowRequest.findById(requestId)
      .populate("book")
      .populate("user", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    // Check book availability
    if (request.book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is not available",
      });
    }

    // Update book quantity
    request.book.availableQuantity -= 1;
    await request.book.save();

    // Update request
    request.status = "approved";
    request.issueDate = issueDate || new Date();
    request.dueDate =
      dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default
    await request.save();

    // Send approval email to user
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: request.user.email,
      subject: "Book Request Approved - CUET Central Mosque",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #047857; margin: 0;">CUET Central Mosque Library</h1>
          <p style="color: #666;">Request Approved</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px;">
          <h2 style="color: #047857; margin-top: 0;">Your Request Has Been Approved!</h2>
          
          <p><strong>Book:</strong> ${request.book.title}</p>
          <p><strong>Author:</strong> ${request.book.author}</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue Date:</strong> ${new Date(request.issueDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(request.dueDate).toLocaleDateString()}</p>
          </div>
          
          <p>Please visit the library to collect your book.</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          <p>Thank you for using CUET Central Mosque Library.</p>
        </div>
      </div>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error("Error sending approval email:", err);
    });

    res.json({
      success: true,
      message: "Request approved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Approve borrow request error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark as borrowed (when user picks up the book)
// @route   PUT /api/borrow/borrow/:id
// @access  Private/Admin
export const markAsBorrowed = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await BorrowRequest.findById(requestId)
      .populate("book")
      .populate("user", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Request must be approved first",
      });
    }

    request.status = "borrowed";
    await request.save();

    res.json({
      success: true,
      message: "Book marked as borrowed",
      data: request,
    });
  } catch (error) {
    console.error("Mark as borrowed error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Return book
// @route   PUT /api/borrow/return/:id
// @access  Private/Admin
export const returnBook = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await BorrowRequest.findById(requestId).populate("book");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "borrowed" && request.status !== "overdue") {
      return res.status(400).json({
        success: false,
        message: "Book is not currently borrowed",
      });
    }

    // Update book quantity
    request.book.availableQuantity += 1;
    await request.book.save();

    // Update request
    request.status = "returned";
    request.returnDate = new Date();
    await request.save();

    // Send return confirmation email to user
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: request.user?.email || request.user,
      subject: "Book Returned - CUET Central Mosque",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #047857; margin: 0;">CUET Central Mosque Library</h1>
          <p style="color: #666;">Book Return Confirmation</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0;">Book Returned Successfully</h2>
          
          <p><strong>Book:</strong> ${request.book.title}</p>
          <p><strong>Author:</strong> ${request.book.author}</p>
          <p><strong>Return Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <p style="margin-top: 20px;">Thank you for returning the book on time.</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          <p>We hope you enjoyed reading!</p>
        </div>
      </div>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error("Error sending return confirmation email:", err);
    });

    res.json({
      success: true,
      message: "Book returned successfully",
      data: request,
    });
  } catch (error) {
    console.error("Return book error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject borrow request
// @route   PUT /api/borrow/reject/:id
// @access  Private/Admin
export const rejectBorrowRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const requestId = req.params.id;

    const request = await BorrowRequest.findById(requestId)
      .populate("book")
      .populate("user", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only reject pending requests",
      });
    }

    request.status = "rejected";
    request.notes = reason || request.notes;
    await request.save();

    // Send rejection email to user
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: request.user.email,
      subject: "Book Request Update - CUET Central Mosque",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #047857; margin: 0;">CUET Central Mosque Library</h1>
          <p style="color: #666;">Request Status Update</p>
        </div>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc2626; margin-top: 0;">Request Rejected</h2>
          
          <p><strong>Book:</strong> ${request.book.title}</p>
          <p><strong>Author:</strong> ${request.book.author}</p>
          
          ${
            reason
              ? `
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          `
              : ""
          }
          
          <p>If you have any questions, please contact the library administration.</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          <p>Thank you for your interest in our library.</p>
        </div>
      </div>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error("Error sending rejection email:", err);
    });

    res.json({
      success: true,
      message: "Request rejected successfully",
      data: request,
    });
  } catch (error) {
    console.error("Reject borrow request error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user borrowing history
// @route   GET /api/borrow/user/:userId/history
// @access  Private/Admin
export const getUserBorrowingHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("name email phone");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requests = await BorrowRequest.find({ user: userId })
      .populate("book", "title author category")
      .sort("-createdAt");

    // Calculate statistics
    const stats = {
      totalBorrowed: requests.filter(
        (r) =>
          r.status === "borrowed" ||
          r.status === "returned" ||
          r.status === "overdue",
      ).length,
      currentlyBorrowed: requests.filter((r) => r.status === "borrowed").length,
      overdue: requests.filter((r) => r.status === "overdue").length,
      returned: requests.filter((r) => r.status === "returned").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
      pending: requests.filter((r) => r.status === "pending").length,
    };

    res.json({
      success: true,
      data: {
        user,
        requests,
        stats,
      },
    });
  } catch (error) {
    console.error("Get user borrowing history error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check and update overdue books (cron job)
// @route   POST /api/borrow/check-overdue
// @access  Private/Admin (or run as cron job)
export const checkOverdueBooks = async (req, res) => {
  try {
    const now = new Date();

    // Find all borrowed books that are past due date
    const overdueRequests = await BorrowRequest.find({
      status: "borrowed",
      dueDate: { $lt: now },
    })
      .populate("user", "name email")
      .populate("book", "title author");

    let updatedCount = 0;
    let emailSuccessCount = 0;
    let emailFailCount = 0;

    for (const request of overdueRequests) {
      request.status = "overdue";
      await request.save();
      updatedCount++;

      // Send overdue notification if not already sent
      if (!request.reminderSent) {
        try {
          // Use your email transporter
          const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: request.user.email,
            subject: "⚠️ Overdue Book Notification - CUET Central Mosque",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #dc2626; margin: 0;">CUET Central Mosque Library</h1>
                <p style="color: #666;">Overdue Book Notification</p>
              </div>
              
              <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px;">
                <h2 style="color: #dc2626; margin-top: 0;">⚠️ Your Book is Overdue</h2>
                
                <p><strong>Book:</strong> ${request.book.title}</p>
                <p><strong>Author:</strong> ${request.book.author}</p>
                
                <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Due Date was:</strong> ${new Date(request.dueDate).toLocaleDateString()}</p>
                </div>
                
                <p>Please return the book immediately to avoid further penalties.</p>
              </div>
              
              <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
                <p>Please return the book as soon as possible.</p>
              </div>
            </div>
            `,
          };

          // Use your transporter (import it)
          const transporter = (await import("../config/nodemailer.js")).default;
          await transporter.sendMail(mailOptions);

          request.reminderSent = true;
          request.reminderSentAt = now;
          await request.save();
          emailSuccessCount++;
        } catch (emailError) {
          console.error(
            `Failed to send overdue email for request ${request._id}:`,
            emailError,
          );
          emailFailCount++;
          // Continue processing other requests even if email fails
        }
      }
    }

    res.json({
      success: true,
      message: `Checked overdue books: ${updatedCount} updated`,
      data: {
        total: updatedCount,
        emailsSent: emailSuccessCount,
        emailsFailed: emailFailCount,
      },
    });
  } catch (error) {
    console.error("Check overdue books error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete borrow request
// @route   DELETE /api/borrow/:id
// @access  Private/Admin
export const deleteBorrowRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await BorrowRequest.findById(requestId)
      .populate("book")
      .populate("user", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check if request can be deleted (only non-active requests)
    const deletableStatuses = ["rejected", "returned", "overdue"];
    if (!deletableStatuses.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete request with status: ${request.status}. Only rejected, returned, or overdue requests can be deleted.`,
      });
    }

    // If book was borrowed, make sure quantity is restored before deletion
    if (request.status === "borrowed" || request.status === "overdue") {
      // This should not happen due to the check above, but just in case
      if (request.book) {
        request.book.availableQuantity += 1;
        await request.book.save();
      }
    }

    // Delete the request
    await BorrowRequest.findByIdAndDelete(requestId);

    // Optional: Send email notification about deletion
    // You can add email notification here if needed

    res.json({
      success: true,
      message: "Borrow request deleted successfully",
    });
  } catch (error) {
    console.error("Delete borrow request error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users who have borrowed books
// @route   GET /api/borrow/borrowers
// @access  Private/Admin
export const getAllBorrowers = async (req, res) => {
  try {
    // Find all unique users who have borrow requests
    const borrowers = await BorrowRequest.aggregate([
      {
        $group: {
          _id: "$user",
          totalRequests: { $sum: 1 },
          activeRequests: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["pending", "approved", "borrowed", "overdue"],
                  ],
                },
                1,
                0,
              ],
            },
          },
          completedRequests: {
            $sum: {
              $cond: [{ $in: ["$status", ["returned", "rejected"]] }, 1, 0],
            },
          },
          lastRequestDate: { $max: "$createdAt" },
          booksBorrowed: { $addToSet: "$book" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
          phone: "$userInfo.phone",
          totalRequests: 1,
          activeRequests: 1,
          completedRequests: 1,
          lastRequestDate: 1,
          booksCount: { $size: "$booksBorrowed" },
        },
      },
      {
        $sort: { lastRequestDate: -1 },
      },
    ]);

    res.json({
      success: true,
      data: borrowers,
    });
  } catch (error) {
    console.error("Get all borrowers error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
