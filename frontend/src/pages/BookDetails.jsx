import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookStore } from "../stores/useBookStore";
import { useBorrowStore } from "../stores/useBorrowStore";
import { useAuthStore } from "../stores/useAuthStore";
import {
  BookOpen,
  Calendar,
  User,
  Hash,
  Building2,
  MapPin,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentBook, getBookById, loading: bookLoading } = useBookStore();
  const {
    createRequest,
    myRequests,
    getMyRequests,
    loading: requestLoading,
  } = useBorrowStore();

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestNotes, setRequestNotes] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [previousRequests, setPreviousRequests] = useState([]);

  useEffect(() => {
    getBookById(id);
    getMyRequests();
  }, [id]);

  useEffect(() => {
    if (myRequests && currentBook) {
      // Find active request (pending, approved, borrowed)
      const active = myRequests.find(
        (req) =>
          req.book?._id === currentBook._id &&
          ["pending", "approved", "borrowed"].includes(req.status),
      );

      // Find previous/completed requests (returned, rejected, overdue)
      const previous = myRequests.filter(
        (req) =>
          req.book?._id === currentBook._id &&
          ["returned", "rejected", "overdue"].includes(req.status),
      );

      setActiveRequest(active);
      setPreviousRequests(previous);
    }
  }, [myRequests, currentBook]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    // Check if there's already an active request
    if (activeRequest) {
      toast.error("You already have an active request for this book");
      setShowRequestForm(false);
      return;
    }

    await createRequest(currentBook._id, requestNotes);
    setShowRequestForm(false);
    setRequestNotes("");
    getMyRequests(); // Refresh requests
    toast.success("Request submitted successfully!");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Rejected",
      },
      borrowed: {
        color: "bg-blue-100 text-blue-800",
        icon: BookOpen,
        label: "Borrowed",
      },
      returned: {
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
        label: "Returned",
      },
      overdue: {
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        label: "Overdue",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const canRequest = () => {
    if (!currentBook) return false;
    if (currentBook.availableQuantity <= 0) return false;
    if (activeRequest) return false; // Can't request if there's an active request
    return true;
  };

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-emerald-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Book Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The book you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/books")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Hero Section with Book Cover */}
      <div className="bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Book Cover */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {currentBook.coverImage?.url ? (
                  <img
                    src={currentBook.coverImage.url}
                    alt={currentBook.title}
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 bg-emerald-100 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {currentBook.title}
              </h1>
              <p className="text-xl text-emerald-100 mb-4">
                by {currentBook.author}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-emerald-200 text-sm">Category</p>
                  <p className="font-medium">{currentBook.category}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">Language</p>
                  <p className="font-medium">{currentBook.language}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">ISBN</p>
                  <p className="font-medium">{currentBook.isbn || "N/A"}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">Publisher</p>
                  <p className="font-medium">
                    {currentBook.publisher || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">Year</p>
                  <p className="font-medium">
                    {currentBook.publicationYear || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">Available</p>
                  <p className="font-medium">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        currentBook.availableQuantity > 0
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      {currentBook.availableQuantity} / {currentBook.quantity}
                    </span>
                  </p>
                </div>
              </div>

              {/* Active Request Status */}
              {activeRequest && (
                <div className="bg-emerald-800 rounded-lg p-4 mb-4">
                  <p className="text-emerald-100 mb-2">
                    Current Request Status:
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(activeRequest.status)}
                    <span className="text-sm text-emerald-200">
                      Requested on:{" "}
                      {new Date(activeRequest.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                  {activeRequest.status === "approved" && (
                    <div className="mt-3 text-sm text-emerald-200">
                      <p>Please visit the library to collect your book.</p>
                      {activeRequest.dueDate && (
                        <p className="mt-1">
                          Due Date:{" "}
                          {new Date(activeRequest.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  {activeRequest.status === "borrowed" && (
                    <div className="mt-3 text-sm text-emerald-200">
                      <p>You have borrowed this book.</p>
                      {activeRequest.dueDate && (
                        <p className="mt-1">
                          Due Date:{" "}
                          {new Date(activeRequest.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Request Button */}
              <button
                onClick={() => setShowRequestForm(true)}
                disabled={!canRequest()}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  canRequest()
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-gray-400 cursor-not-allowed text-gray-200"
                }`}
              >
                {!currentBook.availableQuantity
                  ? "Not Available"
                  : activeRequest
                    ? "Already Requested"
                    : "Request to Borrow"}
              </button>

              {/* Previous Requests History */}
              {previousRequests.length > 0 && (
                <div className="mt-6">
                  <p className="text-emerald-100 text-sm mb-2">
                    Previous Requests:
                  </p>
                  <div className="space-y-2">
                    {previousRequests.slice(0, 3).map((req) => (
                      <div
                        key={req._id}
                        className="flex items-center gap-3 text-sm"
                      >
                        {getStatusBadge(req.status)}
                        <span className="text-emerald-200">
                          {new Date(req.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {previousRequests.length > 3 && (
                      <p className="text-xs text-emerald-300">
                        +{previousRequests.length - 3} more requests
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Request to Borrow
            </h2>

            {activeRequest && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  You already have an active {activeRequest.status} request for
                  this book.
                </p>
              </div>
            )}

            <form onSubmit={handleRequestSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book: <span className="font-normal">{currentBook.title}</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Information
                </label>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {user?.fullName || user?.name}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {user?.email}
                  </p>
                  {user?.phone && (
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your phone number and other info
                </label>
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Any special requests or notes..."
                  disabled={!!activeRequest}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={requestLoading || !!activeRequest}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {requestLoading ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-4">
              Note: You can only have one active request per book at a time. You
              can request again after returning or if your request is rejected.
            </p>
          </div>
        </div>
      )}

      {/* Description Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {currentBook.description || "No description available."}
          </p>
        </div>
      </div>

      {/* Owner Hall Information */}
      {currentBook.ownerHall && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Owner Hall Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentBook.ownerHall.hallName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">
                    Hall: {currentBook.ownerHall.hallName}
                  </span>
                </div>
              )}
              {currentBook.ownerHall.hallQuantity && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">
                    Quantity: {currentBook.ownerHall.hallQuantity}
                  </span>
                </div>
              )}
              {currentBook.ownerHall.libraryLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">
                    Location: {currentBook.ownerHall.libraryLocation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
