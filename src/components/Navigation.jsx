import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { AuthContext } from "../context/AuthContext";
import { User, LogOut, LogIn, X, Menu, ChevronDown, BookOpen, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ theme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Evaluation", href: "/evaluation" },
    {
      name: "Programs",
      isDropdown: true,
      href: "/#courses?tab=programs",
      subItems: [
        { name: "Mentorship - Prelims", href: "/#courses?tab=programs" },
        { name: "Mentorship - Mains", href: "/#courses?tab=programs" },
        { name: "Mentorship - Comprehensive (Pre + Mains)", href: "/#courses?tab=programs" }
      ]
    },
    {
      name: "Mains Writing",
      isDropdown: true,
      href: "/#courses?tab=mains",
      subItems: [
        { name: "Daily Mains Answer Writing", href: "/daily-mains-writing" },
        { name: "Answer Writing with Test Series", href: "/#courses?tab=mains" },
        { name: "Answer Evaluation", href: "/evaluation" }
      ]
    },
    {
      name: "Modules",
      isDropdown: true,
      href: "/#courses?tab=modules",
      subItems: [
        { name: "GS Paper IV - Ethics", href: "/#courses?tab=modules" },
        { name: "Geography", href: "/#courses?tab=modules" },
        { name: "Environment", href: "/#courses?tab=modules" },
        { name: "Essay", href: "/curriculum/essay" }
      ]
    },
    { name: "Study With Me", href: "/#study" },
    { name: "Blogs", href: "/#blogs" },
    { name: "Contact", href: "/#contact" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Direct Clean Logo */}
          <Link to="/" className="flex items-center shrink-0 py-1">
            <img
              src="/images/itopper.png"
              alt="iTopper Logo"
              className="h-14 sm:h-20 w-auto max-w-[220px] sm:max-w-[300px] object-contain transform scale-125 sm:scale-150 origin-left transition-all"
              style={{ maxHeight: "72px" }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.isDropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative py-2"
                    onMouseEnter={() => setHoveredDropdown(item.name)}
                    onMouseLeave={() => setHoveredDropdown(null)}
                  >
                    <button
                      className="flex items-center gap-1 font-bold text-sm tracking-wide text-slate-800 hover:text-[#0a2968] transition-colors py-1 cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          hoveredDropdown === item.name ? "rotate-180 text-[#EF961D]" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {hoveredDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-72 rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 bg-white text-slate-800"
                        >
                          {item.subItems.map((sub, idx) => (
                            <HashLink
                              smooth
                              key={idx}
                              to={sub.href}
                              className="block px-4 py-2.5 text-xs font-extrabold rounded-xl text-slate-700 hover:bg-blue-50 hover:text-[#0a2968] transition-colors"
                            >
                              {sub.name}
                            </HashLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <HashLink
                  smooth
                  key={item.name}
                  to={item.href}
                  className="relative text-sm font-bold tracking-wide text-slate-800 hover:text-[#0a2968] transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#EF961D] transition-all duration-300 group-hover:w-full"></span>
                </HashLink>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                {/* Sleek Circular Profile Avatar */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0a2968] hover:bg-[#EF961D] text-white flex items-center justify-center font-black text-sm shadow-xs transition-all cursor-pointer border-2 border-white ring-2 ring-slate-200 hover:ring-[#EF961D]"
                  title={`${user.name || 'Profile'} - Click for Menu`}
                >
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </button>

                {/* Profile Popup Menu (Desktop only, positioned neatly) */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 z-50 text-slate-800"
                    >
                      <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                        <div className="text-xs font-black text-[#0a2968] truncate">{user.name || "Student Aspirant"}</div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">{user.email}</div>
                      </div>

                      <Link
                        to="/my-courses"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-extrabold text-[#0a2968] hover:bg-blue-50 rounded-xl transition-colors mb-1"
                      >
                        <BookOpen size={16} className="text-[#EF961D]" /> My Courses & Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5"
              >
                <LogIn size={15} /> Login / Register
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#0a2968] bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 focus:outline-none cursor-pointer transition-colors"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsProfileOpen(false);
              }}
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer - Clean White Theme */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="xl:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* User Logged-in Header in Mobile Menu */}
              {user && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-black text-[#0a2968]">{user.name || "Aspirant"}</div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">{user.email}</div>
                  </div>
                  <Link
                    to="/my-courses"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-1.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-lg text-xs font-black flex items-center gap-1"
                  >
                    <BookOpen size={13} /> My Courses
                  </Link>
                </div>
              )}

              {navItems.map((item) => {
                if (item.isDropdown) {
                  const isDropdownOpen = activeMobileDropdown === item.name;
                  return (
                    <div key={item.name} className="border-b border-slate-100 pb-3">
                      <button
                        onClick={() => setActiveMobileDropdown(isDropdownOpen ? null : item.name)}
                        className="w-full flex items-center justify-between text-base font-extrabold text-[#0a2968] py-1 text-left cursor-pointer"
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 text-[#EF961D] ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isDropdownOpen && (
                        <div className="mt-2 pl-4 space-y-2 border-l-2 border-blue-100">
                          {item.subItems.map((sub, idx) => (
                            <HashLink
                              smooth
                              key={idx}
                              to={sub.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-1.5 text-xs font-extrabold text-slate-600 hover:text-[#0a2968]"
                            >
                              {sub.name}
                            </HashLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={item.name} className="border-b border-slate-100 pb-3">
                    <HashLink
                      smooth
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-base font-extrabold text-[#0a2968] hover:text-[#EF961D] transition-colors"
                    >
                      {item.name}
                    </HashLink>
                  </div>
                );
              })}

              {/* Mobile Drawer Logout button */}
              {user ? (
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold rounded-xl border border-red-200 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} /> Logout Account
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3.5 bg-[#0a2968] hover:bg-[#EF961D] text-white text-center font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all"
                  >
                    <LogIn size={16} /> Login / Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
