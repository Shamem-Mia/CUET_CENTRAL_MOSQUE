import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../context/axiosInstance";

export const useEventStore = create((set, get) => ({
  events: [],
  currentEvent: null,
  myRegistrations: [],
  loading: false,
  totalPages: 1,
  currentPage: 1,
  totalEvents: 0,

  // Get all events
  getEvents: async (page = 1, filters = {}) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get("/events", {
        params: { page, limit: 12, ...filters },
      });

      set({
        events: data.data,
        totalPages: data.totalPages,
        currentPage: data.page,
        totalEvents: data.total,
        loading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch events");
      set({ loading: false });
    }
  },

  // Get single event
  getEventById: async (id) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get(`/events/${id}`);
      set({ currentEvent: data.data, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch event");
      set({ loading: false });
    }
  },

  // Create event (admin)
  createEvent: async (formData, navigate) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Event created successfully");
      set({ loading: false });
      navigate("/admin/events");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
      set({ loading: false });
    }
  },

  // Update event (admin)
  updateEvent: async (id, formData, navigate) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.put(`/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Event updated successfully");
      set({ loading: false });
      navigate("/admin/events");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update event");
      set({ loading: false });
    }
  },

  // Delete event (admin)
  deleteEvent: async (id) => {
    try {
      set({ loading: true });
      await axiosInstance.delete(`/events/${id}`);
      toast.success("Event deleted successfully");
      await get().getEvents(get().currentPage);
      set({ loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event");
      set({ loading: false });
    }
  },

  // Register for event
  registerForEvent: async (eventId) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.post(`/events/${eventId}/register`);
      toast.success("Successfully registered for event!");
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register");
      set({ loading: false });
      throw error;
    }
  },

  // Get my registrations
  getMyRegistrations: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get("/events/my-registrations");
      set({ myRegistrations: data.data, loading: false });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch registrations",
      );
      set({ loading: false });
    }
  },

  // Cancel registration
  cancelRegistration: async (registrationId) => {
    try {
      set({ loading: true });
      await axiosInstance.delete(`/events/registration/${registrationId}`);
      toast.success("Registration cancelled");
      await get().getMyRegistrations();
      set({ loading: false });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel registration",
      );
      set({ loading: false });
    }
  },
}));
