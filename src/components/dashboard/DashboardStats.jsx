import { FiTrendingUp, FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: <FiDollarSign className="text-green-500" size={24} />,
    },
    {
      title: 'Total Inventory',
      value: stats.inventory,
      change: stats.inventoryChange,
      icon: <FiPackage className="text-blue-500" size={24} />,
    },
    {
      title: 'Active Customers',
      value: stats.customers,
      change: stats.customerChange,
      icon: <FiUsers className="text-purple-500" size={24} />,
    },
    {
      title: 'Sales Growth',
      value: `${stats.salesGrowth}%`,
      change: stats.salesGrowthChange,
      icon: <FiTrendingUp className="text-orange-500" size={24} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
              {stat.icon}
            </div>
            <span className={`text-sm font-medium ${
              stat.change > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {stat.title}
          </h3>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;