import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiMapPin,
  FiTrendingUp,
} from "react-icons/fi";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import { supabase } from "../../lib/supabaseClient";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalGyms: 0,
    growthRate: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [gymActivityData, setGymActivityData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Load stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: gymsCount } = await supabase
        .from("gyms")
        .select("*", { count: "exact", head: true });

      const { data: payments } = await supabase
        .from("payments_log")
        .select("amount, created_at, status")
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      const { data: recentPaymentsData } = await supabase
        .from("payments_log")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5);

      const totalRevenue =
        payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const revenueByMonth = generateMonthlyRevenueData(payments);
      const userGrowth = await generateUserGrowthData();
      const subscriptionDistribution = await getSubscriptionDistribution();
      const gymActivity = await getGymActivityData();

      // Count active subscriptions
      const { data: activeSubs } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("status", "active");

      setStats({
        totalUsers: usersCount || 0,
        totalRevenue,
        activeSubscriptions: activeSubs?.length || 0,
        totalGyms: gymsCount || 0,
        growthRate: calculateGrowthRate(payments),
      });

      setRevenueData(revenueByMonth);
      setUserGrowthData(userGrowth);
      setSubscriptionData(subscriptionDistribution);
      setGymActivityData(gymActivity);
      setRecentPayments(recentPaymentsData || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthlyRevenueData = (payments) => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthTotal =
        payments
          ?.filter((p) => {
            const paymentDate = new Date(p.created_at);
            return (
              paymentDate.getMonth() === date.getMonth() &&
              paymentDate.getFullYear() === date.getFullYear()
            );
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      months.push({ month: monthName, revenue: monthTotal });
    }
    return months;
  };

  const generateUserGrowthData = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("created_at")
      .order("created_at", { ascending: true });

    const months = [];
    const now = new Date();
    let cumulative = 0;

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthUsers =
        profiles?.filter((p) => {
          const userDate = new Date(p.created_at);
          return (
            userDate.getMonth() === date.getMonth() &&
            userDate.getFullYear() === date.getFullYear()
          );
        }).length || 0;
      cumulative += monthUsers;
      months.push({
        month: monthName,
        users: cumulative,
        newUsers: monthUsers,
      });
    }
    return months;
  };

  const getSubscriptionDistribution = async () => {
    // Get subscription distribution from profiles table
    const { data: profiles } = await supabase
      .from("profiles")
      .select("subscription_level");

    const distribution = {};
    profiles?.forEach((profile) => {
      const level = profile.subscription_level || "Basic";
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getGymActivityData = async () => {
    const { data: accessLogs } = await supabase
      .from("gym_access_logs")
      .select("gym_id, scanned_at");

    const gymCounts = {};
    accessLogs?.forEach((log) => {
      gymCounts[log.gym_id] = (gymCounts[log.gym_id] || 0) + 1;
    });

    const gymIds = Object.keys(gymCounts);
    const { data: gyms } = await supabase
      .from("gyms")
      .select("id, name")
      .in("id", gymIds);

    return Object.entries(gymCounts)
      .map(([gymId, visits]) => {
        const gym = gyms?.find((g) => g.id === gymId);
        return {
          name: gym?.name || `Gym ${gymId.substring(0, 8)}`,
          visits,
        };
      })
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  };

  const calculateGrowthRate = (payments) => {
    if (!payments || payments.length < 2) return 0;

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Calculate revenue for last month
    const lastMonthRevenue =
      payments
        ?.filter((p) => {
          const date = new Date(p.created_at);
          return date >= lastMonth && date < thisMonth;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Calculate revenue for this month (current month)
    const thisMonthRevenue =
      payments
        ?.filter((p) => {
          const date = new Date(p.created_at);
          return date >= thisMonth && date < nextMonth;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // If last month had no revenue but this month does, it's 100% growth
    if (lastMonthRevenue === 0 && thisMonthRevenue > 0) {
      return 100;
    }

    // If both months have no revenue, no growth
    if (lastMonthRevenue === 0 && thisMonthRevenue === 0) {
      return 0;
    }

    // Calculate percentage growth
    const growthRate =
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Debug logging
    console.log("Growth Rate Calculation:", {
      lastMonthRevenue,
      thisMonthRevenue,
      growthRate: Math.round(growthRate * 10) / 10,
      lastMonth: lastMonth.toISOString().split("T")[0],
      thisMonth: thisMonth.toISOString().split("T")[0],
      nextMonth: nextMonth.toISOString().split("T")[0],
    });

    // Round to 1 decimal place and ensure it's not negative infinity
    return Math.round(growthRate * 10) / 10;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 py-8 px-4 sm:px-8">
            <div className="container-custom">
              <div className="card p-6">
                <div className="text-center">Loading analytics...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 py-8 px-4 sm:px-8">
          <div className="container-custom">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">Analytics Dashboard</h1>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                Overview of your business metrics and performance
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <FiUsers className="text-blue-600" size={24} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <FiDollarSign className="text-green-600" size={24} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Active Subs
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.activeSubscriptions}
                    </p>
                  </div>
                  <FiActivity className="text-purple-600" size={24} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Total Gyms
                    </p>
                    <p className="text-2xl font-bold">{stats.totalGyms}</p>
                  </div>
                  <FiMapPin className="text-orange-600" size={24} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Growth Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.growthRate.toFixed(1)}%
                    </p>
                  </div>
                  <FiTrendingUp
                    className={`${stats.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}
                    size={24}
                  />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Revenue Over Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Total Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Subscription Distribution
                  </h3>
                  <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary font-medium">
                    Total Users:{" "}
                    <span className="text-primary-600 dark:text-primary-400">
                      {subscriptionData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Enhanced Donut Chart */}
                  <div className="relative flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={100}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={5}
                          cornerRadius={5}
                        >
                          {subscriptionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value} users (${((value / subscriptionData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                            "",
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            padding: "8px 12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-light-text dark:text-dark-text mb-1">
                          {subscriptionData.reduce(
                            (sum, item) => sum + item.value,
                            0
                          )}
                        </div>
                        <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary font-medium">
                          Total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Legend with Progress Bars */}
                  <div className="space-y-4">
                    {subscriptionData.map((entry, index) => {
                      const total = subscriptionData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      );
                      const percentage =
                        total > 0
                          ? ((entry.value / total) * 100).toFixed(1)
                          : 0;

                      return (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-hover/50 dark:hover:bg-dark-hover/50 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded-md shadow-sm"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                              <span className="font-semibold text-light-text dark:text-dark-text">
                                {entry.name}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {percentage}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                            <div
                              className="h-full transition-all duration-1000 ease-out rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>

                          <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                            {entry.value} {entry.value === 1 ? "user" : "users"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FiActivity className="text-purple-500" />
                    Top Gyms by Activity
                  </h3>
                  <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    Total Visits:{" "}
                    {gymActivityData.reduce((sum, gym) => sum + gym.visits, 0)}
                  </div>
                </div>

                <div className="space-y-4">
                  {gymActivityData.map((gym, index) => {
                    const maxVisits = Math.max(
                      ...gymActivityData.map((g) => g.visits)
                    );
                    const percentage = (gym.visits / maxVisits) * 100;

                    return (
                      <motion.div
                        key={gym.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium text-light-textPrimary dark:text-dark-textPrimary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {gym.name}
                              </h4>
                              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                {gym.visits}{" "}
                                {gym.visits === 1 ? "visit" : "visits"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-light-textPrimary dark:text-dark-textPrimary">
                              {gym.visits}
                            </div>
                            <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{
                                delay: index * 0.1 + 0.3,
                                duration: 0.8,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full shadow-sm"
                              style={{
                                background:
                                  index === 0
                                    ? "linear-gradient(to right, #8b5cf6, #7c3aed)"
                                    : index === 1
                                      ? "linear-gradient(to right, #3b82f6, #2563eb)"
                                      : index === 2
                                        ? "linear-gradient(to right, #10b981, #059669)"
                                        : index === 3
                                          ? "linear-gradient(to right, #f59e0b, #d97706)"
                                          : "linear-gradient(to right, #ef4444, #dc2626)",
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {gymActivityData.length === 0 && (
                    <div className="text-center py-8 text-light-textSecondary dark:text-dark-textSecondary">
                      <FiActivity className="mx-auto mb-2 text-4xl opacity-50" />
                      <p>No gym activity data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border">
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Payment Method</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-light-border dark:border-dark-border"
                        >
                          <td className="py-3 px-4 font-semibold">
                            {formatCurrency(payment.amount || 0)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {payment.payment_method || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center">
                          No recent payments
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
