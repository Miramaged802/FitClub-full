import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiFacebook,
  FiTwitter,
  FiGithub,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { auth } from "../lib/supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await auth.signIn(email, password);

      if (error) {
        setError(error.message || "Failed to sign in");
      } else if (data && data.user) {
        // Authentication state will be updated automatically by App.jsx
        navigate("/profile");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 flex items-center">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                Sign in to access your FitClub account
              </p>
            </div>

            {error && (
              <div className="bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400 p-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="your@email.com"
                    />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-600 dark:text-primary-500 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="••••••••"
                    />
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-light-border dark:border-dark-border text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm">
                    Remember me
                  </label>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </motion.button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-light-border dark:border-dark-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-light-card dark:bg-dark-card text-light-textSecondary dark:text-dark-textSecondary">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button type="button" className="btn btn-outline">
                  <FiFacebook />
                </button>
                <button type="button" className="btn btn-outline">
                  <FiTwitter />
                </button>
                <button type="button" className="btn btn-outline">
                  <FiGithub />
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 dark:text-primary-500 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
