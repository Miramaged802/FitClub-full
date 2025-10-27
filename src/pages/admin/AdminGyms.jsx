import { useEffect, useState } from "react";
import { gyms } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminGymForm from "./forms/AdminGymForm.jsx";

const AdminGyms = () => {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchGyms = async () => {
    setIsLoading(true);
    const { data } = await gyms.getAllAdmin();
    setList(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const filtered = list.filter((g) =>
    [g.name, g.city, g.address, g.location, g.phone, g.email]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleAdd = () => {
    setSelected(null);
    setShowForm(true);
  };

  const handleEdit = (gym) => {
    setSelected(gym);
    setShowForm(true);
  };

  const handleDelete = async (gym) => {
    if (!confirm(`Delete gym "${gym.name}"?`)) return;
    await gyms.delete(gym.id);
    fetchGyms();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelected(null);
    fetchGyms();
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 py-8 px-4 sm:px-8">
          <div className="container-custom">
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Gyms</h1>
                <p className="text-light-textSecondary dark:text-dark-textSecondary">
                  Manage partner gyms
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search gyms..."
                    className="input w-64 pl-10"
                    aria-label="Search gyms"
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FiPlus size={16} /> Add Gym
                </motion.button>
              </div>
            </div>

            {showForm && (
              <div className="card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {selected ? "Edit Gym" : "Add Gym"}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    <FiX size={16} /> Close
                  </motion.button>
                </div>
                <AdminGymForm
                  gym={selected}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border bg-light-hover/50 dark:bg-dark-hover/30">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Access Level</th>
                      <th className="text-left py-3 px-4">Rating</th>
                      <th className="text-left py-3 px-4">Active</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filtered.length ? (
                      filtered.map((g) => (
                        <tr
                          key={g.id}
                          className="border-b border-light-border dark:border-dark-border"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {g.image_url ? (
                                <img
                                  src={g.image_url}
                                  alt={g.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-light-hover dark:bg-dark-hover" />
                              )}
                              <div>
                                <div className="font-semibold">{g.name}</div>
                                <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary truncate max-w-[30ch]">
                                  {g.city || g.location || g.address}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium">
                                {g.city || "N/A"}
                              </div>
                              <div className="text-light-textSecondary dark:text-dark-textSecondary">
                                {g.location || g.address || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                g.access_level === "Elite"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : g.access_level === "Premium"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              }`}
                            >
                              {g.access_level || "Basic"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {g.rating ? g.rating.toFixed(1) : "N/A"}
                              </span>
                              {g.rating && (
                                <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                  ({g.total_reviews || 0} reviews)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {g.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                                <FiCheckCircle /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200">
                                <FiXCircle /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-start">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover"
                                onClick={() => handleEdit(g)}
                                title="Edit"
                              >
                                <FiEdit2 />
                                <span className="hidden sm:inline">Edit</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-600 text-white hover:bg-error-700"
                                onClick={() => handleDelete(g)}
                                title="Delete"
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
                          colSpan="6"
                          className="py-6 text-center text-light-textSecondary dark:text-dark-textSecondary"
                        >
                          No gyms found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGyms;
