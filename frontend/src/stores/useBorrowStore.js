import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../context/axiosInstance";

export const useBorrowStore = create((set, get) => ({
  myRequests: [],
  allRequests: [],
  selectedRequest: null,
  userHistory: null,
  loading: false,
  totalPages: 1,
  currentPage: 1,
  totalRequests: 0,
  currentFilter: "pending",

  // Get user's borrow requests
  getMyRequests: async () => {
    try {
      const { data } = await axiosInstance.get("/borrow/my-requests");
      set({ myRequests: data.data });
    } catch (error) {
      console.error("Get my requests error:", error);
    }
  },

  // Create borrow request
  createRequest: async (bookId, notes) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.post("/borrow/request", {
        bookId,
        notes,
      });
      toast.success(
        "Request submitted successfully! You'll be notified when it's approved.",
      );
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      set({ loading: false });
      throw error;
    }
  },

  // Get all borrow requests (admin)
  getAllRequests: async (page = 1, status = "") => {
    try {
      set({ loading: true, currentFilter: status });
      const { data } = await axiosInstance.get("/borrow/all", {
        params: { page, limit: 10, status },
      });
      set({
        allRequests: data.data,
        totalPages: data.totalPages,
        currentPage: data.page,
        totalRequests: data.total,
        loading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      set({ loading: false });
    }
  },

  // Approve request (admin)
  approveRequest: async (requestId, issueDate, dueDate) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.put(`/borrow/approve/${requestId}`, {
        issueDate,
        dueDate,
      });
      toast.success("Request approved successfully");
      await get().getAllRequests(get().currentPage, get().currentFilter);
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
      set({ loading: false });
      throw error;
    }
  },

  // Reject request (admin)
  rejectRequest: async (requestId, reason) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.put(`/borrow/reject/${requestId}`, {
        reason,
      });
      toast.success("Request rejected");
      await get().getAllRequests(get().currentPage, get().currentFilter);
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      set({ loading: false });
      throw error;
    }
  },

  // Mark as borrowed (admin)
  markAsBorrowed: async (requestId) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.put(`/borrow/borrow/${requestId}`);
      toast.success("Book marked as borrowed");
      await get().getAllRequests(get().currentPage, get().currentFilter);
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark as borrowed",
      );
      set({ loading: false });
      throw error;
    }
  },

  // Return book (admin)
  returnBook: async (requestId) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.put(`/borrow/return/${requestId}`);
      toast.success("Book returned successfully");
      await get().getAllRequests(get().currentPage, get().currentFilter);
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return book");
      set({ loading: false });
      throw error;
    }
  },

  // Delete request (admin) - NEW FUNCTION
  deleteRequest: async (requestId) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.delete(`/borrow/${requestId}`);
      toast.success("Request deleted successfully");
      await get().getAllRequests(get().currentPage, get().currentFilter);
      set({ loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete request");
      set({ loading: false });
      throw error;
    }
  },

  // Get user history (admin)
  getUserHistory: async (userId) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get(
        `/borrow/user/${userId}/history`,
      );
      set({ userHistory: data.data, loading: false });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch user history",
      );
      set({ loading: false });
    }
  },

  // Check overdue books (admin)
  checkOverdue: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.post("/borrow/check-overdue");
      toast.success(`Checked overdue books: ${data.data} updated`);
      await get().getAllRequests(get().currentPage, get().currentFilter);
      set({ loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to check overdue");
      set({ loading: false });
    }
  },

  // Add this function to your store
  getAllBorrowers: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get("/borrow/borrowers");
      set({ borrowers: data.data, loading: false });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch borrowers");
      set({ loading: false });
    }
  },
}));
