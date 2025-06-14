import { motion } from 'framer-motion';
import { FiInfo, FiDollarSign, FiPackage, FiMapPin } from 'react-icons/fi';

const GemCard = ({ gem }) => {
  const {
    name,
    images,
    carat,
    cut,
    clarity,
    color,
    price,
    certification,
    location,
    inventory
  } = gem;

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-48">
        <img
          src={images[0]}
          alt={name}
          className="w-full h-full object-cover"
        />
        {inventory < 5 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
            Low Stock: {inventory} left
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400">Carat:</span>
            <span className="ml-2 font-medium">{carat}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400">Cut:</span>
            <span className="ml-2 font-medium">{cut}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400">Clarity:</span>
            <span className="ml-2 font-medium">{clarity}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400">Color:</span>
            <span className="ml-2 font-medium">{color}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiDollarSign className="text-green-500" />
            <span className="ml-1 font-semibold">${price.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin className="mr-1" />
            <span>{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <FiInfo className="text-blue-500 mr-1" />
            <span className="text-blue-500">Cert: {certification}</span>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GemCard;