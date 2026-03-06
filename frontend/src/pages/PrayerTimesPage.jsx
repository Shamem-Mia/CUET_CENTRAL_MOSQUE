import React, { useState, useEffect, useMemo } from "react";
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

// main component 
const PrayerTimesPage = () => {
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0); // server time er gap
  const [sunTimes, setSunTimes] = useState({ sunrise: "", sunset: "" });
  const [rawSunTimes, setRawSunTimes] = useState({ sunrise: "00:00", sunset: "00:00" });
  const [timeOfDay, setTimeOfDay] = useState("DAY");
  const [sunPosition, setSunPosition] = useState({ x: 50, y: 10, visible: true, variant: "DAY", intervalIndex: 24 });
  const [moonPosition, setMoonPosition] = useState({ x: 50, y: 10, visible: false });
  const [bgGradient, setBgGradient] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(null);

  const hourlyGradients = [
    'from-gray-900 to-indigo-900', 'from-gray-900 to-indigo-900',
    'from-gray-900 to-indigo-800', 'from-gray-900 to-indigo-800',
    'from-slate-900 to-indigo-800', 'from-slate-900 to-indigo-800',
    'from-slate-800 to-indigo-700', 'from-slate-800 to-indigo-700',
    'from-slate-800 to-rose-500', 'from-indigo-700 to-rose-400',
    'from-rose-400 to-orange-300', 'from-orange-300 to-sky-400',
    'from-sky-400 to-cyan-300', 'from-sky-400 to-cyan-200',
    'from-sky-500 to-blue-400', 'from-sky-500 to-blue-400',
    'from-sky-500 to-blue-300', 'from-sky-500 to-blue-300',
    'from-sky-400 to-blue-300', 'from-sky-400 to-blue-300',
    'from-sky-400 to-cyan-200', 'from-sky-400 to-cyan-200',
    'from-sky-300 to-cyan-200', 'from-sky-300 to-cyan-200',
    'from-sky-300 to-blue-300', 'from-sky-300 to-blue-300',
    'from-sky-400 to-blue-400', 'from-sky-400 to-blue-400',
    'from-sky-500 to-blue-500', 'from-sky-500 to-blue-500',
    'from-blue-500 to-amber-300', 'from-blue-500 to-amber-300',
    'from-blue-600 to-orange-400', 'from-blue-600 to-orange-400',
    'from-orange-500 to-red-500', 'from-red-600 to-purple-700',
    'from-purple-700 to-indigo-800', 'from-indigo-800 to-slate-900',
    'from-purple-800 to-indigo-800', 'from-purple-800 to-indigo-800',
    'from-indigo-800 to-slate-900', 'from-indigo-800 to-slate-900',
    'from-indigo-900 to-slate-900', 'from-indigo-900 to-slate-900',
    'from-indigo-900 to-gray-900', 'from-indigo-900 to-gray-900',
    'from-gray-900 to-gray-900', 'from-gray-900 to-gray-900',
  ];

  const timeOfDayStyles = {
    DAWN: {
      bg: "bg-gradient-to-b from-sky-400 to-orange-300",
      arc: "#fde047",
      celestial: "text-yellow-200",
      accent: "text-orange-100",
    },
    DAY: {
      bg: "bg-gradient-to-b from-sky-500 to-cyan-400",
      arc: "#facc15",
      celestial: "text-yellow-300",
      accent: "text-cyan-50",
    },
    DUSK: {
      bg: "bg-gradient-to-b from-indigo-600 to-orange-500",
      arc: "#fdbf6f",
      celestial: "text-gray-300",
      accent: "text-orange-200",
    },
    NIGHT: {
      bg: "bg-gradient-to-b from-gray-900 to-indigo-800",
      arc: "#a5b4fc",
      celestial: "text-gray-200",
      accent: "text-indigo-200",
    },
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

  const getIcon = (name) => {
    switch (name) {
      case "Fajr": return <Sunrise />;
      case "Dhuhr":
      case "Jumu'ah": return <Sun />;
      case "Asr": return <Sun />;
      case "Maghrib": return <Sunset />;
      case "Isha": return <Moon />;
      default: return <Sun />;
    }
  };

  // API theke data ana apadooto thak pore change kora jabeni
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const prayerRes = await fetch(
          "https://api.aladhan.com/v1/timingsByCity?city=Chattogram&country=Bangladesh&method=1&school=1"
        );
        const prayerData = await prayerRes.json();
        const timings = prayerData.data.timings;

        // 2. User er mobile er time vul thakte pare, tai server theke time offset ber korbe
        let offset = 0;
        try {
          const timeRes = await fetch(
            "https://worldtimeapi.org/api/timezone/Asia/Dhaka"
          );
          const timeData = await timeRes.json();
          const serverTime = new Date(timeData.datetime).getTime();
          offset = serverTime - Date.now();
        } catch (e) {
          console.warn("bhai, time api theke asheni, local time e chalacchi", e);
        }
        setTimeOffset(offset);
        const prayers = [
          {
            name: "Fajr",
            raw: timings.Fajr,
            time: formatTime12(timings.Fajr),
            iqamah: addMinutes(timings.Fajr, 30),
          },
          {
            name: "Dhuhr",
            raw: timings.Dhuhr,
            time: formatTime12(timings.Dhuhr),
            iqamah: addMinutes(timings.Dhuhr, 20),
          },
          {
            name: "Asr",
            raw: timings.Asr,
            time: formatTime12(timings.Asr),
            iqamah: addMinutes(timings.Asr, 15),
          },
          {
            name: "Maghrib",
            raw: timings.Maghrib,
            time: formatTime12(timings.Maghrib),
            iqamah: addMinutes(timings.Maghrib, 10),
          },
          {
            name: "Isha",
            raw: timings.Isha,
            time: formatTime12(timings.Isha),
            iqamah: addMinutes(timings.Isha, 20),
          },
        ];

        // Aaj jodi jumuahbar hoy, tahole jumuahr shomoy set kore dibe
        const syncedDate = new Date(Date.now() + offset);
        if (syncedDate.getDay() === 5) {
          prayers[1].name = "Jumu'ah";
          prayers[1].iqamah = "01:30 PM"; // pore admi n panel e set kore dite parbe 
        }

        setSunTimes({
          sunrise: formatTime12(timings.Sunrise),
          sunset: formatTime12(timings.Sunset),
        });

        setRawSunTimes({
          sunrise: timings.Sunrise,
          sunset: timings.Sunset,
        });

        setPrayerTimes(prayers);
        setLoading(false);
      } catch (err) {
        console.error("Namazer time fecth korte fail marse:", err);
        setLoading(false);
      }
    };

    fetchApiData();
  }, []);

  // Developer Mode final code e remove kora hobe 
  useEffect(() => {
    if (!isDevMode) {
      setSimulatedTime(null);
      return;
    }

    const initialTime = new Date(Date.now() + timeOffset);
    setSimulatedTime(initialTime);

    const interval = setInterval(() => {
      // prottek 50ms por por 
      setSimulatedTime(prevTime => new Date((prevTime || initialTime).getTime() + 60 * 1000));
    }, 50);
    return () => clearInterval(interval);
  }, [isDevMode, timeOffset]);
  useEffect(() => {
    if (!prayerTimes.length || !rawSunTimes.sunrise) return;
    const updateClockState = () => {
      // dev mode e thakle simulated time use korbo
      const now = isDevMode && simulatedTime ? simulatedTime : new Date(Date.now() + timeOffset);
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

      for (const p of prayerTimes) {
        const [h, m] = p.raw.split(":").map(Number);
        const pMinutes = h * 60 + m;
        if (pMinutes > currentMinutes) {
          upcomingPrayer = p.name;
          break;
        }
      }
      
      setNextPrayer(upcomingPrayer || "Fajr");

      // Din naki Raat logic
      const [fajr_h, fajr_m] = prayerTimes[0].raw.split(":").map(Number);
      const fajrMinutes = fajr_h * 60 + fajr_m;
      const [sunrise_h, sunrise_m] = rawSunTimes.sunrise.split(":").map(Number);
      const sunriseMinutes = sunrise_h * 60 + sunrise_m;
      const [sunset_h, sunset_m] = rawSunTimes.sunset.split(":").map(Number);
      const sunsetMinutes = sunset_h * 60 + sunset_m;
      const [isha_h, isha_m] = prayerTimes[4].raw.split(":").map(Number);
      const ishaMinutes = isha_h * 60 + isha_m;

      let newTimeOfDay = "NIGHT";
      if (currentMinutes >= fajrMinutes && currentMinutes < sunriseMinutes) newTimeOfDay = "DAWN";
      else if (currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes) newTimeOfDay = "DAY";
      else if (currentMinutes >= sunsetMinutes && currentMinutes < ishaMinutes) newTimeOfDay = "DUSK";
      setTimeOfDay(newTimeOfDay);

      if (newTimeOfDay === "DAY" || newTimeOfDay === "DAWN") {
        const dayDuration = sunsetMinutes - sunriseMinutes;
        const minutesSinceSunrise = currentMinutes - sunriseMinutes;
        const progress = Math.max(0, Math.min(1, minutesSinceSunrise / dayDuration));
        const x = (progress * 140) - 20;
        const y = 30 - Math.sin(progress * Math.PI) * 20;
        let variant = "DAY";
        if (newTimeOfDay === "DAWN") {
          variant = "DAWN";
        } else if (sunsetMinutes - currentMinutes <= 60) {
          variant = "SUNSET";
        }
        setSunPosition({ x, y, visible: true, variant, intervalIndex });
        setMoonPosition((prev) => ({ ...prev, visible: false }));
      } else { // Shondha ba raat e
        const nightDuration = (24 * 60 - sunsetMinutes) + sunriseMinutes;
        const minutesSinceSunset = currentMinutes >= sunsetMinutes
          ? currentMinutes - sunsetMinutes
          : (24 * 60 - sunsetMinutes) + currentMinutes;
        const progress = Math.max(0, Math.min(1, minutesSinceSunset / nightDuration));
        const x = (progress * 140) - 20;
        const y = 30 - Math.sin(progress * Math.PI) * 20;
        setMoonPosition({ x, y, visible: true });
        setSunPosition((prev) => ({ ...prev, visible: false }));
      }
    }

    if (isDevMode) {
      updateClockState();
      return;
    }

    updateClockState();
    const timer = setInterval(updateClockState, 1000);
    return () => clearInterval(timer);
  }, [isDevMode, simulatedTime, timeOffset, prayerTimes, rawSunTimes, hourlyGradients]);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <Loader className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }
  // BD Time (UTC+6) 
  const arcOffset = (() => {
    const totalSeconds = 24 * 60 * 60;
    const bdHours = (currentTime.getUTCHours() + 6) % 24;
    const currentSeconds =
      bdHours * 3600 + currentTime.getUTCMinutes() * 60 + currentTime.getUTCSeconds();
    const progress = currentSeconds / totalSeconds;
    return 251 - 251 * progress;
  })();
  const timeParts = (() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    }).formatToParts(currentTime);
    const getVal = (type) => parts.find((p) => p.type === type)?.value;
    return {
      h: getVal("hour"),
      m: getVal("minute"),
      s: getVal("second"),
      ap: getVal("dayPeriod")
    };
  })();

  return (
    <div className="min-h-screen bg-emerald-50 py-8 sm:py-12 px-4 font-sans">
      {/* Time Travel Button */}
      <button
        onClick={() => setIsDevMode(prev => !prev)}
        className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-white font-bold shadow-lg z-50 transition-colors ${
          isDevMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isDevMode ? "Stop Time Travel" : "Time Travel"}
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900 mb-2 flex items-center justify-center gap-3">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
            Prayer Times
          </h1>
          <p className="text-emerald-700 text-base sm:text-lg">
            Daily prayer schedule for CUET Central Mosque
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Bam pasher widget */}
          <div className="lg:col-span-2">
            <div className={`rounded-3xl p-4 sm:p-6 text-white shadow-xl h-full relative overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-1000 ${bgGradient || timeOfDayStyles[timeOfDay]?.bg}`}>
              {/* Background e Akash er animation */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                {(timeOfDay === "NIGHT" || timeOfDay === "DUSK") && <NightSkyElements />}
                {(timeOfDay === "DAY" || timeOfDay === "DAWN") && <Clouds />}
                
                {/* Shurjo */}
                {sunPosition.visible && (
                  <div
                    className="absolute transition-all duration-1000 ease-linear"
                    style={{
                      left: `${sunPosition.x}%`,
                      top: `${sunPosition.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                  <AnimatedSun variant={sunPosition.variant} intervalIndex={sunPosition.intervalIndex} />
                  </div>
                )}
                
                {/* Chaad */}
                {moonPosition.visible && (
                  <div
                    className="absolute transition-all duration-1000 ease-linear"
                    style={{
                      left: `${moonPosition.x}%`,
                      top: `${moonPosition.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <AnimatedMoon />
                  </div>
                )}
              </div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-8 sm:mb-12">
                  <MapPin className="w-4 h-4 text-yellow-300" />
                  <span>CUET, Chattogram</span>
                </div>

                {/* Clock / Arc Container */}
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-72 h-36 sm:w-80 sm:h-40 md:w-96 md:h-48 flex items-end justify-center overflow-hidden mb-8 ">
                    <svg
                      viewBox="0 0 200 100"
                      className="w-full h-full drop-shadow-lg"
                    >
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="24" 
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={timeOfDayStyles[timeOfDay]?.arc || "#FACC15"}
                        strokeWidth="24" 
                        strokeDasharray="251"
                        strokeDashoffset={arcOffset}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Vhetorer Info */}
                    <div className="absolute bottom-0 mb-4 flex flex-col items-center">
                      <span className={`${timeOfDayStyles[timeOfDay]?.accent || "text-emerald-200"} text-xs uppercase tracking-widest font-bold mb-1 drop-shadow-md`}>
                        Next: {nextPrayer}
                      </span>
                      <div className="flex items-end text-white leading-none -mx-1">
                        <span className="text-4xl sm:text-5xl font-bold tracking-tighter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                          {timeParts.h}:{timeParts.m}
                        </span>
                        <div className="flex flex-col items-center ml-1 sm:ml-1.5 leading-tight pb-0.5 sm:pb-1">
                          <span className={`text-sm sm:text-base font-bold ${timeOfDayStyles[timeOfDay]?.accent || "text-emerald-200"} drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}>
                            {timeParts.s}
                          </span>
                          <span className={`text-base font-bold ${timeOfDayStyles[timeOfDay]?.accent || "text-emerald-200"} drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}>
                            {timeParts.ap}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Widgets Row */}
                  <div className="flex justify-between items-center w-full px-4 sm:px-8">
                    {/* Sunrise Widget */}
                    <div className="flex flex-col items-center bg-white/10 rounded-2xl p-2 sm:p-3 backdrop-blur-sm border border-white/10 min-w-[70px] sm:min-w-[80px]">
                      <Sunrise className="w-6 h-6 text-yellow-300 mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                      <span className="text-base sm:text-lg font-bold drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                        {sunTimes.sunrise}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] uppercase font-bold ${timeOfDayStyles[timeOfDay]?.accent || "text-emerald-200"} mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}>
                        Sunrise
                      </span>
                    </div>

                    {/* Mobile er jonno Schedle */}
                    <div className="lg:hidden flex flex-col items-center gap-1 text-center">
                      <h2 className="text-sm font-bold text-white flex items-center gap-1.5 drop-shadow-md">
                        <Calendar className="w-3.5 h-3.5" />
                        Today's Schedule
                      </h2>
                      <span className="text-[10px] font-medium text-white/90 bg-white/10 px-2 py-1 rounded-full">
                        {currentTime.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          timeZone: "Asia/Dhaka",
                        })}
                      </span>
                    </div>

                    {/* Sunset Widget */}
                    <div className="flex flex-col items-center bg-white/10 rounded-2xl p-2 sm:p-3 backdrop-blur-sm border border-white/10 min-w-[70px] sm:min-w-[80px]">
                      <Sunset className="w-6 h-6 text-orange-300 mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                      <span className="text-base sm:text-lg font-bold drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                        {sunTimes.sunset}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] uppercase font-bold ${timeOfDayStyles[timeOfDay]?.accent || "text-emerald-200"} mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}>
                        Sunset
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Dan pasher Nmzer time tbl */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden h-full">
              <div className="hidden lg:flex p-4 sm:p-6 bg-emerald-50/50 border-b border-emerald-100 flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Today's Schedule
                </h2>
                <span className="text-sm font-medium text-emerald-700 bg-white px-4 py-1.5 rounded-full shadow-sm border border-emerald-100">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Dhaka",
                  })}
                </span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {prayerTimes.map((prayer) => (
                    <div
                      key={prayer.name}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-3xl transition-all duration-300 border group ${
                        nextPrayer === prayer.name
                          ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200"
                          : "hover:bg-emerald-50 border-gray-100 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0 ${
                            nextPrayer === prayer.name
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                          }`}
                        >
                          {React.cloneElement(getIcon(prayer.name), { className: "w-5 h-5 sm:w-6 sm:h-6" })}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-emerald-900 transition-colors">
                            {prayer.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium mt-0.5 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
                            Iqamah: {prayer.iqamah}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="text-right">
                          <span className="block text-base sm:text-lg font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            {prayer.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Animation subcomponent 
const AnimatedSun = React.memo(({ variant, intervalIndex }) => {
  const getSunStyle = (index) => {
    if (index >= 10 && index <= 11) return {
        background: 'radial-gradient(circle at 30% 30%, #fed7aa 0%, #fb923c 40%, #ea580c 90%)',
        boxShadow: '0 0 40px 10px rgba(251, 146, 60, 0.6), 0 0 80px 20px rgba(251, 146, 60, 0.3), inset -10px -10px 20px rgba(154, 52, 18, 0.2)'
    };
    if (index >= 12 && index <= 14) return {
        background: 'radial-gradient(circle at 30% 30%, #fff7ed 0%, #fdba74 30%, #ea580c 80%)',
        boxShadow: '0 0 50px 15px rgba(253, 186, 116, 0.6), 0 0 90px 30px rgba(253, 186, 116, 0.3), inset -10px -10px 20px rgba(194, 65, 12, 0.2)'
    };
    if (index >= 15 && index <= 19) return {
        background: 'radial-gradient(circle at 30% 30%, #fffbeb 0%, #fcd34d 25%, #f59e0b 70%, #d97706 100%)',
        boxShadow: '0 0 60px 20px rgba(252, 211, 77, 0.6), 0 0 100px 40px rgba(252, 211, 77, 0.3), inset -10px -10px 20px rgba(180, 83, 9, 0.2)'
    };
    if (index >= 20 && index <= 28) return {
        background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fef08a 20%, #facc15 50%, #eab308 100%)',
        boxShadow: '0 0 70px 30px rgba(255, 255, 255, 0.7), 0 0 120px 60px rgba(250, 204, 21, 0.4), inset -5px -5px 20px rgba(234, 179, 8, 0.2)'
    };
    if (index >= 29 && index <= 33) return {
        background: 'radial-gradient(circle at 30% 30%, #fffbeb 0%, #fcd34d 25%, #f59e0b 70%, #d97706 100%)',
        boxShadow: '0 0 60px 20px rgba(252, 211, 77, 0.6), 0 0 100px 40px rgba(252, 211, 77, 0.3), inset -10px -10px 20px rgba(180, 83, 9, 0.2)'
    };
    if (index >= 34 && index <= 35) return {
        background: 'radial-gradient(circle at 30% 30%, #fff7ed 0%, #fdba74 30%, #ea580c 80%)',
        boxShadow: '0 0 50px 15px rgba(253, 186, 116, 0.6), 0 0 90px 30px rgba(253, 186, 116, 0.3), inset -10px -10px 20px rgba(194, 65, 12, 0.2)'
    };
    if (index >= 36 && index <= 37) return {
        background: 'radial-gradient(circle at 30% 30%, #fed7aa 0%, #fb923c 40%, #ea580c 90%)',
        boxShadow: '0 0 40px 10px rgba(251, 146, 60, 0.6), 0 0 80px 20px rgba(251, 146, 60, 0.3), inset -10px -10px 20px rgba(154, 52, 18, 0.2)'
    };
    return {
       background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fef08a 20%, #facc15 50%, #eab308 100%)',
       boxShadow: '0 0 70px 30px rgba(255, 255, 255, 0.7), 0 0 120px 60px rgba(250, 204, 21, 0.4), inset -5px -5px 20px rgba(234, 179, 8, 0.2)'
    }
  };

  const currentStyle = getSunStyle(intervalIndex);

  return (
      <div
        className="relative w-[150px] h-[150px] rounded-full"
        style={{
          background: currentStyle.background,
          boxShadow: currentStyle.boxShadow,
          transform: 'scale(0.4)'
        }}
      />
  );
});
const AnimatedMoon = React.memo(() => {
  const Crat = ({ className }) => (
    <div className={`absolute rounded-full shadow-[inset_1px_4px_5px_1px_rgb(185,173,185)] border-2 border-[rgb(216,205,219)] ${className}`} />
  );
  return (
      <div
        className="relative w-[150px] h-[150px] rounded-full bg-[radial-gradient(circle,rgba(222,213,228,0.887)_4%,rgb(248,246,246)_100%)] shadow-[0_0_70px_10px_#f5e4e4ab,0_0_70px_20px_#ca69b5dc,0_0_70px_30px_#e772e1dc]"
        style={{ animation: 'move 5s infinite', transform: 'scale(0.4)' }}
      >
        <Crat className="top-[80px] left-[70px] w-[30px] h-[30px]" />
        <Crat className="top-[45px] left-[40px] w-[10px] h-[10px]" />
        <Crat className="top-[25px] left-[50px] w-[20px] h-[20px]" />
        <Crat className="top-[35px] left-[100px] w-[15px] h-[15px]" />
        <Crat className="top-[120px] left-[60px] w-[10px] h-[10px]" />
        <Crat className="top-[90px] left-[20px] w-[20px] h-[20px] shadow-[inset_1px_7px_7px_1px_rgb(204,183,204)]" />
      </div>
  );
});
const NightSkyElements = React.memo(() => {
  return (
    <>
      {/* Tara */}
      <div className="absolute top-[20%] left-[20%] w-1 h-1 rounded-full bg-slate-300 shadow-[0px_0px_16px_2px_rgb(233,179,215)]" style={{ animation: 'twinkle 3s infinite 3s' }} />
      <div className="absolute top-[25%] left-[80%] w-0.5 h-0.5 rounded-full bg-slate-300 shadow-[0px_0px_16px_2px_rgb(233,179,215)]" style={{ animation: 'twinkle 3s infinite 2s' }} />
      <div className="absolute top-[10%] left-[50%] w-0.5 h-0.5 rounded-full bg-slate-300 shadow-[0px_0px_16px_2px_rgb(233,179,215)]" style={{ animation: 'twinkle 3s infinite' }} />
      <div className="absolute top-[50%] left-[90%] w-px h-px rounded-full bg-slate-300 shadow-[0px_0px_16px_2px_rgb(233,179,215)]" style={{ animation: 'twinkle 3s infinite 1s' }} />
      <div className="absolute top-[60%] left-[10%] w-px h-px rounded-full bg-slate-300 shadow-[0px_0px_16px_2px_rgb(233,179,215)]" style={{ animation: 'twinkle 3s infinite 4s' }} />

      {/* Ulka */}
      <div
        className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[hsla(316,28%,92%,0.993)] shadow-[1px_-1px_1px_2px_rgb(238,8,108)]"
        style={{ animation: 'space 4s linear infinite 2s' }}
      />
    </>
  );
});

const Clouds = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[10%] w-full" style={{ animation: 'move-cloud 80s linear infinite 5s' }}>
        <img src="/cloud1.png" alt="cloud" className="absolute left-[10%] w-48 h-auto opacity-70 object-contain" />
      </div>
      <div className="absolute top-[25%] w-full" style={{ animation: 'move-cloud 50s linear infinite reverse' }}>
        <img src="/cloud2.png" alt="cloud" className="absolute right-[5%] w-64 h-auto opacity-80 object-contain" />
      </div>
      <div className="absolute top-[40%] w-full" style={{ animation: 'move-cloud 30s linear infinite 2s' }}>
        <img src="/cloud3.png" alt="cloud" className="absolute left-[20%] w-72 h-auto opacity-60 object-contain" />
      </div>
    </div>
  );
});

export default PrayerTimesPage;