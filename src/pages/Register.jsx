import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { auth, users } from "../lib/supabase";

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      // Register with Supabase Auth
      const { data, error } = await auth.signUp(
        formData.email,
        formData.password,
        {
          first_name: firstName,
          last_name: lastName,
        }
      );

      if (error) {
        setErrors({ form: error.message || "Registration failed" });
      } else if (data) {
        if (data.message) {
          // Email confirmation required
          setErrors({ 
            form: 'Please check your email for the confirmation link before logging in.' 
          });
          // Optionally redirect to a confirmation page
          navigate('/login', { 
            state: { message: 'Please check your email for the confirmation link.' }
          });
        } else if (data.user) {
          // Create additional user profile data if needed
          await users.create({
            id: data.user.id,
            email: formData.email,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString(),
          });
          
          onRegister();
          navigate("/profile");
        }
      }
    } catch (err) {
      setErrors({ form: "An unexpected error occurred. Please try again." });
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety check
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(strength, 5);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthLabel = (strength) => {
    const labels = [
      "Very Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very Strong",
    ];
    return labels[strength];
  };

  const getStrengthColor = (strength) => {
    const colors = [
      "bg-error-500",
      "bg-error-400",
      "bg-warning-400",
      "bg-warning-500",
      "bg-success-400",
      "bg-success-500",
    ];
    return colors[strength];
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                Join FitClub and start your fitness journey
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input pl-10 ${
                        errors.name
                          ? "border-error-500 dark:border-error-500"
                          : ""
                      }`}
                      placeholder="John Doe"
                    />
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                      {errors.name}
                    </p>
                  )}
                </div>

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
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input pl-10 ${
                        errors.email
                          ? "border-error-500 dark:border-error-500"
                          : ""
                      }`}
                      placeholder="your@email.com"
                    />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`input pl-10 pr-10 ${
                        errors.password
                          ? "border-error-500 dark:border-error-500"
                          : ""
                      }`}
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                      {errors.password}
                    </p>
                  )}

                  {/* Password strength meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                          Password strength:
                        </span>
                        <span className="text-xs font-medium">
                          {getStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-light-background dark:bg-dark-background rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStrengthColor(
                            passwordStrength
                          )}`}
                          style={{
                            width: `${(passwordStrength + 1) * 16.66}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input pl-10 pr-10 ${
                        errors.confirmPassword
                          ? "border-error-500 dark:border-error-500"
                          : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-light-border dark:border-dark-border text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-primary-600 dark:text-primary-500 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-primary-600 dark:text-primary-500 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </motion.button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 dark:text-primary-500 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
