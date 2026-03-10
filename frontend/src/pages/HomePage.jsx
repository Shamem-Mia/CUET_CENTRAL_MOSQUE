import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookStore } from "../stores/useBookStore";
import { usePrayerSettingsStore } from "../stores/usePrayerSettingsStore";
import {
  BookOpen,
  Clock,
  Calendar,
  Info,
  ArrowRight,
  ChevronRight,
  Quote,
  Heart,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from "lucide-react";

const HomePage = () => {
  const { books, getBooks, loading } = useBookStore();
  const { prayerTimes: settingsPrayerTimes, getPrayerTimes } =
    usePrayerSettingsStore();
  const [displayBooks, setDisplayBooks] = useState([]);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const [jumuahInfo, setJumuahInfo] = useState(null);

  // Islamic quotes/hadith array
  const islamicQuotes = [
    {
      text: "The best among you are those who learn the Quran and teach it.",
      source: "Sahih al-Bukhari",
    },
    {
      text: "Seeking knowledge is an obligation upon every Muslim.",
      source: "Sunan Ibn Majah",
    },
    {
      text: "Whoever follows a path in pursuit of knowledge, Allah makes easy for him a path to Paradise.",
      source: "Sahih Muslim",
    },
    {
      text: "Read! In the name of your Lord who created.",
      source: "Surah Al-Alaq (96:1)",
    },
    {
      text: "My Lord, increase me in knowledge.",
      source: "Surah Taha (20:114)",
    },
    {
      text: "Are those who know equal to those who do not know?",
      source: "Surah Az-Zumar (39:9)",
    },
  ];

  const [currentQuote, setCurrentQuote] = useState(islamicQuotes[0]);

  // Get icon based on prayer name
  const getPrayerIcon = (prayerName) => {
    switch (prayerName) {
      case "Fajr":
        return <Sunrise className="w-4 h-4" />;
      case "Dhuhr":
      case "Jumu'ah":
        return <Sun className="w-4 h-4" />;
      case "Asr":
        return <Sun className="w-4 h-4" />;
      case "Maghrib":
        return <Sunset className="w-4 h-4" />;
      case "Isha":
        return <Moon className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format time to 12-hour format
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

  // Get BD time helper
  const getBDTime = () => {
    return new Date(Date.now() + timeOffset);
  };

  // Fetch prayer times
  useEffect(() => {
    const fetchPrayerData = async () => {
      try {
        const data = await getPrayerTimes();
        if (data && data.prayers?.length) {
          setPrayerTimes(data.prayers);
          if (data.settings) {
            setJumuahInfo({
              enabled: data.settings.jumuahEnabled,
              time: data.settings.jumuahTime,
              iqamah: data.settings.jumuahIqamah,
            });
          }
        }

        // Get server time offset
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
      } catch (err) {
        console.error("Failed to fetch prayer times:", err);
      }
    };

    fetchPrayerData();
  }, []);

  // Update current prayer based on time
  useEffect(() => {
    if (!prayerTimes.length) return;

    const updateCurrentPrayer = () => {
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

      // Find current prayer (the last prayer that has passed)
      let current = null;
      let next = null;
      let smallestDiff = Infinity;

      // Sort prayers by time
      const sortedPrayers = [...prayerTimes].sort((a, b) => {
        const [aH, aM] = a.raw.split(":").map(Number);
        const [bH, bM] = b.raw.split(":").map(Number);
        return aH * 60 + aM - (bH * 60 + bM);
      });

      // Find current and next prayer
      for (let i = 0; i < sortedPrayers.length; i++) {
        const p = sortedPrayers[i];
        const [h, m] = p.raw.split(":").map(Number);
        const pMinutes = h * 60 + m;

        if (pMinutes <= currentMinutes) {
          current = p;
        }

        const diff = pMinutes - currentMinutes;
        if (diff > 0 && diff < smallestDiff) {
          smallestDiff = diff;
          next = p;
        }
      }

      // If no next prayer found, it's next day's Fajr
      if (!next && sortedPrayers.length > 0) {
        next = sortedPrayers[0];
      }

      setCurrentPrayer(current);
      setNextPrayer(next);
    };

    updateCurrentPrayer();
    const timer = setInterval(updateCurrentPrayer, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes, timeOffset]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * islamicQuotes.length);
      setCurrentQuote(islamicQuotes[randomIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch books on component mount
  useEffect(() => {
    getBooks(1, "", "");
  }, []);

  // Update display books when books change
  useEffect(() => {
    if (books && books.length > 0) {
      setDisplayBooks(books.slice(0, 8)); // Show first 8 books
    }
  }, [books]);

  const cards = [
    {
      id: 1,
      title: "Library",
      description: "Browse our collection of Islamic books and resources",
      icon: BookOpen,
      link: "/books",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
    {
      id: 2,
      title: "Prayer Times",
      description: "View daily prayer times and schedules",
      icon: Clock,
      link: "/prayer-times",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      id: 3,
      title: "Events",
      description: "Upcoming programs and community gatherings",
      icon: Calendar,
      link: "/events",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      id: 4,
      title: "About",
      description: "Learn about CUET Central Mosque",
      icon: Info,
      link: "/about",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
  ];

  // Check if today is Friday
  const isFriday = currentTime.getDay() === 5;

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Hero Section with Hadith/Ayat and Prayer Time */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white relative">
        {/* Prayer Time Widget - Top Right */}
        {currentPrayer && nextPrayer && (
          <div className="absolute top-2 right-2 md:top-6 md:right-6 lg:top-4 lg:right-4">
            <Link
              to="/prayer-times"
              className="block bg-white/10 backdrop-blur-md rounded-lg p-3 md:p-4 hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <div className="text-right">
                {/* Current Prayer */}
                <div className="flex items-center justify-end gap-2 mb-2">
                  <span className="text-xs md:text-sm text-emerald-200">
                    Current
                  </span>
                  <div className="flex items-center gap-1 bg-emerald-600/30 px-2 py-1 rounded">
                    {getPrayerIcon(currentPrayer.name)}
                    <span className="text-sm md:text-base font-bold">
                      {currentPrayer.name}
                    </span>
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
                  {currentPrayer.time}
                </div>

                {/* Next Prayer */}
                <div className="flex items-center justify-end gap-2 text-xs md:text-sm text-emerald-200">
                  <span>Next: {nextPrayer.name}</span>
                  <span className="font-medium">{nextPrayer.time}</span>
                  <Clock className="w-3 h-3" />
                </div>

                {/* Jumu'ah Indicator (if Friday) */}
                {isFriday && jumuahInfo?.enabled && (
                  <div className="mt-2 text-xs bg-amber-500/30 px-2 py-1 rounded text-amber-200">
                    Jumu'ah Today: {formatTime12(jumuahInfo.time)}
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Quote className="w-12 h-12 mx-auto mb-6 text-emerald-300 opacity-50" />
            <p className="text-xl md:text-2xl lg:text-3xl font-arabic mb-4 leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-emerald-200 text-sm md:text-base">
              — {currentQuote.source}
            </p>
            <div className="flex justify-center gap-2 mt-6">
              {islamicQuotes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    islamicQuotes[index] === currentQuote
                      ? "bg-emerald-300"
                      : "bg-emerald-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={card.link}
                className={`${card.bgColor} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border ${card.borderColor}`}
              >
                <div className="p-4 md:p-6 flex flex-col items-center text-center">
                  {/* Icon Circle */}
                  <div
                    className={`${card.iconBg} p-3 rounded-full mb-3 md:mb-4`}
                  >
                    <Icon
                      className={`w-6 h-6 md:w-8 md:h-8 ${card.iconColor}`}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-1 md:mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4 line-clamp-2 hidden md:block">
                    {card.description}
                  </p>

                  {/* Mobile Description - shorter */}
                  <p className="text-xs text-gray-600 mb-2 block md:hidden line-clamp-1">
                    {card.description}
                  </p>

                  {/* Arrow Link */}
                  <div className="flex items-center text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Available Books Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
            Available Books
          </h2>
          <Link
            to="/books"
            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm md:text-base font-medium"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
          </div>
        ) : displayBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No books available
            </h3>
            <p className="text-gray-500">Check back later for new additions</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {displayBooks.map((book) => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[3/4] bg-emerald-100 relative">
                  {book.coverImage?.url ? (
                    <img
                      src={book.coverImage.url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-emerald-400" />
                    </div>
                  )}
                  {book.availableQuantity <= 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Unavailable
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                    by {book.author}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {book.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {book.availableQuantity}/{book.quantity}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {books && books.length > 8 && (
          <div className="text-center mt-8">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              Browse All Books <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer with Advice/Message Section */}
      <footer className="bg-emerald-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Advice/Message Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-lg md:text-xl text-emerald-200 italic leading-relaxed">
              "The mosque is not just a place of worship, but a center for
              learning, community, and spiritual growth. We welcome you to be
              part of our family."
            </p>
            <p className="text-emerald-300 mt-4">
              — CUET Central Mosque Administration
            </p>
          </div>

          {/* Footer Links and Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-emerald-700 pt-8">
            {/* About Section */}
            <div>
              <h4 className="font-bold text-lg mb-4">CUET Central Mosque</h4>
              <p className="text-emerald-200 text-sm leading-relaxed">
                Serving the spiritual and educational needs of the CUET
                community .
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/books"
                    className="text-emerald-200 hover:text-white text-sm flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" /> Library
                  </Link>
                </li>
                <li>
                  <Link
                    to="/prayer-times"
                    className="text-emerald-200 hover:text-white text-sm flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" /> Prayer Times
                  </Link>
                </li>
                <li>
                  <Link
                    to="/events"
                    className="text-emerald-200 hover:text-white text-sm flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" /> Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-emerald-200 hover:text-white text-sm flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" /> About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-300 mt-0.5" />
                  <span className="text-emerald-200 text-sm">
                    CUET Central Mosque, Chittagong University of Engineering &
                    Technology
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-200 text-sm">
                    +8801833620248
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-200 text-sm">
                    info@cuetmosque.edu
                  </span>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-bold text-lg mb-4">Library Hours</h4>
              <ul className="space-y-2 text-emerald-200 text-sm">
                <li>Saturday - Thursday: 9:00 AM - 8:00 PM</li>
                <li>Friday: 2:00 PM - 8:00 PM</li>
                <li className="mt-4 text-emerald-100 font-medium">
                  Jumu'ah Prayer: 1:15 PM
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-emerald-700 mt-8 pt-8 text-center text-emerald-300 text-sm">
            <p>
              © {new Date().getFullYear()} CUET Central Mosque. All rights
              reserved.
            </p>
            <p className="mt-2 text-emerald-400 text-xs">
              "And remind, for indeed, the reminder benefits the believers."
              (Surah Adh-Dhariyat, 51:55)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
