import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useBorrowStore } from "../../stores/useBorrowStore";
import { BookOpen, User, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";

const UserHistory = () => {
  const { userId } = useParams();
  const { userHistory, getUserHistory, loading } = useBorrowStore();

  useEffect(() => {
    if (userId) {
      getUserHistory(userId);
    }
  }, [userId]);

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      borrowed: "bg-blue-100 text-blue-800",
      returned: "bg-gray-100 text-gray-800",
      overdue: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!userHistory) {
    return (
      <div className="min-h-screen bg-emerald-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/borrow-requests"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <User className="w-6 h-6 sm:w-8 sm:h-8" />
            User Borrowing History
          </h1>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-700">{userHistory.user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-700">{userHistory.user?.email}</span>
            </div>
            {userHistory.user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700">{userHistory.user.phone}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-emerald-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {userHistory.stats?.totalBorrowed || 0}
              </p>
              <p className="text-xs text-gray-600">Total Borrowed</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">
                {userHistory.stats?.currentlyBorrowed || 0}
              </p>
              <p className="text-xs text-gray-600">Currently Borrowed</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {userHistory.stats?.overdue || 0}
              </p>
              <p className="text-xs text-gray-600">Overdue</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">
                {userHistory.stats?.returned || 0}
              </p>
              <p className="text-xs text-gray-600">Returned</p>
            </div>
          </div>
        </div>

        {/* Borrowing History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 p-6 pb-0">
            Borrowing History
          </h2>

          {userHistory.requests?.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No borrowing history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Issued
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Returned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userHistory.requests?.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/books/${request.book?._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-emerald-700"
                        >
                          {request.book?.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          by {request.book?.author}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.issueDate
                          ? new Date(request.issueDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.dueDate
                          ? new Date(request.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.returnDate
                          ? new Date(request.returnDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
