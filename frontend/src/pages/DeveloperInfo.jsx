import React from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Globe,
  Mail,
  Github,
  Linkedin,
  Twitter,
  ArrowLeft,
  Award,
  Heart,
  Sparkles,
  Users,
  BookOpen,
  Clock,
  Calendar,
  Zap,
  Cpu,
  Palette,
  Shield,
  Home,
  Info,
  CheckCircle,
  Facebook, // This was missing
} from "lucide-react";

const DeveloperInfo = () => {
  const developers = [
    {
      role: "Frontend Developer",
      name: "Sumaiya Afrin",
      id: "RMC",

      description:
        "Crafted beautiful, responsive user interfaces and ensured seamless user experience across all devices.",
      icon: Palette,
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      social: {
        github: "https://github.com/sumaiyaafrinme",
        linkedin: "",
        facebook: "https://www.facebook.com/share/1AU4pqj1JN/",
        email: "sumaiyaafrinsnighdha@gmail.com",
      },
      contributions: [
        "Designed and developed all frontend pages",
        "Implemented responsive layouts with Tailwind CSS",
        "Created interactive components and animations",
        "Integrated REST APIs with React",
        "Managed state using Zustand",
      ],
      techStack: [
        "React",
        "Tailwind CSS",
        "Zustand",
        "React Router",
        "Axios",
        "Lucide Icons",
      ],
    },
    {
      role: "Backend Developer",
      name: "Shamem Miah",
      id: "CUET 2108018",

      description:
        "Built the robust server architecture, database models, and secure authentication system.",
      icon: Cpu,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700",
      social: {
        github: "https://github.com/Shamem-Mia",
        linkedin: "https://www.linkedin.com/in/shamem-miah-2996902a5/",
        facebook: "https://www.facebook.com/shamem.al.mahdi18",
        email: "shamemmiah2@gmail.com",
      },
      contributions: [
        "Designed MongoDB database schemas",
        "Implemented JWT authentication & authorization",
        "Created RESTful APIs for all features",
        "Integrated Cloudinary for image uploads",
        "Set up email notifications with Nodemailer",
      ],
      techStack: [
        "Node.js",
        "Express",
        "MongoDB",
        "JWT",
        "multer",
        "Cloudinary",
        "Nodemailer",
      ],
    },
  ];

  const technologies = [
    {
      category: "Frontend",
      items: [
        "React",
        "Tailwind CSS",
        "Zustand",
        "React Router",
        "Axios",
        "Lucide Icons",
      ],
    },
    {
      category: "Backend",
      items: [
        "Node.js",
        "Express",
        "MongoDB",
        "JWT",
        "Cloudinary",
        "Nodemailer",
      ],
    },
    {
      category: "Tools",
      items: ["Git", "VS Code", "Postman", "MongoDB Atlas", "npm"],
    },
  ];

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Header with Back Button */}
      <div className="bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to About
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Code2 className="w-8 h-8 md:w-10 md:h-10" />
            Developers Informations
          </h1>
          <p className="text-emerald-100 text-lg mt-2">
            “When a person dies, all his deeds end except three: a continuing
            charity (Sadaqah Jariyah), beneficial knowledge, or a righteous
            child who prays for him.” — Prophet Muhammad ﷺ (Sahih Muslim)
          </p>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {developers.map((dev, index) => {
            const Icon = dev.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div
                  className={`${dev.color} p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                          {dev.role}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold mb-1">{dev.name}</h2>
                      <p className="text-emerald-100">{dev.id}</p>
                    </div>
                    <Award className="w-12 h-12 text-white/30" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {dev.description}
                  </p>

                  {/* Key Contributions */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Key Contributions
                    </h3>
                    <ul className="space-y-2">
                      {dev.contributions.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${dev.textColor} mt-0.5 flex-shrink-0`}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dev.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <a
                      href={dev.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 ${dev.lightColor} rounded-lg hover:opacity-80 transition`}
                    >
                      <Github className={`w-5 h-5 ${dev.textColor}`} />
                    </a>
                    <a
                      href={dev.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 ${dev.lightColor} rounded-lg hover:opacity-80 transition`}
                    >
                      <Linkedin className={`w-5 h-5 ${dev.textColor}`} />
                    </a>
                    <a
                      href={dev.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 ${dev.lightColor} rounded-lg hover:opacity-80 transition`}
                    >
                      <Facebook className={`w-5 h-5 ${dev.textColor}`} />
                    </a>
                    <a
                      href={`mailto:${dev.social.email}`}
                      className={`p-2 ${dev.lightColor} rounded-lg hover:opacity-80 transition`}
                    >
                      <Mail className={`w-5 h-5 ${dev.textColor}`} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technologies Used */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-emerald-800 text-center mb-8 flex items-center justify-center gap-2">
            <Globe className="w-6 h-6" />
            Technologies Powering This Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-emerald-50 rounded-xl p-6">
                <h3 className="font-bold text-emerald-800 mb-4 text-lg">
                  {tech.category}
                </h3>
                <div className="space-y-2">
                  {tech.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message from Developers */}
      <div className="bg-emerald-700 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-emerald-100 text-lg leading-relaxed">
            "We built this platform with love and dedication to serve the CUET
            community. Our goal is to make mosque services accessible, modern,
            and user-friendly. May Allah accept our efforts and benefit the
            ummah."
          </p>
          <p className="text-emerald-300 mt-6"></p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-emerald-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-emerald-700 transition flex items-center gap-1"
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-emerald-700 transition flex items-center gap-1"
            >
              <Info className="w-4 h-4" /> About
            </Link>
            <Link
              to="/books"
              className="text-gray-600 hover:text-emerald-700 transition flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" /> Library
            </Link>
            <Link
              to="/prayer-times"
              className="text-gray-600 hover:text-emerald-700 transition flex items-center gap-1"
            >
              <Clock className="w-4 h-4" /> Prayer Times
            </Link>
            <Link
              to="/events"
              className="text-gray-600 hover:text-emerald-700 transition flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" /> Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperInfo;
