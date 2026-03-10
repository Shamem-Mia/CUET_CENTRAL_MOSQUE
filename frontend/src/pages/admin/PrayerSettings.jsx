import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrayerSettingsStore } from "../../stores/usePrayerSettingsStore";
import {
  Settings,
  Save,
  ArrowLeft,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const PrayerSettings = () => {
  const navigate = useNavigate();
  const { settings, loading, getSettings, updateSettings, resetToApiMode } =
    usePrayerSettingsStore();

  const [formData, setFormData] = useState({
    fajr: "05:00",
    dhuhr: "12:30",
    asr: "15:45",
    maghrib: "18:15",
    isha: "19:45",
    iqamahOffset: {
      fajr: 30,
      dhuhr: 20,
      asr: 15,
      maghrib: 10,
      isha: 20,
    },
    jumuahEnabled: true,
    jumuahTime: "13:30",
    jumuahIqamah: "13:45",
    calculationMethod: 1,
    isManualMode: false,
    notes: "",
  });

  const [activeTab, setActiveTab] = useState("prayer");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        fajr: settings.fajr || "05:00",
        dhuhr: settings.dhuhr || "12:30",
        asr: settings.asr || "15:45",
        maghrib: settings.maghrib || "18:15",
        isha: settings.isha || "19:45",
        iqamahOffset: {
          fajr: settings.iqamahOffset?.fajr || 30,
          dhuhr: settings.iqamahOffset?.dhuhr || 20,
          asr: settings.iqamahOffset?.asr || 15,
          maghrib: settings.iqamahOffset?.maghrib || 10,
          isha: settings.iqamahOffset?.isha || 20,
        },
        jumuahEnabled:
          settings.jumuahEnabled !== undefined ? settings.jumuahEnabled : true,
        jumuahTime: settings.jumuahTime || "13:30",
        jumuahIqamah: settings.jumuahIqamah || "13:45",
        calculationMethod: settings.calculationMethod || 1,
        isManualMode: settings.isManualMode || false,
        notes: settings.notes || "",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        navigate("/admin");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("iqamah.")) {
      const prayer = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        iqamahOffset: {
          ...prev.iqamahOffset,
          [prayer]: parseInt(value) || 0,
        },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate times
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const prayers = [
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
      "jumuahTime",
      "jumuahIqamah",
    ];

    for (let prayer of prayers) {
      if (formData[prayer] && !timeRegex.test(formData[prayer])) {
        toast.error(`Invalid time format for ${prayer}`);
        return;
      }
    }

    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      toast.success("Settings saved! Redirecting...");
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset to API mode? This will use online calculation methods.",
      )
    ) {
      await resetToApiMode();
      toast.success("Reset to API mode. Redirecting...");
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    }
  };

  const calculationMethods = [
    { value: 1, label: "University of Islamic Sciences, Karachi" },
    { value: 2, label: "Islamic Society of North America (ISNA)" },
    { value: 3, label: "Muslim World League (MWL)" },
    { value: 4, label: "Umm al-Qura, Makkah" },
    { value: 5, label: "Egyptian General Authority of Survey" },
    { value: 7, label: "Institute of Geophysics, University of Tehran" },
    { value: 8, label: "Gulf Region" },
    { value: 9, label: "Kuwait" },
    { value: 10, label: "Qatar" },
    { value: 11, label: "Majlis Ugama Islam Singapura, Singapore" },
    { value: 12, label: "Union Organization Islamic de France" },
    { value: 13, label: "Diyanet İşleri Başkanlığı, Turkey" },
    { value: 14, label: "Spiritual Administration of Muslims of Russia" },
  ];

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-emerald-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-700" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
            Prayer Times Settings
          </h1>
        </div>

        {/* Mode Indicator */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            formData.isManualMode
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`w-5 h-5 ${
                  formData.isManualMode ? "text-yellow-600" : "text-green-600"
                }`}
              />
              <span
                className={`font-medium ${
                  formData.isManualMode ? "text-yellow-800" : "text-green-800"
                }`}
              >
                Current Mode:{" "}
                {formData.isManualMode ? "Manual Times" : "Automatic (API)"}
              </span>
            </div>
            {!formData.isManualMode && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Switch to Manual
              </button>
            )}
          </div>
          {formData.isManualMode && (
            <p className="text-sm text-yellow-700 mt-2">
              You are using manually set prayer times. These times will be used
              instead of API calculations.
            </p>
          )}
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-700 text-center font-medium">
              ✓ Settings saved successfully! Redirecting to admin dashboard...
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-emerald-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("prayer")}
            className={`px-4 py-2 font-medium whitespace-nowrap transition ${
              activeTab === "prayer"
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Prayer Times
          </button>
          <button
            onClick={() => setActiveTab("iqamah")}
            className={`px-4 py-2 font-medium whitespace-nowrap transition ${
              activeTab === "iqamah"
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Iqamah Settings
          </button>
          <button
            onClick={() => setActiveTab("jumuah")}
            className={`px-4 py-2 font-medium whitespace-nowrap transition ${
              activeTab === "jumuah"
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Jumu'ah Settings
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`px-4 py-2 font-medium whitespace-nowrap transition ${
              activeTab === "advanced"
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          {/* Prayer Times Tab */}
          {activeTab === "prayer" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="isManualMode"
                  id="isManualMode"
                  checked={formData.isManualMode}
                  onChange={handleChange}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="isManualMode"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable Manual Mode (set custom times)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-4 h-4 text-emerald-600" />
                      Fajr Time
                    </div>
                  </label>
                  <input
                    type="time"
                    name="fajr"
                    value={formData.fajr}
                    onChange={handleChange}
                    disabled={!formData.isManualMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-emerald-600" />
                      Dhuhr Time
                    </div>
                  </label>
                  <input
                    type="time"
                    name="dhuhr"
                    value={formData.dhuhr}
                    onChange={handleChange}
                    disabled={!formData.isManualMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-emerald-600" />
                      Asr Time
                    </div>
                  </label>
                  <input
                    type="time"
                    name="asr"
                    value={formData.asr}
                    onChange={handleChange}
                    disabled={!formData.isManualMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-emerald-600" />
                      Maghrib Time
                    </div>
                  </label>
                  <input
                    type="time"
                    name="maghrib"
                    value={formData.maghrib}
                    onChange={handleChange}
                    disabled={!formData.isManualMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-emerald-600" />
                      Isha Time
                    </div>
                  </label>
                  <input
                    type="time"
                    name="isha"
                    value={formData.isha}
                    onChange={handleChange}
                    disabled={!formData.isManualMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Iqamah Settings Tab */}
          {activeTab === "iqamah" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Set how many minutes after Adhan the Iqamah will be called.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fajr Iqamah (minutes after Adhan)
                  </label>
                  <input
                    type="number"
                    name="iqamah.fajr"
                    value={formData.iqamahOffset.fajr}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dhuhr Iqamah (minutes after Adhan)
                  </label>
                  <input
                    type="number"
                    name="iqamah.dhuhr"
                    value={formData.iqamahOffset.dhuhr}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asr Iqamah (minutes after Adhan)
                  </label>
                  <input
                    type="number"
                    name="iqamah.asr"
                    value={formData.iqamahOffset.asr}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maghrib Iqamah (minutes after Adhan)
                  </label>
                  <input
                    type="number"
                    name="iqamah.maghrib"
                    value={formData.iqamahOffset.maghrib}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isha Iqamah (minutes after Adhan)
                  </label>
                  <input
                    type="number"
                    name="iqamah.isha"
                    value={formData.iqamahOffset.isha}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Jumu'ah Settings Tab */}
          {activeTab === "jumuah" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="jumuahEnabled"
                  id="jumuahEnabled"
                  checked={formData.jumuahEnabled}
                  onChange={handleChange}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="jumuahEnabled"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable Jumu'ah prayer on Fridays
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumu'ah Time
                  </label>
                  <input
                    type="time"
                    name="jumuahTime"
                    value={formData.jumuahTime}
                    onChange={handleChange}
                    disabled={!formData.jumuahEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumu'ah Iqamah
                  </label>
                  <input
                    type="time"
                    name="jumuahIqamah"
                    value={formData.jumuahIqamah}
                    onChange={handleChange}
                    disabled={!formData.jumuahEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calculation Method (for API mode)
                </label>
                <select
                  name="calculationMethod"
                  value={formData.calculationMethod}
                  onChange={handleChange}
                  disabled={formData.isManualMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                >
                  {calculationMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Any notes about the changes..."
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || saveSuccess}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : saveSuccess ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrayerSettings;
