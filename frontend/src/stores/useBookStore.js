import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../context/axiosInstance";

export const useBookStore = create((set, get) => ({
  books: [],
  currentBook: null,
  loading: false,
  totalPages: 1,
  currentPage: 1,
  totalBooks: 0,

  // Get all books
  getBooks: async (page = 1, search = "", category = "") => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.get(`/books`, {
        params: { page, limit: 10, search, category },
      });

      set({
        books: data.data,
        totalPages: data.totalPages,
        currentPage: data.page,
        totalBooks: data.total,
        loading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch books");
      set({ loading: false });
    }
  },

  // Get single book
  getBookById: async (id) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.get(`/books/${id}`);

      set({ currentBook: data.data, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch book");
      set({ loading: false });
    }
  },

  // Create book
  createBook: async (formData, navigate) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.post(`/books`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Book added successfully");
      set({ loading: false });
      navigate("/admin/books");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add book");
      set({ loading: false });
    }
  },

  // Update book
  updateBook: async (id, formData, navigate) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.put(`/books/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Book updated successfully");
      set({ loading: false });
      navigate("/admin/books");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update book");
      set({ loading: false });
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      set({ loading: true });

      await axiosInstance.delete(`/books/${id}`);

      toast.success("Book deleted successfully");
      // Refresh the book list
      await get().getBooks(get().currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete book");
    } finally {
      set({ loading: false });
    }
  },
}));
