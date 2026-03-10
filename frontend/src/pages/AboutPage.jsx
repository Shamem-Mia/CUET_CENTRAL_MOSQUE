import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Calendar,
  History,
  Users,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  Heart,
  Sparkles,
} from "lucide-react";

const AboutPage = () => {
  const features = [
    {
      id: 1,
      title: "Library",
      description:
        "Browse our extensive collection of Islamic books. Request to borrow any book and track your requests.",
      icon: BookOpen,
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-600",
      link: "/books",
      stats: "500+ Books",
    },
    {
      id: 2,
      title: "Prayer Times",
      description:
        "Accurate daily prayer times with beautiful visual display. Know Fajr, Dhuhr, Asr, Maghrib, and Isha times.",
      icon: Clock,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
      link: "/prayer-times",
      stats: "5 Daily Prayers",
    },
    {
      id: 3,
      title: "Events",
      description:
        "Join our community events, lectures, and programs. Register online and get reminders.",
      icon: Calendar,
      color: "bg-purple-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconColor: "text-purple-600",
      link: "/events",
      stats: "Monthly Events",
    },
    {
      id: 4,
      title: "History",
      description:
        "Track all your borrowing history, event registrations, and account activity in one place.",
      icon: History,
      color: "bg-amber-600",
      lightColor: "bg-amber-50",
      textColor: "text-amber-700",
      iconColor: "text-amber-600",
      link: "/my-borrowings",
      stats: "Personal Records",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Browse & Discover",
      description:
        "Explore our library catalog, prayer times, and upcoming events.",
    },
    {
      step: 2,
      title: "Request & Register",
      description: "Request books and register for events with a single click.",
    },
    {
      step: 3,
      title: "Track & Manage",
      description:
        "Monitor your requests, borrowings, and registrations in your history.",
    },
  ];

  const prayerTimesSummary = [
    { name: "Fajr", icon: Sunrise, time: "05:00 AM" },
    { name: "Dhuhr", icon: Sun, time: "12:30 PM" },
    { name: "Asr", icon: Sun, time: "03:45 PM" },
    { name: "Maghrib", icon: Sunset, time: "06:20 PM" },
    { name: "Isha", icon: Moon, time: "07:45 PM" },
  ];

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About CUET Central Mosque
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              A complete digital platform for our mosque community — library,
              prayer times, events, and personal history tracking, all in one
              place.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-emerald-800 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to stay connected with your mosque community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.id}
                to={feature.link}
                className={`${feature.lightColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group`}
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Icon Container */}
                    <div
                      className={`${feature.color} p-4 rounded-2xl shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Stats and Link */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${feature.textColor}`}
                        >
                          {feature.stats}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                          Learn More <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple三步 process to use all features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center relative">
                {/* Step Number */}
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">
                  {item.step}
                </div>

                {/* Connector Line (except last) */}
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-emerald-200 -z-0"></div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats / Prayer Times Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-emerald-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Stats */}
            <div className="p-8 lg:p-12 bg-emerald-800">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-300" />
                Mosque at a Glance
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-emerald-100">
                    500+ Islamic books in library
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-emerald-100">
                    5 daily prayers with accurate times
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-emerald-100">
                    Monthly events and programs
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-emerald-100">
                    200+ active community members
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-emerald-100">
                    Jumu'ah prayers every Friday
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-600">
                <div className="flex items-center gap-2 text-emerald-200">
                  <MapPin className="w-4 h-4" />
                  <span>CUET Campus, Chattogram</span>
                </div>
              </div>
            </div>

            {/* Right Side - Prayer Times Preview */}
            <div className="p-8 lg:p-12 bg-white">
              <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-600" />
                Today's Prayer Times
              </h3>

              <div className="space-y-3">
                {prayerTimesSummary.map((prayer) => {
                  const Icon = prayer.icon;
                  return (
                    <div
                      key={prayer.name}
                      className="flex items-center justify-between py-2 border-b border-emerald-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-gray-700">
                          {prayer.name}
                        </span>
                      </div>
                      <span className="text-emerald-700 font-semibold">
                        {prayer.time}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/prayer-times"
                className="mt-6 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Full Schedule <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-emerald-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community today and access all these features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition inline-flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Register Now
            </Link>
            <Link
              to="/books"
              className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold border-2 border-emerald-600 hover:bg-emerald-50 transition inline-flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Browse Library
            </Link>
          </div>
        </div>
      </div>

      {/* Link to Developer Info */}
      <div className="border-t border-emerald-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/developers"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition group"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition" />
            <span>Meet the Developers Behind This Platform</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
