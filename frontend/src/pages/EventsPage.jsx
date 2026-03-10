import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useAuthStore } from "../stores/useAuthStore";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const EventsPage = () => {
  const {
    events,
    loading,
    totalPages,
    currentPage,
    getEvents,
    registerForEvent,
    myRegistrations,
    getMyRegistrations,
  } = useEventStore();
  const { authUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [filter, setFilter] = useState("upcoming");

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

  useEffect(() => {
    getEvents(1, {
      category: selectedCategory || undefined,
      status: filter,
      search: searchTerm || undefined,
    });
    if (authUser) {
      getMyRegistrations();
    }
  }, [selectedCategory, filter, searchTerm]);

  const handlePageChange = (newPage) => {
    getEvents(newPage, {
      category: selectedCategory || undefined,
      status: filter,
      search: searchTerm || undefined,
    });
  };

  const handleRegister = async () => {
    if (!authUser) {
      toast.error("Please login to register for events");
      return;
    }

    if (!selectedEvent) return;

    setRegisterLoading(true);
    try {
      await registerForEvent(selectedEvent._id);
      setShowRegisterModal(false);
      setSelectedEvent(null);
      getMyRegistrations();
      getEvents(currentPage, {
        category: selectedCategory || undefined,
        status: filter,
        search: searchTerm || undefined,
      });
    } catch (error) {
      // Error handled in store
    } finally {
      setRegisterLoading(false);
    }
  };

  const isUserRegistered = (eventId) => {
    return myRegistrations?.some((reg) => reg.event?._id === eventId);
  };

  const getEventStatusBadge = (event) => {
    if (event.status === "cancelled") {
      return (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
          Cancelled
        </span>
      );
    }
    if (event.status === "completed") {
      return (
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          Completed
        </span>
      );
    }
    if (event.status === "ongoing") {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          Ongoing
        </span>
      );
    }
    if (event.date && new Date(event.date) < new Date()) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
          Past
        </span>
      );
    }
    return (
      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
        Upcoming
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Header */}
      <div className="bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 md:w-10 md:h-10" />
            Mosque Events
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl">
            Join us for spiritual gatherings, educational programs, and
            community events
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Check back later for upcoming events
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {/* Event Image */}
                  <div className="h-48 bg-emerald-100 relative">
                    {event.image?.url ? (
                      <img
                        src={event.image.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-emerald-400" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {getEventStatusBadge(event)}
                    </div>
                    {/* Featured Badge */}
                    {event.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">
                          {event.time} {event.endTime && `- ${event.endTime}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{event.location}</span>
                      </div>

                      {event.speaker && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm">
                            Speaker: {event.speaker}
                          </span>
                        </div>
                      )}

                      {event.capacity && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm">
                            {event.registeredCount} / {event.capacity}{" "}
                            registered
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                        {event.category}
                      </span>

                      {event.status === "upcoming" &&
                        (isUserRegistered(event._id) ? (
                          <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Registered
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowRegisterModal(true);
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition"
                          >
                            Register
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === i + 1
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Registration Modal */}
      {showRegisterModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Register for Event
              </h2>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedEvent(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-emerald-800 mb-2">
                  {selectedEvent.title}
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {selectedEvent.time}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {selectedEvent.location}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  You are registering as:
                </p>
                <p className="font-medium">
                  {authUser?.name || authUser?.fullName}
                </p>
                <p className="text-sm text-gray-600">{authUser?.email}</p>
              </div>

              {selectedEvent.isRegistrationRequired &&
                selectedEvent.registrationDeadline && (
                  <p className="text-xs text-amber-600 mt-3">
                    Registration deadline:{" "}
                    {new Date(
                      selectedEvent.registrationDeadline,
                    ).toLocaleString()}
                  </p>
                )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRegister}
                disabled={registerLoading}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {registerLoading ? "Registering..." : "Confirm Registration"}
              </button>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedEvent(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
