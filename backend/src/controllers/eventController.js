import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import transporter from "../config/nodemailer.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      endTime,
      location,
      speaker,
      category,
      capacity,
      isRegistrationRequired,
      registrationDeadline,
      featured,
    } = req.body;

    // Upload image to cloudinary if file exists
    let image = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "cuet-mosque-events",
        use_filename: true,
      });

      fs.unlinkSync(req.file.path);

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      endTime,
      location,
      speaker,
      category,
      capacity: capacity || null,
      isRegistrationRequired: isRegistrationRequired === "true",
      registrationDeadline: registrationDeadline || null,
      featured: featured === "true",
      image,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all events (public)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      featured,
      search,
    } = req.query;

    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // By default, show upcoming and ongoing events
      query.status = { $in: ["upcoming", "ongoing"] };
    }

    // Filter featured
    if (featured === "true") {
      query.featured = true;
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const events = await Event.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get registration count
    const registrations = await EventRegistration.find({ event: event._id });

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        registrations,
        registeredCount: registrations.length,
      },
    });
  } catch (error) {
    console.error("Get event by id error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    let updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      // Delete old image from cloudinary
      if (event.image?.public_id) {
        await cloudinary.uploader.destroy(event.image.public_id);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "cuet-mosque-events",
        use_filename: true,
      });

      fs.unlinkSync(req.file.path);

      updateData.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Convert string booleans to actual booleans
    if (updateData.isRegistrationRequired !== undefined) {
      updateData.isRegistrationRequired =
        updateData.isRegistrationRequired === "true";
    }
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === "true";
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Delete image from cloudinary
    if (event.image?.public_id) {
      await cloudinary.uploader.destroy(event.image.public_id);
    }

    // Delete all registrations for this event
    await EventRegistration.deleteMany({ event: event._id });

    await event.deleteOne();

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is upcoming
    if (event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Registration is only available for upcoming events",
      });
    }

    // Check registration deadline
    if (
      event.registrationDeadline &&
      new Date(event.registrationDeadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({
      event: eventId,
      user: userId,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Check capacity
    if (event.capacity && event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Create registration
    const registration = await EventRegistration.create({
      event: eventId,
      user: userId,
      name: req.user.name || req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    });

    // Update registered count
    event.registeredCount += 1;
    await event.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: req.user.email,
      subject: `Registration Confirmed: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #047857;">Registration Confirmed!</h2>
          <p>Dear ${req.user.name || req.user.fullName},</p>
          <p>You have successfully registered for:</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #047857; margin: 0;">${event.title}</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
          </div>
          <p>We look forward to seeing you there!</p>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">CUET Central Mosque</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error("Error sending registration email:", err);
    });

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's registered events
// @route   GET /api/events/my-registrations
// @access  Private
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user._id })
      .populate("event")
      .sort("-registeredAt");

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Get my registrations error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/events/registration/:id
// @access  Private
export const cancelRegistration = async (req, res) => {
  try {
    const registration = await EventRegistration.findById(
      req.params.id,
    ).populate("event");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if user owns this registration
    if (
      registration.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Update event registered count
    if (registration.event) {
      registration.event.registeredCount -= 1;
      await registration.event.save();
    }

    await registration.deleteOne();

    res.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get event registrations (admin)
// @route   GET /api/events/:id/registrations
// @access  Private/Admin
export const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.id })
      .populate("user", "name email phone")
      .sort("-registeredAt");

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Get event registrations error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
