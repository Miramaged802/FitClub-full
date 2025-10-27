import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Authentication failed");
      }

      // Allowlist fallback via env (comma-separated emails)
      const allowlistedAdmins = (import.meta.env.VITE_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      // Prefer RPC check (bypasses RLS via SECURITY DEFINER)
      const { data: isAdminResult, error: isAdminError } = await supabase.rpc(
        "is_admin",
        { user_uuid: data.user.id }
      );

      if (isAdminError) {
        throw isAdminError;
      }

      const isAllowlisted = allowlistedAdmins.includes(
        (data.user.email || "").toLowerCase()
      );

      const hasAdmin = Boolean(isAdminResult);

      if (!hasAdmin && !isAllowlisted) {
        // Sign out the user if they don't have admin role
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
      <div className="w-full max-w-lg px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-xl rounded-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-dark-text">
              Admin Login
            </h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              Access the FitClub admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-light-text dark:text-dark-text"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-transparent text-light-text dark:text-dark-text placeholder-light-textSecondary/70 dark:placeholder-dark-textSecondary/70 outline-none focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-background transition-colors"
                  placeholder="admin@fitclub.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-light-text dark:text-dark-text"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-transparent text-light-text dark:text-dark-text placeholder-light-textSecondary/70 dark:placeholder-dark-textSecondary/70 outline-none focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-background transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-bg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In to Admin Dashboard"
              )}
            </motion.button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
            <div className="flex items-start">
              <FiShield className="text-warning-600 dark:text-warning-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                  Security Notice
                </h4>
                <p className="text-xs text-warning-700 dark:text-warning-300 mt-1">
                  This is a restricted area. Only authorized administrators can
                  access this dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Back to App */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              ← Back to FitClub App
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
