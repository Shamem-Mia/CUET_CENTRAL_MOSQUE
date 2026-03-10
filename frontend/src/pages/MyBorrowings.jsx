import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBorrowStore } from "../stores/useBorrowStore";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MyBorrowings = () => {
  const { myRequests, getMyRequests, loading } = useBorrowStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getMyRequests();
  }, []);

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

  const filteredRequests =
    filter === "all"
      ? myRequests
      : myRequests.filter((req) => req.status === filter);

  const stats = {
    pending: myRequests.filter((r) => r.status === "pending").length,
    approved: myRequests.filter((r) => r.status === "approved").length,
    borrowed: myRequests.filter((r) => r.status === "borrowed").length,
    overdue: myRequests.filter((r) => r.status === "overdue").length,
    returned: myRequests.filter((r) => r.status === "returned").length,
    total: myRequests.length,
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
            My Borrowings
          </h1>
          <p className="text-emerald-600 mt-1">
            Track your book requests and borrowings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.borrowed}</p>
            <p className="text-xs text-gray-500">Borrowed</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.returned}</p>
            <p className="text-xs text-gray-500">Returned</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {[
              "pending",
              "approved",
              "borrowed",
              "overdue",
              "returned",
              "rejected",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  filter === status
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No borrowings found
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "You haven't borrowed any books yet"
                  : `No ${filter} requests found`}
              </p>
              <Link
                to="/books"
                className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Book Image */}
                    <div className="flex-shrink-0 w-full md:w-20">
                      {request.book?.coverImage?.url ? (
                        <img
                          src={request.book.coverImage.url}
                          alt={request.book.title}
                          className="w-full md:w-20 h-28 md:h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full md:w-20 h-28 md:h-20 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <Link
                            to={`/books/${request.book?._id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-emerald-700 transition"
                          >
                            {request.book?.title}
                          </Link>
                          <p className="text-sm text-gray-600">
                            by {request.book?.author}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Request Details */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Requested:{" "}
                            {new Date(request.requestDate).toLocaleDateString()}
                          </span>
                        </div>

                        {request.issueDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Issued:{" "}
                              {new Date(request.issueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {request.dueDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              Due:{" "}
                              {new Date(request.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {request.returnDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Returned:{" "}
                              {new Date(
                                request.returnDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {request.notes && (
                        <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Notes:</span>{" "}
                          {request.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBorrowings;
