import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEventStore } from "../../stores/useEventStore";
import {
  Calendar,
  Upload,
  X,
  Save,
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentEvent, loading, createEvent, updateEvent, getEventById } =
    useEventStore();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    speaker: "",
    category: "Other",
    capacity: "",
    isRegistrationRequired: false,
    registrationDeadline: "",
    featured: false,
    status: "upcoming",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    "Prayer",
    "Lecture",
    "Quran Class",
    "Hadith Class",
    "Youth Program",
    "Community",
    "Workshop",
    "Seminar",
    "Other",
  ];

  const statuses = ["upcoming", "ongoing", "completed", "cancelled"];

  useEffect(() => {
    if (isEditMode && id) {
      getEventById(id);
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentEvent) {
      setFormData({
        title: currentEvent.title || "",
        description: currentEvent.description || "",
        date: currentEvent.date ? currentEvent.date.split("T")[0] : "",
        time: currentEvent.time || "",
        endTime: currentEvent.endTime || "",
        location: currentEvent.location || "",
        speaker: currentEvent.speaker || "",
        category: currentEvent.category || "Other",
        capacity: currentEvent.capacity || "",
        isRegistrationRequired: currentEvent.isRegistrationRequired || false,
        registrationDeadline: currentEvent.registrationDeadline
          ? currentEvent.registrationDeadline.split("T")[0]
          : "",
        featured: currentEvent.featured || false,
        status: currentEvent.status || "upcoming",
      });
      if (currentEvent.image?.url) {
        setImagePreview(currentEvent.image.url);
      }
    }
  }, [currentEvent, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submitData = new FormData();

    // Append all form fields
    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key] !== ""
      ) {
        submitData.append(key, formData[key]);
      }
    });

    // Append image if selected
    if (image) {
      submitData.append("image", image);
    }

    if (isEditMode) {
      await updateEvent(id, submitData, navigate);
    } else {
      await createEvent(submitData, navigate);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/events")}
            className="p-2 hover:bg-emerald-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-700" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
            {isEditMode ? "Edit Event" : "Create New Event"}
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker
                </label>
                <input
                  type="text"
                  name="speaker"
                  value={formData.speaker}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Sheikh Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Maximum attendees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isRegistrationRequired"
                    id="isRegistrationRequired"
                    checked={formData.isRegistrationRequired}
                    onChange={handleChange}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="isRegistrationRequired"
                    className="text-sm text-gray-700"
                  >
                    Require registration
                  </label>
                </div>

                {formData.isRegistrationRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Deadline
                    </label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      max={formData.date}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Feature this event
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview("");
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span>{imagePreview ? "Change" : "Upload"} Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Event"
                  : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
