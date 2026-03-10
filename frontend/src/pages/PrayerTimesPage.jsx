import React, { useState, useEffect } from "react";
import {
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Calendar,
  Clock,
  Loader,
} from "lucide-react";
import { usePrayerSettingsStore } from "../stores/usePrayerSettingsStore";

const PrayerTimesPage = () => {
  const {
    prayerTimes: settingsPrayerTimes,
    getPrayerTimes,
    loading: settingsLoading,
  } = usePrayerSettingsStore();

  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  const [nextIqamah, setNextIqamah] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);

  const [sunTimes, setSunTimes] = useState({ sunrise: "", sunset: "" });
  const [rawSunTimes, setRawSunTimes] = useState({
    sunrise: "00:00",
    sunset: "00:00",
  });

  const [timeOfDay, setTimeOfDay] = useState("DAY");

  const [sunPosition, setSunPosition] = useState({
    x: 50,
    y: 10,
    visible: true,
    variant: "DAY",
    intervalIndex: 24,
  });

  const [moonPosition, setMoonPosition] = useState({
    x: 50,
    y: 10,
    visible: false,
  });

  const [bgGradient, setBgGradient] = useState("");
  const [isDevMode, setIsDevMode] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  // State for Jumu'ah and settings
  const [jumuahInfo, setJumuahInfo] = useState(null);
  const [settings, setSettings] = useState(null);
  // State for combined prayer list including Jumu'ah
  const [displayPrayers, setDisplayPrayers] = useState([]);

  /* - TIME SOURCE -*/

  const getBDTime = () => {
    return isDevMode && simulatedTime
      ? simulatedTime
      : new Date(Date.now() + timeOffset);
  };

  /* ---- HOURLY BACKGROUNDS ------------- */

  const hourlyGradients = [
    "from-gray-900 to-indigo-900",
    "from-gray-900 to-indigo-900",
    "from-gray-900 to-indigo-800",
    "from-gray-900 to-indigo-800",
    "from-slate-900 to-indigo-800",
    "from-slate-900 to-indigo-800",
    "from-slate-800 to-indigo-700",
    "from-slate-800 to-indigo-700",
    "from-slate-800 to-rose-500",
    "from-indigo-700 to-rose-400",
    "from-rose-400 to-orange-300",
    "from-orange-300 to-sky-400",
    "from-sky-400 to-cyan-300",
    "from-sky-400 to-cyan-200",
    "from-sky-500 to-blue-400",
    "from-sky-500 to-blue-400",
    "from-sky-500 to-blue-300",
    "from-sky-500 to-blue-300",
    "from-sky-400 to-blue-300",
    "from-sky-400 to-blue-300",
    "from-sky-400 to-cyan-200",
    "from-sky-400 to-cyan-200",
    "from-sky-300 to-cyan-200",
    "from-sky-300 to-cyan-200",
    "from-sky-300 to-blue-300",
    "from-sky-300 to-blue-300",
    "from-sky-400 to-blue-400",
    "from-sky-400 to-blue-400",
    "from-sky-500 to-blue-500",
    "from-sky-500 to-blue-500",
    "from-blue-500 to-amber-300",
    "from-blue-500 to-amber-300",
    "from-blue-600 to-orange-400",
    "from-blue-600 to-orange-400",
    "from-orange-500 to-red-500",
    "from-red-600 to-purple-700",
    "from-purple-700 to-indigo-800",
    "from-indigo-800 to-slate-900",
    "from-purple-800 to-indigo-800",
    "from-purple-800 to-indigo-800",
    "from-indigo-800 to-slate-900",
    "from-indigo-800 to-slate-900",
    "from-indigo-900 to-slate-900",
    "from-indigo-900 to-slate-900",
    "from-indigo-900 to-gray-900",
    "from-indigo-900 to-gray-900",
    "from-gray-900 to-gray-900",
    "from-gray-900 to-gray-900",
  ];

  /* -------------------- FORMATTING FUNCTIONS -------------------- */

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

  const addMinutes = (time24, mins) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes) + mins);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getIcon = (name) => {
    switch (name) {
      case "Fajr":
        return <Sunrise className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Dhuhr":
        return <Sun className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Jumu'ah":
        return <Sun className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Asr":
        return <Sun className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Maghrib":
        return <Sunset className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Isha":
        return <Moon className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <Sun className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  /* -------------------- FETCH DATA ------------ */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchError(false);

        const data = await getPrayerTimes();

        if (data && data.prayers?.length) {
          setPrayerTimes(data.prayers);
          setSunTimes({
            sunrise: data.sunrise || "",
            sunset: data.sunset || "",
          });

          setRawSunTimes({
            sunrise: data.rawSunrise || "05:00",
            sunset: data.rawSunset || "18:00",
          });

          // Store settings and Jumu'ah info
          if (data.settings) {
            setSettings(data.settings);
            setJumuahInfo({
              enabled: data.settings.jumuahEnabled,
              time: data.settings.jumuahTime,
              iqamah: data.settings.jumuahIqamah,
            });
          }
        } else {
          setFetchError(true);
        }

        try {
          const timeRes = await fetch(
            "https://worldtimeapi.org/api/timezone/Asia/Dhaka",
          );

          const timeData = await timeRes.json();
          const serverTime = new Date(timeData.datetime).getTime();
          const offset = serverTime - Date.now();

          setTimeOffset(offset);
        } catch (e) {
          console.warn("Time API failed", e);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setFetchError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* -------------------- COMBINE PRAYERS WITH JUMU'AH -------------------- */

  useEffect(() => {
    if (!prayerTimes.length || !jumuahInfo) return;

    // Create a new array with all prayers including Jumu'ah
    const combined = [];

    prayerTimes.forEach((prayer) => {
      if (prayer.name === "Dhuhr" && jumuahInfo.enabled) {
        // Add Jumu'ah before Dhuhr
        combined.push({
          name: "Jumu'ah",
          time: formatTime12(jumuahInfo.time),
          iqamah: formatTime12(jumuahInfo.iqamah),
          raw: jumuahInfo.time,
          isJumuah: true,
          originalDhuhr: prayer,
        });
        // Add Dhuhr after Jumu'ah
        combined.push({
          ...prayer,
          isJumuah: false,
          showAsJumuah: false,
        });
      } else {
        combined.push({
          ...prayer,
          isJumuah: false,
        });
      }
    });

    setDisplayPrayers(combined);
  }, [prayerTimes, jumuahInfo]);

  /* -------------------- DEV MODE -------------------- */

  useEffect(() => {
    if (!isDevMode) {
      setSimulatedTime(null);
      return;
    }

    const initialTime = getBDTime();
    setSimulatedTime(initialTime);

    const interval = setInterval(() => {
      setSimulatedTime(
        (prev) => new Date((prev || initialTime).getTime() + 60 * 1000),
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isDevMode, timeOffset]);

  /* -------------------- CLOCK STATE -------------------- */

  useEffect(() => {
    if (!displayPrayers.length) return;

    const updateClockState = () => {
      const now = getBDTime();

      setCurrentTime(now);

      const bdTimeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Dhaka",
        hour12: false,
        hour: "numeric",
        minute: "numeric",
      });

      const [currentH, currentM] = bdTimeStr.split(":").map(Number);
      const currentMinutes = currentH * 60 + currentM;

      const intervalIndex = Math.floor(currentMinutes / 30);

      if (hourlyGradients[intervalIndex]) {
        setBgGradient(`bg-gradient-to-b ${hourlyGradients[intervalIndex]}`);
      }

      let upcomingPrayer = null;
      let upcomingIqamah = null;
      let smallestDiff = Infinity;
      let smallestIqamahDiff = Infinity;

      for (const p of displayPrayers) {
        if (!p.raw) continue;

        const [h, m] = p.raw.split(":").map(Number);
        const pMinutes = h * 60 + m;

        const diff = pMinutes - currentMinutes;

        // Check for next prayer
        if (diff > 0 && diff < smallestDiff) {
          smallestDiff = diff;
          upcomingPrayer = p.name;
        }

        // Check for next Iqamah
        if (p.iqamah) {
          // Parse iqamah time (handle both string and formatted time)
          let iqamahTime = p.iqamah;
          // If it's already formatted (e.g., "12:30 PM"), convert to 24h for comparison
          if (iqamahTime.includes("AM") || iqamahTime.includes("PM")) {
            const date = new Date("2000-01-01 " + iqamahTime);
            iqamahTime = `${date.getHours()}:${date.getMinutes()}`;
          }

          const [iqH, iqM] = iqamahTime.split(":").map(Number);
          const iqMinutes = iqH * 60 + iqM;
          const iqDiff = iqMinutes - currentMinutes;

          if (iqDiff > 0 && iqDiff < smallestIqamahDiff) {
            smallestIqamahDiff = iqDiff;
            upcomingIqamah = p.name;
          }
        }
      }

      setNextPrayer(upcomingPrayer || displayPrayers[0]?.name || "Fajr");
      setNextIqamah(upcomingIqamah);
    };

    updateClockState();

    const timer = setInterval(updateClockState, 1000);

    return () => clearInterval(timer);
  }, [displayPrayers, simulatedTime, timeOffset]);

  /* -------------------- DAY/NIGHT DETECTION -------------------- */

  useEffect(() => {
    if (!displayPrayers.length || !rawSunTimes.sunrise || !rawSunTimes.sunset)
      return;

    const updateTimeOfDay = () => {
      const now = getBDTime();

      const bdTimeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Dhaka",
        hour12: false,
        hour: "numeric",
        minute: "numeric",
      });

      const [currentH, currentM] = bdTimeStr.split(":").map(Number);
      const currentMinutes = currentH * 60 + currentM;

      const [sunrise_h, sunrise_m] = rawSunTimes.sunrise.split(":").map(Number);
      const sunriseMinutes = sunrise_h * 60 + sunrise_m;

      const [sunset_h, sunset_m] = rawSunTimes.sunset.split(":").map(Number);
      const sunsetMinutes = sunset_h * 60 + sunset_m;

      let newTimeOfDay = "NIGHT";
      if (currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes) {
        newTimeOfDay = "DAY";
      } else if (
        currentMinutes >= sunsetMinutes ||
        currentMinutes < sunriseMinutes
      ) {
        newTimeOfDay = "NIGHT";
      }

      setTimeOfDay(newTimeOfDay);
    };

    updateTimeOfDay();
    const timer = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [displayPrayers, rawSunTimes, simulatedTime, timeOffset]);

  /* -------------------- LOADING -------------------- */

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <Loader className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (fetchError || !displayPrayers.length) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Failed to load prayer times. Please try again later.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  const timeOfDayStyles = {
    DAY: {
      bg: "from-sky-500 to-cyan-400",
      text: "text-white",
      accent: "text-yellow-300",
    },
    NIGHT: {
      bg: "from-gray-900 to-indigo-900",
      text: "text-white",
      accent: "text-indigo-300",
    },
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-8 sm:py-12 px-4 font-sans">
      <button
        onClick={() => setIsDevMode((prev) => !prev)}
        className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-white font-bold shadow-lg z-40 ${
          isDevMode
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isDevMode ? "Stop Time Travel" : "Time Travel"}
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-emerald-900 flex justify-center gap-3">
            <Clock className="w-10 h-10 text-emerald-600" />
            Prayer Times
          </h1>

          <p className="text-emerald-700">
            Daily prayer schedule for CUET Central Mosque
          </p>

          {/* Manual Mode Indicator */}
          {settings?.isManualMode && (
            <div className="mt-2 inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-xs font-medium">
              Manual Mode • Set by Admin
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* LEFT PANEL */}

          <div className="lg:col-span-2">
            <div
              className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden bg-gradient-to-b ${timeOfDayStyles[timeOfDay]?.bg || hourlyGradients[Math.floor(new Date().getHours() * 2)]}`}
            >
              {/* Clouds/Night Effects */}
              <div className="absolute inset-0 pointer-events-none">
                {timeOfDay === "NIGHT" ? (
                  <div className="absolute inset-0">
                    <div className="absolute top-[20%] left-[20%] w-1 h-1 rounded-full bg-white animate-pulse" />
                    <div className="absolute top-[30%] left-[80%] w-0.5 h-0.5 rounded-full bg-white animate-pulse delay-300" />
                    <div className="absolute top-[15%] left-[50%] w-0.5 h-0.5 rounded-full bg-white animate-pulse delay-700" />
                  </div>
                ) : (
                  <Clouds />
                )}
              </div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm mb-10">
                  <MapPin className="w-4 h-4 text-yellow-300" />
                  CUET, Chattogram
                </div>

                <div className="text-5xl font-bold drop-shadow-lg mb-4">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Dhaka",
                  })}
                </div>

                <div className="text-lg mb-2">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Dhaka",
                  })}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                    Next Prayer: <span className="font-bold">{nextPrayer}</span>
                  </div>

                  {nextIqamah && (
                    <div className="bg-emerald-500/30 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                      Next Iqamah:{" "}
                      <span className="font-bold">{nextIqamah}</span>
                    </div>
                  )}
                </div>

                {/* Sunrise/Sunset Widgets */}
                <div className="mt-8 flex justify-center gap-8">
                  <div className="text-center">
                    <Sunrise className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                    <div className="text-sm font-bold">
                      {sunTimes.sunrise || "05:00"}
                    </div>
                    <div className="text-xs opacity-80">Sunrise</div>
                  </div>
                  <div className="text-center">
                    <Sunset className="w-6 h-6 text-orange-300 mx-auto mb-1" />
                    <div className="text-sm font-bold">
                      {sunTimes.sunset || "18:00"}
                    </div>
                    <div className="text-xs opacity-80">Sunset</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT TABLE */}

          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
              <div className="p-6 border-b bg-emerald-50/50">
                <h2 className="text-xl font-bold text-emerald-900 flex gap-2 items-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Today's Schedule
                </h2>
              </div>

              <div className="p-6 space-y-3">
                {displayPrayers.map((prayer, index) => (
                  <div
                    key={`${prayer.name}-${index}`}
                    className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                      nextPrayer === prayer.name
                        ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200"
                        : "border-gray-100 hover:bg-emerald-50/50"
                    } ${prayer.isJumuah ? "bg-amber-50/30 border-amber-200" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          nextPrayer === prayer.name
                            ? "bg-emerald-600 text-white"
                            : prayer.isJumuah
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {getIcon(prayer.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {prayer.name}
                          {prayer.isJumuah && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Weekly
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Iqamah: {prayer.iqamah}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold px-4 py-2 rounded-lg ${
                          prayer.isJumuah
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {prayer.time}
                      </div>
                      {prayer.originalDhuhr && (
                        <div className="text-xs text-gray-400 mt-1">
                          Dhuhr also at: {prayer.originalDhuhr.time}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settings Information Footer */}
              <div className="p-6 border-t bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Mode</span>
                    <p className="font-semibold mt-1 capitalize">
                      {settings?.isManualMode ? "Manual" : "API"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Method</span>
                    <p className="font-semibold mt-1">
                      {settings?.calculationMethod === 1
                        ? "Karachi"
                        : "Standard"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Jumu'ah</span>
                    <p className="font-semibold mt-1">
                      {jumuahInfo?.enabled ? (
                        <span className="text-amber-600">
                          Every Friday {formatTime12(jumuahInfo.time)}
                        </span>
                      ) : (
                        "Disabled"
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">
                      Iqamah Offsets
                    </span>
                    <p className="text-xs mt-1">
                      F:{settings?.iqamahOffset?.fajr || 0} | D:
                      {settings?.iqamahOffset?.dhuhr || 0} | A:
                      {settings?.iqamahOffset?.asr || 0} | M:
                      {settings?.iqamahOffset?.maghrib || 0} | I:
                      {settings?.iqamahOffset?.isha || 0}
                    </p>
                  </div>
                </div>

                {/* Jumu'ah Info Bar */}
                {jumuahInfo?.enabled && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-800">
                        Jumu'ah Prayer
                      </span>
                      <span className="text-amber-700 font-bold">
                        {formatTime12(jumuahInfo.time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-sm">
                      <span className="text-amber-600">Iqamah</span>
                      <span className="text-amber-700 font-medium">
                        {formatTime12(jumuahInfo.iqamah)}
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      Jumu'ah is held every Friday. Regular Dhuhr prayer is also
                      available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- CLOUDS -------------------- */

const Clouds = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <img
        src="/cloud1.png"
        alt="cloud"
        className="absolute top-[10%] left-[10%] w-48 opacity-70"
      />
      <img
        src="/cloud2.png"
        alt="cloud"
        className="absolute top-[30%] right-[10%] w-64 opacity-70"
      />
      <img
        src="/cloud3.png"
        alt="cloud"
        className="absolute top-[50%] left-[30%] w-72 opacity-60"
      />
    </div>
  );
};

export default PrayerTimesPage;
