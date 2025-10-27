import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiLogOut,
  FiMapPin,
  FiSliders,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
   ${
     isActive
       ? "bg-primary-600 text-white shadow-md"
       : "text-light-textSecondary dark:text-dark-textSecondary hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400"
   }`;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    { to: "/", icon: FiHome, label: "Home", end: true },
    { to: "/admin", icon: FiSliders, label: "Dashboard", end: true },
    { to: "/admin/users", icon: FiUsers, label: "Users" },
    { to: "/admin/gyms", icon: FiMapPin, label: "Gyms" },
    { to: "/admin/payments", icon: FiCreditCard, label: "Payments" },
    { to: "/admin/analytics", icon: FiBarChart2, label: "Analytics" },
  ];

  return (
    <aside className="h-screen sticky top-0 w-64 border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-background flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-light-border dark:border-dark-border">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <FiBarChart2 className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
              FitClub
            </h2>
            <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Admin Dashboard
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink to={item.to} className={navItemClass} end={item.end}>
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-light-card dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200 font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-background"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <FiMoon className="text-lg text-light-text dark:text-dark-text" />
          ) : (
            <FiSun className="text-lg text-light-text dark:text-dark-text" />
          )}
          <span className="text-light-text dark:text-dark-text">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
        </motion.button>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-error-600 text-white hover:bg-error-700 transition-all duration-200 font-medium shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-background"
        >
          <FiLogOut className="text-lg" />
          Logout
        </motion.button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
