import PrayerSettings from "../models/prayerSettingsModel.js";
import axios from "axios";

// @desc    Get current prayer settings
// @route   GET /api/prayer-settings
// @access  Public
export const getPrayerSettings = async (req, res) => {
  try {
    let settings = await PrayerSettings.getSettings();

    // If not in manual mode, fetch from API as fallback
    if (!settings.isManualMode) {
      try {
        const apiResponse = await axios.get(
          "https://api.aladhan.com/v1/timingsByCity?city=Chattogram&country=Bangladesh&method=1&school=1",
        );
        const timings = apiResponse.data.data.timings;

        // Return combined data
        return res.json({
          success: true,
          data: {
            ...settings.toObject(),
            apiTimes: {
              fajr: timings.Fajr,
              dhuhr: timings.Dhuhr,
              asr: timings.Asr,
              maghrib: timings.Maghrib,
              isha: timings.Isha,
              sunrise: timings.Sunrise,
              sunset: timings.Sunset,
            },
            mode: "api",
          },
        });
      } catch (apiError) {
        console.error("API fetch failed, using manual times:", apiError);
      }
    }

    res.json({
      success: true,
      data: {
        ...settings.toObject(),
        mode: settings.isManualMode ? "manual" : "api",
      },
    });
  } catch (error) {
    console.error("Get prayer settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update prayer settings (admin only)
// @route   PUT /api/prayer-settings
// @access  Private/Admin
export const updatePrayerSettings = async (req, res) => {
  try {
    const {
      fajr,
      dhuhr,
      asr,
      maghrib,
      isha,
      iqamahOffset,
      jumuahEnabled,
      jumuahTime,
      jumuahIqamah,
      calculationMethod,
      isManualMode,
      notes,
    } = req.body;

    let settings = await PrayerSettings.getSettings();

    // Update fields
    if (fajr) settings.fajr = fajr;
    if (dhuhr) settings.dhuhr = dhuhr;
    if (asr) settings.asr = asr;
    if (maghrib) settings.maghrib = maghrib;
    if (isha) settings.isha = isha;

    if (iqamahOffset) {
      if (iqamahOffset.fajr !== undefined)
        settings.iqamahOffset.fajr = iqamahOffset.fajr;
      if (iqamahOffset.dhuhr !== undefined)
        settings.iqamahOffset.dhuhr = iqamahOffset.dhuhr;
      if (iqamahOffset.asr !== undefined)
        settings.iqamahOffset.asr = iqamahOffset.asr;
      if (iqamahOffset.maghrib !== undefined)
        settings.iqamahOffset.maghrib = iqamahOffset.maghrib;
      if (iqamahOffset.isha !== undefined)
        settings.iqamahOffset.isha = iqamahOffset.isha;
    }

    if (jumuahEnabled !== undefined) settings.jumuahEnabled = jumuahEnabled;
    if (jumuahTime) settings.jumuahTime = jumuahTime;
    if (jumuahIqamah) settings.jumuahIqamah = jumuahIqamah;
    if (calculationMethod) settings.calculationMethod = calculationMethod;
    if (isManualMode !== undefined) settings.isManualMode = isManualMode;
    if (notes) settings.notes = notes;

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Update prayer settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset to API mode
// @route   POST /api/prayer-settings/reset
// @access  Private/Admin
export const resetToApiMode = async (req, res) => {
  try {
    const settings = await PrayerSettings.getSettings();
    settings.isManualMode = false;
    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      message: "Reset to API mode successfully",
    });
  } catch (error) {
    console.error("Reset to API mode error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get prayer times for display (combines settings with API)
// @route   GET /api/prayer-times
// @access  Public
export const getPrayerTimes = async (req, res) => {
  try {
    const settings = await PrayerSettings.getSettings();

    let prayerTimes = {};
    let sunrise = "";
    let sunset = "";

    if (settings.isManualMode) {
      // Use manual times
      prayerTimes = {
        Fajr: settings.fajr,
        Dhuhr: settings.dhuhr,
        Asr: settings.asr,
        Maghrib: settings.maghrib,
        Isha: settings.isha,
      };

      // For sunrise/sunset, we might need to calculate or set manually
      // This is a simplified approach - you might want to add sunrise/sunset to settings
      sunrise = "05:30"; // Default
      sunset = "18:00"; // Default
    } else {
      // Fetch from API
      const apiResponse = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=Chattogram&country=Bangladesh&method=${settings.calculationMethod}&school=1`,
      );
      const timings = apiResponse.data.data.timings;

      prayerTimes = {
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      };

      sunrise = timings.Sunrise;
      sunset = timings.Sunset;
    }

    // Add iqamah times
    const addMinutes = (time, mins) => {
      const [h, m] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m + mins);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const prayers = [
      {
        name: "Fajr",
        raw: prayerTimes.Fajr,
        time: formatTime12(prayerTimes.Fajr),
        iqamah: formatTime12(
          addMinutes(prayerTimes.Fajr, settings.iqamahOffset.fajr),
        ),
      },
      {
        name: "Dhuhr",
        raw: prayerTimes.Dhuhr,
        time: formatTime12(prayerTimes.Dhuhr),
        iqamah: formatTime12(
          addMinutes(prayerTimes.Dhuhr, settings.iqamahOffset.dhuhr),
        ),
      },
      {
        name: "Asr",
        raw: prayerTimes.Asr,
        time: formatTime12(prayerTimes.Asr),
        iqamah: formatTime12(
          addMinutes(prayerTimes.Asr, settings.iqamahOffset.asr),
        ),
      },
      {
        name: "Maghrib",
        raw: prayerTimes.Maghrib,
        time: formatTime12(prayerTimes.Maghrib),
        iqamah: formatTime12(
          addMinutes(prayerTimes.Maghrib, settings.iqamahOffset.maghrib),
        ),
      },
      {
        name: "Isha",
        raw: prayerTimes.Isha,
        time: formatTime12(prayerTimes.Isha),
        iqamah: formatTime12(
          addMinutes(prayerTimes.Isha, settings.iqamahOffset.isha),
        ),
      },
    ];

    // Handle Jumu'ah
    const today = new Date();
    if (today.getDay() === 5 && settings.jumuahEnabled) {
      prayers[1].name = "Jumu'ah";
      prayers[1].iqamah = formatTime12(settings.jumuahIqamah);
    }

    res.json({
      success: true,
      data: {
        prayers,
        sunrise: formatTime12(sunrise),
        sunset: formatTime12(sunset),
        rawSunrise: sunrise,
        rawSunset: sunset,
        settings: {
          mode: settings.isManualMode ? "manual" : "api",
          jumuahEnabled: settings.jumuahEnabled,
          jumuahTime: settings.jumuahTime,
          jumuahIqamah: settings.jumuahIqamah,
        },
      },
    });
  } catch (error) {
    console.error("Get prayer times error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to format 24h time to 12h
const formatTime12 = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
