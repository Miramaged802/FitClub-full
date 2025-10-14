import { useState, useEffect } from "react";
import {
  FiMapPin,
  FiFilter,
  FiSearch,
  FiStar,
  FiSliders,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { motion } from "framer-motion";
import GymCard from "../components/ui/GymCard.jsx";
import { gymsData } from "../data/gymsData.js";

const Gyms = () => {
  const [filters, setFilters] = useState({
    search: "",
    amenities: [],
    rating: 0,
    distance: 30,
    city: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [gymsDataState, setGymsDataState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const amenitiesList = [
    "Pool",
    "Sauna",
    "Spa",
    "Weight Room",
    "Cardio",
    "Classes",
    "CrossFit",
    "Personal Training",
    "Yoga Studio",
    "Basketball Court",
    "Water Classes",
  ];

  const cities = [
    "All Cities",
    "Cairo",
    "Alexandria",
    "Giza",
    "New Capital",
    "Hurghada",
    "Mansoura",
    "Sharm El Sheikh",
  ];

  // Load gyms data directly from gymsData.js
  useEffect(() => {
    try {
      setGymsDataState(gymsData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading gyms:", err);
      setError(err.message || "Failed to load gyms");
      setIsLoading(false);
    }
  }, []);

  // Filter gyms based on search and filters
  const filteredGyms = gymsDataState.filter((gym) => {
    // Search filter
    if (
      filters.search &&
      !gym.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !gym.location.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // City filter
    if (filters.city && gym.city !== filters.city) {
      return false;
    }

    // Rating filter
    if (filters.rating > 0 && gym.rating < filters.rating) {
      return false;
    }

    // Distance filter (mock implementation)
    if (parseFloat(gym.distance || "5") > filters.distance) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      return filters.amenities.every((amenity) =>
        gym.amenities.includes(amenity)
      );
    }

    return true;
  });

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const handleCityChange = (city) => {
    setFilters({
      ...filters,
      city: city === "All Cities" ? "" : city,
    });
  };

  const toggleAmenity = (amenity) => {
    if (filters.amenities.includes(amenity)) {
      setFilters({
        ...filters,
        amenities: filters.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFilters({
        ...filters,
        amenities: [...filters.amenities, amenity],
      });
    }
  };

  const handleDistanceChange = (e) => {
    setFilters({
      ...filters,
      distance: parseInt(e.target.value),
    });
  };

  const handleRatingChange = (rating) => {
    setFilters({
      ...filters,
      rating,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-light-border dark:bg-dark-border rounded-full mb-4 flex items-center justify-center">
            <FiLoader className="animate-spin text-4xl text-primary-600 dark:text-primary-500" />
          </div>
          <div className="h-6 bg-light-border dark:bg-dark-border rounded w-48 mb-2"></div>
          <div className="h-4 bg-light-border dark:bg-dark-border rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <div className="text-error-600 dark:text-error-400 text-5xl mb-4">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Gyms</h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-600 dark:from-primary-900 dark:to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Gyms in Egypt
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover the best gyms across Egypt with competitive EGP pricing
            </p>

            {/* Search box */}
            <div className="mt-8 max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by location or gym name"
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="input pl-10 pr-14 py-3 text-light-text dark:text-dark-text bg-white/90 dark:bg-dark-background/90 backdrop-blur border-transparent focus:border-transparent"
                />
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary"
                  size={20}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-secondary-600 text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gyms Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <motion.div
              className={`lg:w-1/4 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    className="lg:hidden p-2 rounded-full hover:bg-light-background dark:hover:bg-dark-background"
                    onClick={() => setShowFilters(false)}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* City filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FiMapPin className="mr-2" />
                    City
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          (city === "All Cities" && !filters.city) ||
                          filters.city === city
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                            : "bg-light-background dark:bg-dark-background"
                        }`}
                        onClick={() => handleCityChange(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FiMapPin className="mr-2" />
                    Distance
                  </h3>
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={filters.distance}
                      onChange={handleDistanceChange}
                      className="w-full h-2 bg-light-border dark:bg-dark-border rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-light-textSecondary dark:text-dark-textSecondary mt-2">
                      <span>1 km</span>
                      <span>{filters.distance} km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>

                {/* Rating filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FiStar className="mr-2" />
                    Rating
                  </h3>
                  <div className="flex space-x-1">
                    {[4, 3, 2, 1, 0].map((rating) => (
                      <button
                        key={rating}
                        className={`px-3 py-1.5 rounded text-sm ${
                          filters.rating === rating
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                            : "bg-light-background dark:bg-dark-background"
                        }`}
                        onClick={() => handleRatingChange(rating)}
                      >
                        {rating > 0 ? `${rating}+` : "Any"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities filter */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FiSliders className="mr-2" />
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          filters.amenities.includes(amenity)
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                            : "bg-light-background dark:bg-dark-background"
                        }`}
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset filters */}
                <button
                  className="mt-6 w-full btn btn-outline"
                  onClick={() =>
                    setFilters({
                      search: "",
                      amenities: [],
                      rating: 0,
                      distance: 30,
                      city: "",
                    })
                  }
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>

            {/* Gyms grid */}
            <div className="lg:w-3/4">
              {/* Mobile filter toggle */}
              <div className="lg:hidden mb-6">
                <button
                  className="btn btn-outline w-full flex items-center justify-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter className="mr-2" />
                  <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                </button>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-light-textSecondary dark:text-dark-textSecondary">
                  Showing {filteredGyms.length} results
                  {filters.search && <> for &quot;{filters.search}&quot;</>}
                  {filters.city && <> in {filters.city}</>}
                </p>
              </div>

              {filteredGyms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredGyms.map((gym, index) => (
                    <motion.div
                      key={gym.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <GymCard gym={gym} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No gyms found</h3>
                  <p className="text-light-textSecondary dark:text-dark-textSecondary">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gyms;
