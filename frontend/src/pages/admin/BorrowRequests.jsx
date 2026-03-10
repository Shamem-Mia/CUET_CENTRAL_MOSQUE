import { useState, useEffect } from "react";
import { useBorrowStore } from "../../stores/useBorrowStore";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const BorrowRequests = () => {
  const {
    allRequests,
    loading,
    totalPages,
    currentPage,
    getAllRequests,
    approveRequest,
    rejectRequest,
    markAsBorrowed,
    returnBook,
    checkOverdue,
    deleteRequest, // Make sure this exists in your store
  } = useBorrowStore();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [filter, setFilter] = useState("pending");
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    getAllRequests(1, filter);
  }, [filter]);

  const handlePageChange = (newPage) => {
    getAllRequests(newPage, filter);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    await approveRequest(selectedRequest._id, issueDate, dueDate);
    setShowApproveModal(false);
    setSelectedRequest(null);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    await rejectRequest(selectedRequest._id, rejectReason);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    if (
      window.confirm(
        `Are you sure you want to delete this request for "${selectedRequest.book?.title}"? This action cannot be undone.`,
      )
    ) {
      await deleteRequest(selectedRequest._id);
      setShowDeleteModal(false);
      setSelectedRequest(null);
    }
  };

  const handleMarkAsBorrowed = async (requestId) => {
    if (window.confirm("Mark this book as borrowed?")) {
      await markAsBorrowed(requestId);
    }
  };

  const handleReturn = async (requestId) => {
    if (window.confirm("Mark this book as returned?")) {
      await returnBook(requestId);
    }
  };

  const handleCheckOverdue = async () => {
    if (window.confirm("Check for overdue books?")) {
      await checkOverdue();
    }
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

  const canDelete = (status) => {
    // Allow deletion of rejected, returned, or overdue requests
    return ["rejected", "returned", "overdue"].includes(status);
  };

  const getActionButtons = (request) => {
    return (
      <div className="flex items-center gap-2">
        {/* View Details Button */}
        <button
          onClick={() => {
            setSelectedRequest(request);
            setShowDetailsModal(true);
          }}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Status-specific action buttons */}
        {request.status === "pending" && (
          <>
            <button
              onClick={() => {
                setSelectedRequest(request);
                setShowApproveModal(true);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Approve"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedRequest(request);
                setShowRejectModal(true);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Reject"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}

        {request.status === "approved" && (
          <button
            onClick={() => handleMarkAsBorrowed(request._id)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            title="Mark as Borrowed"
          >
            Borrow
          </button>
        )}

        {(request.status === "borrowed" || request.status === "overdue") && (
          <button
            onClick={() => handleReturn(request._id)}
            className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
            title="Return Book"
          >
            Return
          </button>
        )}

        {/* Delete Button - Only for certain statuses */}
        {canDelete(request.status) && (
          <button
            onClick={() => {
              setSelectedRequest(request);
              setShowDeleteModal(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete Request"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              Borrow Requests Management
            </h1>
            <p className="text-emerald-600 mt-1">
              Manage all book borrowing requests
            </p>
          </div>
          <button
            onClick={handleCheckOverdue}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Check Overdue Books
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              "pending",
              "approved",
              "borrowed",
              "overdue",
              "returned",
              "rejected",
              "all",
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

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
            </div>
          ) : allRequests.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-500">
                There are no {filter} requests at the moment
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book & User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue/Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            {request.book?.coverImage?.url ? (
                              <img
                                src={request.book.coverImage.url}
                                alt={request.book.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-emerald-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.book?.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              by {request.book?.author}
                            </div>
                            <div className="mt-2 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <User className="w-3 h-3" />
                                <span className="text-xs">
                                  {request.user?.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs">
                                  {request.user?.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.requestDate).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.issueDate && (
                          <div className="text-sm text-gray-900">
                            Issue:{" "}
                            {new Date(request.issueDate).toLocaleDateString()}
                          </div>
                        )}
                        {request.dueDate && (
                          <div className="text-sm text-gray-600">
                            Due:{" "}
                            {new Date(request.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {request.returnDate && (
                          <div className="text-sm text-emerald-600">
                            Returned:{" "}
                            {new Date(request.returnDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionButtons(request)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Approve Borrow Request
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Book:</span>{" "}
                {selectedRequest.book?.title}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User:</span>{" "}
                {selectedRequest.user?.name}
              </p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={issueDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reject Borrow Request
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Book:</span>{" "}
                {selectedRequest.book?.title}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User:</span>{" "}
                {selectedRequest.user?.name}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Delete Request
              </h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this request? This action cannot
                be undone.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm font-medium text-gray-700">
                Request Details:
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Book:</span>{" "}
                {selectedRequest.book?.title}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User:</span>{" "}
                {selectedRequest.user?.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{selectedRequest.status}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Request Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Book Information
                  </h3>
                  <p className="mt-1 font-medium">
                    {selectedRequest.book?.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    by {selectedRequest.book?.author}
                  </p>
                  <p className="text-sm text-gray-600">
                    Category: {selectedRequest.book?.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    ISBN: {selectedRequest.book?.isbn || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    User Information
                  </h3>
                  <p className="mt-1 font-medium">
                    {selectedRequest.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.user?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.user?.phone || "No phone"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Request Timeline
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Requested:</span>{" "}
                    {new Date(selectedRequest.requestDate).toLocaleString()}
                  </p>
                  {selectedRequest.issueDate && (
                    <p className="text-sm">
                      <span className="font-medium">Issue Date:</span>{" "}
                      {new Date(selectedRequest.issueDate).toLocaleDateString()}
                    </p>
                  )}
                  {selectedRequest.dueDate && (
                    <p className="text-sm">
                      <span className="font-medium">Due Date:</span>{" "}
                      {new Date(selectedRequest.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {selectedRequest.returnDate && (
                    <p className="text-sm">
                      <span className="font-medium">Returned:</span>{" "}
                      {new Date(
                        selectedRequest.returnDate,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {selectedRequest.notes && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Notes
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Status
                </h3>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {canDelete(selectedRequest.status) && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Request
                </button>
              )}
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowRequests;
