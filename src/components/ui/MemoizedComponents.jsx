import React, { memo } from "react";
import { motion } from "framer-motion";

/**
 * Memoized Card component to prevent unnecessary re-renders
 */
export const Card = memo(({ children, className = "", onClick }) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
});

Card.displayName = "Card";

/**
 * Memoized Button component
 */
export const Button = memo(
  ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled = false,
    className = "",
    type = "button",
    loading = false,
  }) => {
    const baseClasses = "btn";
    const variantClasses = {
      primary: "btn-primary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      secondary: "btn-secondary",
    };
    const sizeClasses = {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * Memoized Badge component
 */
export const Badge = memo(({ children, variant = "default", className = "" }) => {
  const variantClasses = {
    default: "bg-light-background dark:bg-dark-background",
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400",
    success: "bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400",
    error: "bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400",
    warning: "bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

/**
 * Memoized Input component
 */
export const Input = memo(
  ({
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    className = "",
    required = false,
    disabled = false,
    error,
  }) => {
    return (
      <div className="w-full">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input w-full ${error ? "border-error-500" : ""} ${className}`}
          required={required}
          disabled={disabled}
        />
        {error && (
          <p className="text-error-600 dark:text-error-400 text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Memoized Motion Card component
 */
export const MotionCard = memo(
  ({ children, className = "", delay = 0, ...motionProps }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`card ${className}`}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

/**
 * Memoized Stat Card component
 */
export const StatCard = memo(
  ({ icon: Icon, label, value, trend, color = "bg-primary-600" }) => {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">
              {label}
            </p>
            <h3 className="text-3xl font-bold">{value}</h3>
            {trend && (
              <p className="text-sm text-success-600 dark:text-success-400 mt-1">
                {trend}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={`w-16 h-16 rounded-full ${color} flex items-center justify-center`}
            >
              <Icon className="text-2xl text-white" />
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

/**
 * Memoized Grid component
 */
export const Grid = memo(
  ({
    children,
    cols = { default: 1, sm: 2, md: 3, lg: 4 },
    gap = 6,
    className = "",
  }) => {
    const gridClasses = `grid grid-cols-${cols.default} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} gap-${gap} ${className}`;

    return <div className={gridClasses}>{children}</div>;
  }
);

Grid.displayName = "Grid";

/**
 * Memoized Container component
 */
export const Container = memo(({ children, className = "" }) => {
  return <div className={`container-custom ${className}`}>{children}</div>;
});

Container.displayName = "Container";

/**
 * Memoized Section component
 */
export const Section = memo(
  ({ children, className = "", fullWidth = false }) => {
    return (
      <section className={`py-16 ${fullWidth ? "" : "container-custom"} ${className}`}>
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export default {
  Card,
  Button,
  Badge,
  Input,
  MotionCard,
  StatCard,
  Grid,
  Container,
  Section,
};

