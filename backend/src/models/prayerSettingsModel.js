import mongoose from "mongoose";

const prayerSettingsSchema = new mongoose.Schema(
  {
    // Basic prayer times
    fajr: {
      type: String,
      required: true,
      default: "05:00",
    },
    dhuhr: {
      type: String,
      required: true,
      default: "12:30",
    },
    asr: {
      type: String,
      required: true,
      default: "15:45",
    },
    maghrib: {
      type: String,
      required: true,
      default: "18:15",
    },
    isha: {
      type: String,
      required: true,
      default: "19:45",
    },

    // Iqamah times (can be offsets or fixed times)
    iqamahOffset: {
      fajr: { type: Number, default: 30 }, // minutes after adhan
      dhuhr: { type: Number, default: 20 },
      asr: { type: Number, default: 15 },
      maghrib: { type: Number, default: 10 },
      isha: { type: Number, default: 20 },
    },

    // Jumu'ah settings
    jumuahEnabled: {
      type: Boolean,
      default: true,
    },
    jumuahTime: {
      type: String,
      default: "13:30",
    },
    jumuahIqamah: {
      type: String,
      default: "13:45",
    },

    // Calculation method (for API fallback)
    calculationMethod: {
      type: Number,
      default: 1, // 1 = University of Islamic Sciences, Karachi
    },

    // Manual override flag
    isManualMode: {
      type: Boolean,
      default: false, // false = use API, true = use manual times
    },

    // Last updated by
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Notes for any changes
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

// Singleton pattern - only one settings document
prayerSettingsSchema.statics.getSettings = async function () {
  const settings = await this.findOne();
  if (settings) return settings;
  return this.create({});
};

const PrayerSettings = mongoose.model("PrayerSettings", prayerSettingsSchema);
export default PrayerSettings;
