import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  RefreshCw,
  User,
  LogIn,
  Settings,
  LogOut,
  Info,
  Phone,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Calendar,
  MapPin,
  Heart,
  Users,
  Moon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(".mobile-sidebar");
      const desktopMenu = document.querySelector(".desktop-menu");

      if (sidebar && !sidebar.contains(event.target)) {
        setIsMobileSidebarOpen(false);
      }

      if (desktopMenu && !desktopMenu.contains(event.target)) {
        const menuButton = document.querySelector(".desktop-menu-button");
        if (!menuButton?.contains(event.target)) {
          setIsDesktopMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileSidebarOpen, isDesktopMenuOpen]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const NavLink = ({ to, icon, text, onClick, closeSidebar = false }) => (
    <Link
      to={to}
      className="text-gray-800 hover:text-emerald-600 flex items-center p-2 rounded hover:bg-emerald-50 transition-colors duration-200"
      onClick={() => {
        if (closeSidebar) {
          setIsMobileSidebarOpen(false);
        }
        onClick?.();
      }}
    >
      <span className="mr-3 text-emerald-600">{icon}</span>
      <span className="font-medium">{text}</span>
    </Link>
  );

  return (
    <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Name */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-emerald-300">
              <Moon className="h-6 w-6 text-emerald-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight">
                CUET CENTRAL
              </span>
              <span className="text-sm font-medium leading-tight text-emerald-200">
                MOSQUE
              </span>
            </div>
          </Link>

          {/* Right side - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="hover:text-emerald-200 transition-colors duration-200 flex items-center"
            >
              <Home className="h-4 w-4 mr-1" /> Home
            </Link>
            <Link
              to="/prayer-times"
              className="hover:text-emerald-200 transition-colors duration-200 flex items-center"
            >
              <Clock className="h-4 w-4 mr-1" /> Prayer Times
            </Link>
            <Link
              to="/events"
              className="hover:text-emerald-200 transition-colors duration-200 flex items-center"
            >
              <Calendar className="h-4 w-4 mr-1" /> Events
            </Link>
            <Link
              to="/library"
              className="hover:text-emerald-200 transition-colors duration-200 flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-1" /> Library
            </Link>

            <button
              onClick={handleRefresh}
              className="hover:text-emerald-200 transition-colors duration-200 flex items-center"
              title="Refresh page"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
              className="text-white hover:text-emerald-200 transition-colors duration-200 flex items-center space-x-1 desktop-menu-button bg-emerald-600 px-3 py-1 rounded-md"
            >
              <span>Menu</span>
              {isDesktopMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Mobile Navigation (Icons only) */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="hover:text-emerald-200 transition"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="text-white focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Menu Dropdown */}
      <div
        className={`hidden md:block absolute right-4 mt-1 w-64 bg-white rounded-md shadow-xl z-50 desktop-menu transition-all duration-300 ease-out ${
          isDesktopMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="py-2">
          <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50">
            Mosque Navigation
          </div>
          <NavLink
            to="/"
            icon={<Home size={18} />}
            text="Home"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/prayer-times"
            icon={<Clock size={18} />}
            text="Prayer Times"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/events"
            icon={<Calendar size={18} />}
            text="Events & Programs"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/library"
            icon={<BookOpen size={18} />}
            text="Islamic Library"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/quran"
            icon={<BookOpen size={18} />}
            text="Quran Learning"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/about"
            icon={<Info size={18} />}
            text="About Mosque"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/contact"
            icon={<Phone size={18} />}
            text="Contact Us"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/location"
            icon={<MapPin size={18} />}
            text="Location"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <button
            onClick={() => {
              handleRefresh();
              setIsDesktopMenuOpen(false);
            }}
            className="w-full text-gray-800 hover:text-emerald-600 flex items-center p-2 rounded hover:bg-emerald-50 transition-colors duration-200"
          >
            <RefreshCw size={18} className="mr-3 text-emerald-600" />
            <span className="font-medium">Refresh Page</span>
          </button>

          <div className="border-t border-emerald-100 my-2"></div>

          <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50">
            Community
          </div>
          <NavLink
            to="/donate"
            icon={<Heart size={18} />}
            text="Donate / Sadaqah"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          <NavLink
            to="/volunteer"
            icon={<Users size={18} />}
            text="Volunteer"
            onClick={() => setIsDesktopMenuOpen(false)}
          />

          <div className="border-t border-emerald-100 my-2"></div>

          <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50">
            Account
          </div>
          {authUser ? (
            <>
              <NavLink
                to="/profile"
                icon={<User size={18} />}
                text="My Profile"
                onClick={() => setIsDesktopMenuOpen(false)}
              />
              <NavLink
                to="/settings"
                icon={<Settings size={18} />}
                text="Settings"
                onClick={() => setIsDesktopMenuOpen(false)}
              />
              <button
                onClick={() => {
                  logout(navigate);
                  setIsDesktopMenuOpen(false);
                  navigate("/");
                }}
                className="w-full text-gray-800 hover:text-emerald-600 flex items-center p-2 rounded hover:bg-emerald-50 transition-colors duration-200"
              >
                <LogOut size={18} className="mr-3 text-emerald-600" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              icon={<LogIn size={18} />}
              text="Login / Register"
              onClick={() => setIsDesktopMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Mobile Sidebar with transition */}
      <div
        className={`fixed inset-0 z-50 overflow-y-auto md:hidden transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {isMobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl mobile-sidebar">
              <div className="flex justify-between items-center p-4 border-b border-emerald-100 bg-emerald-50">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-800 leading-tight">
                      CUET CENTRAL
                    </span>
                    <span className="text-xs font-medium text-emerald-600 leading-tight">
                      MOSQUE
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-emerald-600 hover:text-emerald-800"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4">
                <nav className="flex flex-col space-y-1">
                  <div className="px-2 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 rounded">
                    Mosque Navigation
                  </div>
                  <NavLink
                    to="/"
                    icon={<Home size={18} />}
                    text="Home"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/prayer-times"
                    icon={<Clock size={18} />}
                    text="Prayer Times"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/events"
                    icon={<Calendar size={18} />}
                    text="Events & Programs"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/library"
                    icon={<BookOpen size={18} />}
                    text="Islamic Library"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/quran"
                    icon={<BookOpen size={18} />}
                    text="Quran Learning"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/about"
                    icon={<Info size={18} />}
                    text="About Mosque"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/contact"
                    icon={<Phone size={18} />}
                    text="Contact Us"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/location"
                    icon={<MapPin size={18} />}
                    text="Location"
                    closeSidebar={true}
                  />
                  <button
                    onClick={() => {
                      handleRefresh();
                      setIsMobileSidebarOpen(false);
                    }}
                    className="text-gray-800 hover:text-emerald-600 flex items-center p-2 rounded hover:bg-emerald-50 transition-colors duration-200 w-full text-left"
                  >
                    <RefreshCw size={18} className="mr-3 text-emerald-600" />
                    <span className="font-medium">Refresh Page</span>
                  </button>

                  <div className="border-t border-emerald-100 my-2"></div>

                  <div className="px-2 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 rounded">
                    Community
                  </div>
                  <NavLink
                    to="/donate"
                    icon={<Heart size={18} />}
                    text="Donate / Sadaqah"
                    closeSidebar={true}
                  />
                  <NavLink
                    to="/volunteer"
                    icon={<Users size={18} />}
                    text="Volunteer"
                    closeSidebar={true}
                  />

                  <div className="border-t border-emerald-100 my-2"></div>

                  <div className="px-2 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 rounded">
                    Account
                  </div>
                  {authUser ? (
                    <>
                      <NavLink
                        to="/profile"
                        icon={<User size={18} />}
                        text="My Profile"
                        closeSidebar={true}
                      />
                      <NavLink
                        to="/settings"
                        icon={<Settings size={18} />}
                        text="Settings"
                        closeSidebar={true}
                      />
                      <button
                        onClick={() => {
                          logout(navigate);
                          setIsMobileSidebarOpen(false);
                          navigate("/");
                        }}
                        className="text-gray-800 hover:text-emerald-600 flex items-center p-2 rounded hover:bg-emerald-50 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut size={18} className="mr-3 text-emerald-600" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <NavLink
                      to="/login"
                      icon={<LogIn size={18} />}
                      text="Login / Register"
                      closeSidebar={true}
                    />
                  )}
                </nav>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-emerald-50 border-t border-emerald-100">
                <p className="text-xs text-emerald-600 text-center">
                  "The mosque is the house of Allah"
                  <br />
                  <span className="text-emerald-500">CUET Central Mosque</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
