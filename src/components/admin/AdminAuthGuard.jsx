import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { FiShield, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";

const AdminAuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(async () => {
    try {
      // Check if user is authenticated
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Prefer RPC check (bypasses RLS via SECURITY DEFINER)
      const { data: isAdminResult, error: isAdminError } = await supabase.rpc(
        "is_admin",
        { user_uuid: session.user.id }
      );

      if (isAdminError) {
        throw isAdminError;
      }

      if (!isAdminResult) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        toast.error("Access denied. Admin privileges required.");
        navigate("/admin/login");
        return;
      }

      setIsAuthenticated(true);
      setIsAdmin(true);
    } catch (error) {
      console.error("Admin auth check error:", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      toast.error("Authentication failed. Please log in again.");
      navigate("/admin/login");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-bg dark:to-dark-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-xl rounded-xl text-center text-light-text dark:text-dark-text"
        >
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLoader className="text-2xl text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">
            Verifying Admin Access
          </h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary">
            Please wait while we verify your admin privileges...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-xl rounded-xl text-center text-light-text dark:text-dark-text max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-error-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-light-text dark:text-dark-text">
            Access Denied
          </h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
            You don&apos;t have the necessary permissions to access the admin
            dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/login")}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-bg"
            >
              Go to Admin Login
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-light-border dark:bg-dark-border hover:bg-light-hover dark:hover:bg-dark-hover text-light-text dark:text-dark-text font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-bg"
            >
              Back to FitClub App
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render children if authenticated and is admin
  return children;
};

export default AdminAuthGuard;

AdminAuthGuard.propTypes = {
  children: PropTypes.node,
};
