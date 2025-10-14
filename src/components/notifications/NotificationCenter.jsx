import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiPackage, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'inventory',
      message: 'Low stock alert: Diamond Ring (2ct)',
      time: '5 minutes ago',
      icon: <FiPackage className="text-orange-500" />,
      read: false
    },
    {
      id: 2,
      type: 'price',
      message: 'Price update: Market value increased by 5%',
      time: '1 hour ago',
      icon: <FiTrendingUp className="text-green-500" />,
      read: false
    },
    {
      id: 3,
      type: 'alert',
      message: 'Certification renewal due in 7 days',
      time: '2 hours ago',
      icon: <FiAlertCircle className="text-red-500" />,
      read: true
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {notification.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;