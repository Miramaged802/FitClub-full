import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function ErrorFallback({ error, resetErrorBoundary }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
              <FiAlertTriangle className="text-error-600 dark:text-error-400 text-4xl" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
            We encountered an unexpected error. Please try again or return to
            the home page.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 rounded-lg text-left">
              <p className="text-sm font-mono text-error-700 dark:text-error-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={resetErrorBoundary}
              className="btn btn-primary flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-outline flex items-center"
            >
              <FiHome className="mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to console in development
        if (process.env.NODE_ENV === "development") {
          console.error("Error caught by boundary:", error, errorInfo);
        }
        // In production, you could send this to Sentry or another error tracking service
        // Example: Sentry.captureException(error);
      }}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;

