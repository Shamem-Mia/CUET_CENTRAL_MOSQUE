import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../context/axiosInstance";

export const usePrayerSettingsStore = create((set, get) => ({
  settings: null,
  prayerTimes: null,
  loading: false,

  // Get prayer times for display
  getPrayerTimes: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get("/prayer/times");
      set({ prayerTimes: data.data, loading: false });
      return data.data;
    } catch (error) {
      console.error("Get prayer times error:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Get admin settings
  getSettings: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.get("/prayer/settings");
      set({ settings: data.data, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch settings");
      set({ loading: false });
    }
  },

  // Update settings
  updateSettings: async (settingsData) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.put(
        "/prayer/settings",
        settingsData,
      );
      set({ settings: data.data, loading: false });
      toast.success("Prayer settings updated successfully");
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
      set({ loading: false });
      throw error;
    }
  },

  // Reset to API mode
  resetToApiMode: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.post("/prayer/settings/reset");
      await get().getSettings();
      toast.success("Reset to API mode successfully");
      set({ loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset");
      set({ loading: false });
    }
  },
}));
