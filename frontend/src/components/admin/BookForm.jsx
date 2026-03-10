import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBookStore } from "../../stores/useBookStore";
import { BookOpen, Upload, X, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const BookForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentBook, loading, createBook, updateBook, getBookById } =
    useBookStore();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationYear: "",
    category: "General",
    language: "Bengali",
    description: "",
    quantity: "1",
    ownerHall: {
      hallName: "",
      hallQuantity: "",
      libraryLocation: "",
    },
  });

  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
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
  ];

  const languages = ["Bengali", "English", "Arabic", "Urdu", "Other"];

  useEffect(() => {
    if (isEditMode && id) {
      getBookById(id);
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentBook) {
      setFormData({
        title: currentBook.title || "",
        author: currentBook.author || "",
        isbn: currentBook.isbn || "",
        publisher: currentBook.publisher || "",
        publicationYear: currentBook.publicationYear || "",
        category: currentBook.category || "General",
        language: currentBook.language || "Bengali",
        description: currentBook.description || "",
        quantity: String(currentBook.quantity || 1),
        ownerHall: {
          hallName: currentBook.ownerHall?.hallName || "",
          hallQuantity: currentBook.ownerHall?.hallQuantity || "",
          libraryLocation: currentBook.ownerHall?.libraryLocation || "",
        },
      });
      if (currentBook.coverImage?.url) {
        setImagePreview(currentBook.coverImage.url);
      }
    }
  }, [currentBook, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.author || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submitData = new FormData();

    // Append all basic fields
    submitData.append("title", formData.title);
    submitData.append("author", formData.author);
    submitData.append("isbn", formData.isbn || "");
    submitData.append("publisher", formData.publisher || "");
    submitData.append("publicationYear", formData.publicationYear || "");
    submitData.append("category", formData.category);
    submitData.append("language", formData.language);
    submitData.append("description", formData.description || "");

    submitData.append("quantity", parseInt(formData.quantity, 10));

    // Append ownerHall as a JSON string
    submitData.append("ownerHall", JSON.stringify(formData.ownerHall));

    // Append image if selected
    if (coverImage) {
      submitData.append("coverImage", coverImage);
    }

    if (isEditMode) {
      await updateBook(id, submitData, navigate);
    } else {
      await createBook(submitData, navigate);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/books")}
              className="p-2 hover:bg-emerald-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-emerald-700" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              {isEditMode ? "Edit Book" : "Add New Book"}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Year
                </label>
                <input
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  min="1000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
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
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current value: {formData.quantity} (Type:{" "}
                  {typeof formData.quantity})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                          setCoverImage(null);
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

          {/* Description - Full Width */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter book description..."
            ></textarea>
          </div>

          {/* Owner Hall Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Owner Hall
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hall Name
                </label>
                <input
                  type="text"
                  name="ownerHall.hallName"
                  value={formData.ownerHall.hallName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Main Hall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hall Quantity
                </label>
                <input
                  type="text"
                  name="ownerHall.hallQuantity"
                  value={formData.ownerHall.hallQuantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., 10 copies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Library Location
                </label>
                <input
                  type="text"
                  name="ownerHall.libraryLocation"
                  value={formData.ownerHall.libraryLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., 2nd Floor"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/books")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : isEditMode ? "Update Book" : "Save Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
