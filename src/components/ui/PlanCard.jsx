import { useState } from "react";
import { FiCheck, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";

const PlanCard = ({
  name,
  price,
  period = "month",
  description,
  features,
  popular = false,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div className="relative h-full">
      <motion.div
        className={`card h-full flex flex-col ${
          popular
            ? "border-2 border-primary-500 dark:border-primary-600"
            : "border border-light-border dark:border-dark-border"
        }`}
        whileHover={{
          y: -5,
          transition: { type: "spring", stiffness: 300 },
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md z-10">
            <div className="flex items-center space-x-1">
              <span>⭐</span>
              <span>Most Popular</span>
            </div>
          </div>
        )}

        <div className="p-6 flex-grow">
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-4">
            {description}
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold">${price}</span>
            {period && (
              <span className="text-light-textSecondary dark:text-dark-textSecondary">
                /{period}
              </span>
            )}
          </div>

          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-light-textPrimary dark:text-dark-textPrimary">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 pt-0 mt-auto border-t border-light-border dark:border-dark-border">
          <motion.button
            className={`w-full btn ${
              popular ? "btn-primary" : "btn-outline"
            } shadow-sm`}
            onClick={onSelect}
            whileTap={{ scale: 0.97 }}
            animate={{
              scale: isHovered ? 1.03 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            Choose Plan
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlanCard;
