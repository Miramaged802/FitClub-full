import React from "react";
import { motion } from "framer-motion";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  emoji,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon or Emoji */}
      {emoji ? (
        <div className="text-6xl mb-6">{emoji}</div>
      ) : Icon ? (
        <div className="w-20 h-20 rounded-full bg-light-background dark:bg-dark-background flex items-center justify-center mb-6">
          <Icon className="text-4xl text-light-textSecondary dark:text-dark-textSecondary" />
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-light-textSecondary dark:text-dark-textSecondary max-w-md mb-8">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && actionLabel && (
        <button onClick={action} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;

