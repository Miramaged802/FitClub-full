import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiClock,
  FiPhone,
  FiMail,
  FiGlobe,
  FiInstagram,
  FiArrowLeft,
  FiDollarSign,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { getGymById } from "../data/gymsData.js";

const GymDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [gym, setGym] = useState(null);

  useEffect(() => {
    const foundGym = getGymById(id);
    if (foundGym) {
      setGym(foundGym);
    } else {
      // If gym not found, navigate back to gyms page
      navigate("/gyms");
    }
  }, [id, navigate]);

  if (!gym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  // Handle hours display - could be string or object
  const displayHours = typeof gym.hours === 'string' ? 
    { everyday: gym.hours } : gym.hours;

  return (
    <div className="min-h-screen py-16">
      <div className="container-custom">
        {/* Back button */}
        <motion.button
          className="flex items-center text-primary-600 dark:text-primary-500 mb-6"
          onClick={() => navigate("/gyms")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiArrowLeft className="mr-2" />
          Back to Gyms
        </motion.button>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="relative h-96 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={gym.images[selectedImage]}
              alt={`${gym.name} view ${selectedImage + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {gym.images.map((image, index) => (
              <motion.button
                key={index}
                className={`relative h-44 rounded-lg overflow-hidden ${
                  selectedImage === index ? "ring-2 ring-primary-500" : ""
                }`}
                onClick={() => setSelectedImage(index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img
                  src={image}
                  alt={`${gym.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Gym Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card mb-8">
                <h1 className="text-3xl font-bold mb-4">{gym.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <FiStar className="text-warning-500 mr-1" />
                    <span className="font-medium">{gym.rating}</span>
                    <span className="text-light-textSecondary dark:text-dark-textSecondary ml-1">
                      ({gym.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-light-textSecondary dark:text-dark-textSecondary">
                    <FiMapPin className="mr-1" />
                    <span>{gym.address}</span>
                  </div>
                </div>
                <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
                  {gym.description}
                </p>

                {/* Pricing */}
                {gym.monthlyPrice && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-4 flex items-center">
                      <FiDollarSign className="mr-2" />
                      Membership Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white dark:bg-dark-background rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Monthly</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {gym.monthlyPrice} {gym.currency}
                        </p>
                      </div>
                      {gym.yearlyPrice && (
                        <div className="text-center p-4 bg-white dark:bg-dark-background rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Yearly</p>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {gym.yearlyPrice} {gym.currency}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Save {((gym.monthlyPrice * 12 - gym.yearlyPrice) / (gym.monthlyPrice * 12) * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="card mb-8">
                <h2 className="text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gym.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-light-background dark:bg-dark-background rounded-lg"
                    >
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class Schedule */}
              {gym.classes && gym.classes.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Today's Classes</h2>
                  <div className="space-y-4">
                    {gym.classes.map((classItem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-light-background dark:bg-dark-background rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{classItem.name}</h3>
                          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                            {classItem.instructor} • {classItem.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{classItem.time}</p>
                          <button className="text-sm text-primary-600 dark:text-primary-500">
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Hours */}
              <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">Hours of Operation</h2>
                <div className="space-y-2">
                  {Object.entries(displayHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center"
                    >
                      <span className="capitalize">{day}</span>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {gym.phone && (
                    <div className="flex items-center">
                      <FiPhone className="mr-3 text-primary-600 dark:text-primary-500" />
                      <a 
                        href={`tel:${gym.phone}`}
                        className="text-primary-600 dark:text-primary-500 hover:underline"
                      >
                        {gym.phone}
                      </a>
                    </div>
                  )}
                  {gym.email && (
                    <div className="flex items-center">
                      <FiMail className="mr-3 text-primary-600 dark:text-primary-500" />
                      <a
                        href={`mailto:${gym.email}`}
                        className="text-primary-600 dark:text-primary-500 hover:underline"
                      >
                        {gym.email}
                      </a>
                    </div>
                  )}
                  {gym.website && (
                    <div className="flex items-center">
                      <FiGlobe className="mr-3 text-primary-600 dark:text-primary-500" />
                      <a
                        href={`https://${gym.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-500 hover:underline"
                      >
                        {gym.website}
                      </a>
                    </div>
                  )}
                  {gym.instagram && (
                    <div className="flex items-center">
                      <FiInstagram className="mr-3 text-primary-600 dark:text-primary-500" />
                      <a
                        href={`https://instagram.com/${gym.instagram.substring(1)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-500 hover:underline"
                      >
                        {gym.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDetailPage;
