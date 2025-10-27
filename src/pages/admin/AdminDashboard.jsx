import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [usersPerPlan, setUsersPerPlan] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ["#6366f1", "#14b8a6", "#f97316", "#ef4444", "#8b5cf6"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch active subscriptions
      const { count: activeSubsCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch all subscriptions with plan data
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("status", "active");

      // Calculate users per plan
      const planCounts = {};
      subscriptions?.forEach((sub) => {
        const planName = sub.subscription_plans?.name || "Unknown";
        if (!planCounts[planName]) {
          planCounts[planName] = { count: 0, revenue: 0 };
        }
        planCounts[planName].count++;
        const amount =
          sub.billing_type === "monthly"
            ? sub.subscription_plans?.price_monthly
            : sub.subscription_plans?.price_yearly;
        planCounts[planName].revenue += amount || 0;
      });

      const planData = Object.entries(planCounts).map(([name, data]) => ({
        name,
        users: data.count,
        revenue: data.revenue,
      }));

      setUsersPerPlan(planData);

      // Fetch payments for revenue calculation
      const { data: payments } = await supabase
        .from("payments_log")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentPayments(payments || []);

      // Calculate total revenue
      const totalRev =
        payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyRev =
        payments
          ?.filter((p) => new Date(p.created_at) >= thirtyDaysAgo)
          .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Generate monthly trends (mock data for last 6 months)
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString("en-US", { month: "short" });

        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthPayments =
          payments?.filter((p) => {
            const paymentDate = new Date(p.created_at);
            return paymentDate >= monthStart && paymentDate <= monthEnd;
          }) || [];

        trends.push({
          month: monthName,
          revenue: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          users: monthPayments.length,
        });
      }

      setMonthlyTrends(trends);

      setStats({
        totalUsers: userCount || 0,
        activeSubscriptions: activeSubsCount || 0,
        totalRevenue: totalRev,
        monthlyRevenue: monthlyRev,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-bold">{value}</h3>
          {trend && (
            <p className="text-sm text-success-600 dark:text-success-400 mt-1 flex items-center">
              <FiTrendingUp size={14} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div
          className={`w-16 h-16 rounded-full ${color} flex items-center justify-center`}
        >
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </motion.div>
  );

  StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    color: PropTypes.string,
    trend: PropTypes.string,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-light-border dark:bg-dark-border rounded-full mb-4"></div>
          <div className="h-4 bg-light-border dark:bg-dark-border rounded w-32"></div>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                Overview of your FitClub platform performance
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={FiUsers}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-primary-600"
                trend="+12% this month"
              />
              <StatCard
                icon={FiActivity}
                label="Active Subscriptions"
                value={stats.activeSubscriptions}
                color="bg-secondary-600"
                trend="+8% this month"
              />
              <StatCard
                icon={FiDollarSign}
                label="Total Revenue (Mock)"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                color="bg-accent-600"
                trend="+15% this month"
              />
              <StatCard
                icon={FiCreditCard}
                label="Monthly Revenue"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                color="bg-success-600"
                trend="+20% from last month"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Users per Plan Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-6">Users per Plan</h3>
                {usersPerPlan.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={usersPerPlan}
                        dataKey="users"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.users}`}
                      >
                        {usersPerPlan.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-light-textSecondary dark:text-dark-textSecondary">
                    No subscription data available
                  </div>
                )}
              </motion.div>

              {/* Revenue per Plan Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-6">
                  Revenue per Plan (Mock)
                </h3>
                {usersPerPlan.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usersPerPlan}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-light-textSecondary dark:text-dark-textSecondary">
                    No revenue data available
                  </div>
                )}
              </motion.div>
            </div>

            {/* Monthly Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card mb-8"
            >
              <h3 className="text-xl font-bold mb-6">
                Monthly Revenue Trend (Mock)
              </h3>
              {monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-light-textSecondary dark:text-dark-textSecondary">
                  No trend data available
                </div>
              )}
            </motion.div>

            {/* Recent Payments Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-6">Recent Payments (Mock)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border">
                      <th className="text-left py-3 px-4">Transaction ID</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover"
                        >
                          <td className="py-3 px-4 font-mono text-sm">
                            {payment.transaction_reference?.slice(0, 16)}...
                          </td>
                          <td className="py-3 px-4">{payment.plan}</td>
                          <td className="py-3 px-4 font-semibold">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FiCalendar size={14} />
                              {new Date(
                                payment.created_at
                              ).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 text-center text-light-textSecondary dark:text-dark-textSecondary"
                        >
                          No payments recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <h4 className="text-sm font-medium mb-2 opacity-90">
                  Average Revenue per User
                </h4>
                <p className="text-3xl font-bold">
                  $
                  {stats.totalUsers > 0
                    ? (stats.totalRevenue / stats.totalUsers).toFixed(2)
                    : "0.00"}
                </p>
              </div>

              <div className="card bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
                <h4 className="text-sm font-medium mb-2 opacity-90">
                  Subscription Conversion Rate
                </h4>
                <p className="text-3xl font-bold">
                  {stats.totalUsers > 0
                    ? (
                        (stats.activeSubscriptions / stats.totalUsers) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </div>

              <div className="card bg-gradient-to-br from-accent-500 to-accent-700 text-white">
                <h4 className="text-sm font-medium mb-2 opacity-90">
                  Total Transactions
                </h4>
                <p className="text-3xl font-bold">{recentPayments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
