import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { gyms } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";

const initialState = {
  name: "",
  location: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  website: "",
  image_url: "",
  description: "",
  amenities: "",
  opening_hours: {
    monday: "6:00-22:00",
    tuesday: "6:00-22:00",
    wednesday: "6:00-22:00",
    thursday: "6:00-22:00",
    friday: "6:00-22:00",
    saturday: "8:00-20:00",
    sunday: "8:00-20:00",
  },
  latitude: "",
  longitude: "",
  rating: "",
  total_reviews: "",
  is_active: true,
  access_level: "Basic",
};

const AdminGymForm = ({ gym, onSuccess, onCancel }) => {
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name || "",
        location: gym.location || "",
        address: gym.address || "",
        city: gym.city || "",
        phone: gym.phone || "",
        email: gym.email || "",
        website: gym.website || "",
        image_url: gym.image_url || "",
        description: gym.description || "",
        amenities: Array.isArray(gym.amenities)
          ? gym.amenities.join(", ")
          : gym.amenities || "",
        opening_hours: gym.opening_hours || {
          monday: "6:00-22:00",
          tuesday: "6:00-22:00",
          wednesday: "6:00-22:00",
          thursday: "6:00-22:00",
          friday: "6:00-22:00",
          saturday: "8:00-20:00",
          sunday: "8:00-20:00",
        },
        latitude: gym.latitude ?? "",
        longitude: gym.longitude ?? "",
        rating: gym.rating ?? "",
        total_reviews: gym.total_reviews ?? "",
        is_active: gym.is_active ?? true,
        access_level: gym.access_level || "Basic",
      });
    } else {
      setForm(initialState);
    }
  }, [gym]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpeningHoursChange = (day, value) => {
    setForm((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: value,
      },
    }));
  };

  const handlePresetHours = (preset) => {
    const presets = {
      "24/7": {
        monday: "24/7",
        tuesday: "24/7",
        wednesday: "24/7",
        thursday: "24/7",
        friday: "24/7",
        saturday: "24/7",
        sunday: "24/7",
      },
      standard: {
        monday: "6:00-22:00",
        tuesday: "6:00-22:00",
        wednesday: "6:00-22:00",
        thursday: "6:00-22:00",
        friday: "6:00-22:00",
        saturday: "8:00-20:00",
        sunday: "8:00-20:00",
      },
      extended: {
        monday: "5:00-23:00",
        tuesday: "5:00-23:00",
        wednesday: "5:00-23:00",
        thursday: "5:00-23:00",
        friday: "5:00-23:00",
        saturday: "6:00-22:00",
        sunday: "6:00-22:00",
      },
    };

    setForm((prev) => ({
      ...prev,
      opening_hours: presets[preset],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validation
      if (form.rating && (form.rating < 0 || form.rating > 5)) {
        throw new Error("Rating must be between 0 and 5");
      }

      if (form.total_reviews && form.total_reviews < 0) {
        throw new Error("Total reviews cannot be negative");
      }

      if (form.opening_hours) {
        // Validate that opening_hours is an object (already handled by state)
        if (typeof form.opening_hours !== "object") {
          throw new Error("Opening hours must be properly formatted");
        }
      }

      const payload = {
        ...form,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
        rating: form.rating === "" ? null : Number(form.rating),
        total_reviews:
          form.total_reviews === "" ? null : Number(form.total_reviews),
        amenities:
          typeof form.amenities === "string"
            ? form.amenities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : form.amenities,
        opening_hours: form.opening_hours,
      };

      if (gym?.id) {
        const { data, error } = await gyms.update(gym.id, payload);
        if (error) throw error;
        onSuccess?.(data?.[0] || null, "updated");
      } else {
        const { data, error } = await gyms.create(payload);
        if (error) throw error;
        onSuccess?.(data?.[0] || null, "created");
      }
    } catch (err) {
      console.error("Gym save error:", err);
      onSuccess?.(null, "error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            type="tel"
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            type="url"
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Access Level</label>
          <select
            name="access_level"
            value={form.access_level}
            onChange={handleChange}
            className="w-full input"
          >
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="Elite">Elite</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            type="url"
            className="w-full input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Amenities (comma-separated)
          </label>
          <input
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="e.g., Pool, Sauna, Parking, WiFi"
            className="w-full input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Opening Hours
          </label>

          {/* Preset Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Quick Presets:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePresetHours("24/7")}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                24/7
              </button>
              <button
                type="button"
                onClick={() => handlePresetHours("standard")}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => handlePresetHours("extended")}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                Extended
              </button>
            </div>
          </div>

          {/* Individual Day Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: "monday", label: "Monday" },
              { key: "tuesday", label: "Tuesday" },
              { key: "wednesday", label: "Wednesday" },
              { key: "thursday", label: "Thursday" },
              { key: "friday", label: "Friday" },
              { key: "saturday", label: "Saturday" },
              { key: "sunday", label: "Sunday" },
            ].map((day) => (
              <div key={day.key}>
                <label className="block text-xs font-medium mb-1 text-light-textSecondary dark:text-dark-textSecondary">
                  {day.label}
                </label>
                <select
                  value={form.opening_hours[day.key] || ""}
                  onChange={(e) =>
                    handleOpeningHoursChange(day.key, e.target.value)
                  }
                  className="w-full input text-sm"
                >
                  <option value="">Closed</option>
                  <option value="24/7">24/7</option>
                  <option value="5:00-23:00">5:00-23:00</option>
                  <option value="6:00-22:00">6:00-22:00</option>
                  <option value="6:00-21:00">6:00-21:00</option>
                  <option value="7:00-21:00">7:00-21:00</option>
                  <option value="8:00-20:00">8:00-20:00</option>
                  <option value="9:00-19:00">9:00-19:00</option>
                  <option value="custom">Custom</option>
                </select>
                {form.opening_hours[day.key] === "custom" && (
                  <input
                    type="text"
                    placeholder="e.g., 6:00-22:00"
                    onChange={(e) =>
                      handleOpeningHoursChange(day.key, e.target.value)
                    }
                    className="w-full input text-sm mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Latitude</label>
          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            type="number"
            step="0.000001"
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitude</label>
          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            type="number"
            step="0.000001"
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
          <input
            name="rating"
            value={form.rating}
            onChange={handleChange}
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="w-full input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Reviews
          </label>
          <input
            name="total_reviews"
            value={form.total_reviews}
            onChange={handleChange}
            type="number"
            min="0"
            className="w-full input"
          />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
          />
          <label htmlFor="is_active" className="text-sm">
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-medium"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? "Saving..." : gym?.id ? "Update Gym" : "Create Gym"}
        </motion.button>
      </div>
    </motion.form>
  );
};

AdminGymForm.propTypes = {
  gym: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default AdminGymForm;
