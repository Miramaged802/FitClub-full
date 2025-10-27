import React from "react";
import { motion } from "framer-motion";
import { FiServer, FiRefreshCw, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Error500 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Animated Server Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
              <FiServer className="text-error-600 dark:text-error-400 text-6xl" />
            </div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-error-200 dark:bg-error-800 -z-10"
            />
          </div>
        </motion.div>

        {/* Error Code */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-9xl font-bold text-error-600 dark:text-error-400 mb-4"
        >
          500
        </motion.h1>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-4">Internal Server Error</h2>
          <p className="text-lg text-light-textSecondary dark:text-dark-textSecondary mb-8 max-w-md mx-auto">
            Oops! Something went wrong on our end. We&apos;re working to fix the
            issue. Please try again later.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiRefreshCw />
            Refresh Page
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn btn-outline flex items-center gap-2"
          >
            <FiHome />
            Back to Home
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 bg-light-card dark:bg-dark-card rounded-lg"
        >
          <h3 className="font-semibold mb-2">What you can do:</h3>
          <ul className="text-sm text-light-textSecondary dark:text-dark-textSecondary space-y-2">
            <li>• Try refreshing the page</li>
            <li>• Clear your browser cache</li>
            <li>• Come back in a few minutes</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Error500;

