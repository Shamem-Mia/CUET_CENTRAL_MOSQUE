import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBorrowStore } from "../../stores/useBorrowStore";
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
} from "lucide-react";

const BorrowersList = () => {
  const navigate = useNavigate();
  const { borrowers, getAllBorrowers, loading } = useBorrowStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    getAllBorrowers();
  }, []);

  // Filter borrowers based on search and status
  const filteredBorrowers =
    borrowers?.filter((borrower) => {
      // Search filter
      const matchesSearch =
        borrower.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrower.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrower.phone?.includes(searchTerm);

      // Status filter
      let matchesStatus = true;
      if (filterStatus === "active") {
        matchesStatus = borrower.activeRequests > 0;
      } else if (filterStatus === "inactive") {
        matchesStatus =
          borrower.activeRequests === 0 && borrower.totalRequests > 0;
      } else if (filterStatus === "new") {
        // Users who have requested in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesStatus = new Date(borrower.lastRequestDate) > sevenDaysAgo;
      }

      return matchesSearch && matchesStatus;
    }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredBorrowers.length / itemsPerPage);
  const paginatedBorrowers = filteredBorrowers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getActivityBadge = (borrower) => {
    if (borrower.activeRequests > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          <Clock className="w-3 h-3" />
          Active ({borrower.activeRequests})
        </span>
      );
    } else if (borrower.totalRequests > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            Library Borrowers
          </h1>
          <p className="text-emerald-600 mt-1">
            View all users who have borrowed books from the library
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Borrowers</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {borrowers?.length || 0}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Borrowers</p>
                <p className="text-3xl font-bold text-green-600">
                  {borrowers?.filter((b) => b.activeRequests > 0).length || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Books Borrowed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {borrowers?.reduce((acc, b) => acc + b.totalRequests, 0) || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Requests</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {borrowers?.reduce((acc, b) => acc + b.activeRequests, 0) ||
                    0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
              >
                <option value="all">All Borrowers</option>
                <option value="active">Active Borrowers</option>
                <option value="inactive">Inactive Borrowers</option>
                <option value="new">New (Last 7 days)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Borrowers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {paginatedBorrowers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No borrowers found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No users have borrowed books yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Books
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedBorrowers.map((borrower) => (
                      <tr key={borrower._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {borrower.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {borrower._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {borrower.email}
                          </div>
                          {borrower.phone && (
                            <div className="text-xs text-gray-500">
                              {borrower.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getActivityBadge(borrower)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {borrower.booksCount} unique
                          </div>
                          <div className="text-xs text-gray-500">
                            {borrower.totalRequests} total
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              borrower.lastRequestDate,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              borrower.lastRequestDate,
                            ).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              navigate(`/admin/user-history/${borrower._id}`)
                            }
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="View History"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {paginatedBorrowers.map((borrower) => (
                  <div key={borrower._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {borrower.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            ID: {borrower._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                      {getActivityBadge(borrower)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{borrower.email}</span>
                      </div>
                      {borrower.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {borrower.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-emerald-600">
                          {borrower.booksCount}
                        </p>
                        <p className="text-xs text-gray-500">Unique Books</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-emerald-600">
                          {borrower.totalRequests}
                        </p>
                        <p className="text-xs text-gray-500">Total Requests</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Last:{" "}
                        {new Date(
                          borrower.lastRequestDate,
                        ).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/admin/user-history/${borrower._id}`)
                        }
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                      >
                        View History
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowersList;
