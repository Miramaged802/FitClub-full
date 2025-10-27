import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiX,
  FiUser,
  FiMail,
  FiCalendar,
  FiCheckCircle,
  FiDownload,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import { supabase } from "../../lib/supabaseClient";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Get profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      if (profilesError) throw profilesError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      if (rolesError) throw rolesError;

      // Get user emails from auth.users via RPC function
      const { data: userEmails, error: emailsError } = await supabase.rpc(
        "get_user_emails_for_admin"
      );

      if (emailsError) {
        console.error("Error fetching user emails:", emailsError);
        // Continue without emails if RPC fails
      }

      // Combine data
      const combinedUsers =
        profiles?.map((profile) => {
          const role = userRoles?.find((r) => r.user_id === profile.user_id);
          const userEmail = userEmails?.find(
            (u) => u.user_id === profile.user_id
          );

          return {
            id: profile.user_id,
            email: userEmail?.email || "N/A",
            created_at: userEmail?.created_at || profile.created_at,
            last_sign_in_at: userEmail?.last_sign_in_at || "",
            email_confirmed_at: userEmail?.email_confirmed_at || null,
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            phone: profile.phone || "",
            avatar_url: profile.avatar_url || "",
            address: profile.address || "",
            fitness_goals: profile.fitness_goals || [],
            subscription_level: profile.subscription_level || "Basic",
            profile_created_at: profile.created_at || "",
            profile_updated_at: profile.updated_at || "",
            role: role?.role || "user",
          };
        }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((user) =>
        [
          user.email,
          user.first_name,
          user.last_name,
          user.phone,
          user.address,
          user.subscription_level,
          user.role,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === "verified") {
        filtered = filtered.filter((user) => user.email_confirmed_at);
      } else if (statusFilter === "unverified") {
        filtered = filtered.filter((user) => !user.email_confirmed_at);
      } else if (statusFilter === "basic") {
        filtered = filtered.filter(
          (user) => user.subscription_level === "Basic"
        );
      } else if (statusFilter === "premium") {
        filtered = filtered.filter(
          (user) => user.subscription_level === "Premium"
        );
      } else if (statusFilter === "elite") {
        filtered = filtered.filter(
          (user) => user.subscription_level === "Elite"
        );
      }
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  }, [users, query, statusFilter, roleFilter]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      address: user.address || "",
      subscription_level: user.subscription_level || "Basic",
      fitness_goals: Array.isArray(user.fitness_goals)
        ? user.fitness_goals.join(", ")
        : "",
    });
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          address: editForm.address,
          subscription_level: editForm.subscription_level,
          fitness_goals: editForm.fitness_goals
            .split(",")
            .map((goal) => goal.trim())
            .filter(Boolean),
        })
        .eq("user_id", editingUser.id);

      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                phone: editForm.phone,
                address: editForm.address,
                subscription_level: editForm.subscription_level,
                fitness_goals: editForm.fitness_goals
                  .split(",")
                  .map((goal) => goal.trim())
                  .filter(Boolean),
              }
            : user
        )
      );

      setEditingUser(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Delete from user_roles table
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Remove from local state
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["#", "Name", "Email", "Subscription", "Role", "Created At"],
      ...filteredUsers.map((user, idx) => [
        idx + 1,
        `${user.first_name} ${user.last_name}`.trim() || "N/A",
        user.email || "N/A",
        user.subscription_level || "Basic",
        user.role,
        new Date(user.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 py-8 px-4 sm:px-8">
          <div className="container-custom">
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Users</h1>
                <p className="text-light-textSecondary dark:text-dark-textSecondary">
                  Manage platform users and their accounts
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All subscription levels</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="elite">Elite</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="input w-64 pl-10"
                    aria-label="Search users"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text"
                      aria-label="Clear search"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                <button
                  onClick={exportCsv}
                  className="btn-secondary inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                  title="Export CSV"
                >
                  <FiDownload /> Export
                </button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border bg-light-hover/50 dark:bg-dark-hover/30">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Subscription</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredUsers.length ? (
                      filteredUsers.map((user, idx) => (
                        <tr
                          key={user.id}
                          className="border-b border-light-border dark:border-dark-border"
                        >
                          <td className="py-3 px-4 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                  <FiUser className="text-primary-600 dark:text-primary-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold">
                                  {user.first_name || user.last_name
                                    ? `${user.first_name} ${user.last_name}`.trim()
                                    : "No Name"}
                                </div>
                                <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                  {user.phone || "No phone"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FiMail size={14} />
                              {user.email || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.subscription_level === "Elite"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : user.subscription_level === "Premium"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              }`}
                            >
                              {user.subscription_level || "Basic"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : user.role === "staff"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FiCalendar size={14} />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-start">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover"
                                onClick={() => handleEditUser(user)}
                                title="Edit User"
                              >
                                <FiEdit2 />
                                <span className="hidden sm:inline">Edit</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-600 text-white hover:bg-error-700"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete User"
                              >
                                <FiTrash2 />
                                <span className="hidden sm:inline">Delete</span>
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-6 text-center text-light-textSecondary dark:text-dark-textSecondary"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                  <h2 className="text-xl font-bold mb-4">Edit User</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.first_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.last_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                        className="w-full input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Subscription Level
                      </label>
                      <select
                        value={editForm.subscription_level}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            subscription_level: e.target.value,
                          })
                        }
                        className="w-full input"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="Elite">Elite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Fitness Goals (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={editForm.fitness_goals}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            fitness_goals: e.target.value,
                          })
                        }
                        placeholder="e.g., Weight Loss, Muscle Gain, Cardio"
                        className="w-full input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveEdit}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <FiUser
                    className="text-primary-600 dark:text-primary-400"
                    size={24}
                  />
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Premium Users
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {
                        users.filter((u) => u.subscription_level === "Premium")
                          .length
                      }
                    </p>
                  </div>
                  <FiCheckCircle
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Elite Users
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {
                        users.filter((u) => u.subscription_level === "Elite")
                          .length
                      }
                    </p>
                  </div>
                  <FiCheckCircle
                    className="text-purple-600 dark:text-purple-400"
                    size={24}
                  />
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Admins
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {users.filter((u) => u.role === "admin").length}
                    </p>
                  </div>
                  <FiUser
                    className="text-red-600 dark:text-red-400"
                    size={24}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
