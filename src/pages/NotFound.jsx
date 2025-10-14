import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="container-custom">
        <motion.div 
          className="max-w-lg mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-primary-600 dark:text-primary-500 mb-6">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Page Not Found</h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/" className="btn btn-primary w-full sm:w-auto flex items-center justify-center">
              <FiHome className="mr-2" size={18} />
              Go Home
            </Link>
            <button onClick={() => window.history.back()} className="btn btn-outline w-full sm:w-auto flex items-center justify-center">
              <FiArrowLeft className="mr-2" size={18} />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;