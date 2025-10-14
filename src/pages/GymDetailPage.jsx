import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiPhone,
  FiMail,
  FiGlobe,
  FiInstagram,
  FiArrowLeft,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { getGymById } from "../data/gymsData.js";
import { auth, subscriptionPlans } from "../lib/supabase";

const GymDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [gym, setGym] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingType, setBillingType] = useState("monthly");
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const foundGym = getGymById(id);
    if (foundGym) {
      setGym(foundGym);
    } else {
      navigate("/gyms");
    }

    // Get current user
    const getCurrentUser = async () => {
      const { user } = await auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Fetch subscription plans
    const fetchPlans = async () => {
      const { data } = await subscriptionPlans.getAll();
      if (data) {
        // Parse features for each plan
        const parsedPlans = data.map((plan) => ({
          ...plan,
          features:
            typeof plan.features === "string"
              ? JSON.parse(plan.features)
              : plan.features || [],
        }));
        setPlans(parsedPlans);
        setSelectedPlan(
          parsedPlans.find((plan) => plan.name === "Premium") || parsedPlans[0]
        );
      }
    };
    fetchPlans();
  }, [id, navigate]);

  const handleSubscribeClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowSubscriptionModal(true);
  };

  const handleSubscribe = async () => {
    if (!user || !selectedPlan) {
      console.error("User or plan not selected");
      return;
    }

    setIsLoading(true);
    try {
      // Navigate to payment page with subscription details
      const params = new URLSearchParams({
        plan: selectedPlan.id,
        billing: billingType,
        gym: gym.id,
        gymName: gym.name,
        price:
          billingType === "monthly"
            ? selectedPlan.price_monthly
            : selectedPlan.price_yearly,
        currency: "USD",
      });

      // Close the modal first
      setShowSubscriptionModal(false);

      // Then navigate to payment page
      navigate(`/payment?${params.toString()}`);
    } catch (error) {
      console.error("Error preparing subscription:", error);
      setError("Failed to process subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
  const displayHours =
    typeof gym.hours === "string" ? { everyday: gym.hours } : gym.hours;

  return (
    <div className="min-h-screen py-16">
      <div className="container-custom">
        {/* Back button */}
        <motion.button
          className="flex items-center text-primary-600 dark:text-primary-500 mb-6 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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
                className={`relative h-44 rounded-lg overflow-hidden transition-all duration-300 ${
                  selectedImage === index
                    ? "ring-2 ring-primary-500 shadow-lg"
                    : "hover:ring-2 hover:ring-primary-300"
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
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-lg mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold mb-2">Start Your Fitness Journey</h3>
                        <p className="text-light-textSecondary dark:text-dark-textSecondary">
                          Get access to all amenities and classes
                        </p>
                      </div>
                      <div className="flex items-center gap-4">

                        <button
                          className="btn btn-primary btn-lg px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={handleSubscribeClick}
                        >
                          Subscribe Now
                        </button>
                      </div>
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
                      className="flex items-center p-3 bg-light-background dark:bg-dark-background rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <FiCheck className="text-success-500 mr-2" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class Schedule */}
              {gym.classes && gym.classes.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">
                    Today&apos;s Classes
                  </h2>
                  <div className="space-y-4">
                    {gym.classes.map((classItem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-light-background dark:bg-dark-background rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{classItem.name}</h3>
                          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                            {classItem.instructor} • {classItem.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{classItem.time}</p>
                          <button className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
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
                      className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border last:border-b-0"
                    >
                      <span className="capitalize font-medium">{day}</span>
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
                    <div className="flex items-center hover:bg-light-background dark:hover:bg-dark-background p-2 rounded-lg transition-colors">
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
                    <div className="flex items-center hover:bg-light-background dark:hover:bg-dark-background p-2 rounded-lg transition-colors">
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
                    <div className="flex items-center hover:bg-light-background dark:hover:bg-dark-background p-2 rounded-lg transition-colors">
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
                    <div className="flex items-center hover:bg-light-background dark:hover:bg-dark-background p-2 rounded-lg transition-colors">
                      <FiInstagram className="mr-3 text-primary-600 dark:text-primary-500" />
                      <a
                        href={`https://instagram.com/${gym.instagram.substring(
                          1
                        )}`}
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

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSubscriptionModal(false)}
        >
          <motion.div
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Subscribe to {gym.name}</h2>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Billing Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-light-card dark:bg-dark-background rounded-full p-1 inline-flex">
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      billingType === "monthly"
                        ? "bg-primary-600 text-white"
                        : "text-light-textSecondary dark:text-dark-textSecondary"
                    }`}
                    onClick={() => setBillingType("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      billingType === "yearly"
                        ? "bg-primary-600 text-white"
                        : "text-light-textSecondary dark:text-dark-textSecondary"
                    }`}
                    onClick={() => setBillingType("yearly")}
                  >
                    Yearly
                    <span className="ml-1 text-xs bg-success-500 text-white px-2 py-0.5 rounded-full">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-4 mb-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedPlan?.id === plan.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md"
                        : "border-light-border dark:border-dark-border hover:border-primary-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold">
                          $
                          {billingType === "monthly"
                            ? plan.price_monthly
                            : plan.price_yearly}
                        </span>
                        <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                          /{billingType === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </div>
                    <p className="text-light-textSecondary dark:text-dark-textSecondary mb-3">
                      {plan.description}
                    </p>
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      {plan.gym_access_description} •{" "}
                      {Array.isArray(plan.features) ? plan.features.length : 0}{" "}
                      features included
                    </div>
                  </div>
                ))}
              </div>

              {/* Gym-specific benefits */}
              <div className="bg-light-background dark:bg-dark-background p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3">
                  Access to {gym.name} includes:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {gym.amenities.slice(0, 6).map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <FiCheck className="text-success-500 mr-2" size={14} />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscribe Button */}
              <button
                className="w-full btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleSubscribe}
                disabled={isLoading || !selectedPlan}
              >
                {isLoading
                  ? "Processing..."
                  : `Continue to Payment - $${
                      billingType === "monthly"
                        ? selectedPlan?.price_monthly
                        : selectedPlan?.price_yearly
                    }/${billingType === "monthly" ? "month" : "year"}`}
              </button>

              <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-center mt-4">
                You&apos;ll be redirected to secure payment. Cancel anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GymDetailPage;
