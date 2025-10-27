import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiShield } from "react-icons/fi";
import Logo from "../ui/Logo.jsx";
import PropTypes from "prop-types";
import { auth, users } from "../../lib/supabaseClient";

const Header = ({ isLoggedIn, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Plans", path: "/plans" },
    { name: "Gyms", path: "/gyms" },
    { name: "Articles", path: "/articles" },
    { name: "Staff Portal", path: "/gym-staff" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Load current user's profile (name, avatar) and check admin status when logged in
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn) {
        setUserProfile(null);
        setIsAdmin(false);
        return;
      }

      const { user } = await auth.getUser();
      if (!user) {
        setUserProfile(null);
        setIsAdmin(false);
        return;
      }

      let displayName = user.user_metadata?.full_name || user.email || "Member";
      let avatarUrl =
        user.user_metadata?.avatar_url ||
        "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2";

      try {
        const { data: profileData } = await users.getById(user.id);
        if (profileData) {
          const firstName = profileData.first_name || "";
          const lastName = profileData.last_name || "";
          const full = `${firstName} ${lastName}`.trim();
          displayName = full || displayName;
          avatarUrl = profileData.avatar_url || avatarUrl;
        }
      } catch {
        // fallback to auth metadata values
      }

      // Check if user is admin
      try {
        const { data: adminStatus } = await auth.isAdmin(user.id);
        setIsAdmin(adminStatus || false);
      } catch {
        setIsAdmin(false);
      }

      setUserProfile({
        name: displayName,
        avatar: avatarUrl,
      });
    };

    loadProfile();
  }, [isLoggedIn]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-light-background/90 dark:bg-dark-background/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                location.pathname === link.path
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-light-text dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-light-card dark:hover:bg-dark-card transition-colors"
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {/* Auth buttons */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-light-card dark:hover:bg-dark-card"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-light-card dark:bg-dark-card">
                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser size={18} />
                    </div>
                  )}
                </div>
                <span className="max-w-[12rem] truncate text-sm font-medium">
                  {userProfile?.name || "Account"}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg py-2 z-50"
                  role="menu"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-light-background dark:hover:bg-dark-background"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-light-background dark:hover:bg-dark-background text-purple-600 dark:text-purple-400"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FiShield size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-light-background dark:hover:bg-dark-background"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn btn-outline">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-light-card dark:hover:bg-dark-card transition-colors"
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-light-card dark:hover:bg-dark-card"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-light-background dark:bg-dark-background border-t border-light-border dark:border-dark-border animate-fade-in">
          <div className="container-custom py-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? "bg-light-card dark:bg-dark-card text-primary-600 dark:text-primary-400"
                    : "hover:bg-light-card dark:hover:bg-dark-card"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-light-border dark:border-dark-border">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-light-card dark:hover:bg-dark-card"
                  >
                    <FiUser size={18} />
                    <span>Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-light-card dark:hover:bg-dark-card text-purple-600 dark:text-purple-400"
                    >
                      <FiShield size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={onLogout}
                    className="w-full mt-3 btn btn-outline"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="w-full btn btn-outline mb-3">
                    Log In
                  </Link>
                  <Link to="/register" className="w-full btn btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

Header.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Header;
