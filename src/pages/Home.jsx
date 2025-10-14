import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiMapPin,
  FiActivity,
  FiUser,
  FiCheckCircle,
  FiPlay,
} from "react-icons/fi";
import { motion } from "framer-motion";
import PlanCard from "../components/ui/PlanCard.jsx";

const Home = () => {
  // Mock data for featured plans
  const featuredPlans = [
    {
      name: "Basic",
      description: "Perfect for beginners",
      price: 29,
      period: "month",
      features: [
        "Access to 100+ gyms",
        "24/7 gym access",
        "Online workout plans",
        "Basic health tracking",
      ],
      popular: false,
    },
    {
      name: "Premium",
      description: "Most popular choice",
      price: 49,
      period: "month",
      features: [
        "Access to 500+ gyms",
        "24/7 gym access",
        "Premium workout plans",
        "Advanced health tracking",
        "Personal trainer consultation",
      ],
      popular: true,
    },
    {
      name: "Elite",
      description: "For fitness enthusiasts",
      price: 79,
      period: "month",
      features: [
        "Access to 1000+ gyms",
        "24/7 gym access",
        "Elite workout plans",
        "Comprehensive health tracking",
        "Weekly personal trainer sessions",
        "Nutrition planning",
      ],
      popular: false,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-800 to-primary-600 dark:from-primary-950 dark:to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="container-custom min-h-[90vh] flex flex-col justify-center py-20 relative">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-6"
            >
              <span className="text-accent-300">🎉 Special Launch Offer</span>
              <span className="ml-2 text-white/90">
                Get 20% off your first month
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Fitness Journey,{" "}
              <span className="text-accent-300 relative">
                Simplified
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 15 Q 25 5, 50 15 T 100 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl leading-relaxed">
              One membership for thousands of gyms nationwide. Train anywhere,
              anytime with FitClub's flexible gym subscription.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/plans"
                className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                View Plans
              </Link>
              <Link
                to="/gyms"
                className="btn border-2 border-white hover:bg-white/10 px-8 py-4 text-lg font-semibold group"
              >
                Find Gyms Near You
                <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="mt-12 flex items-center space-x-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i}`}
                    alt={`User ${i}`}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <div>
                <div className="font-semibold">Join 10,000+ members</div>
                <div className="text-white/70 text-sm">who trust FitClub</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-light-background dark:bg-dark-background">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1000+", label: "Partner Gyms" },
              { number: "50k+", label: "Active Members" },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {stat.number}
                </div>
                <div className="text-light-textSecondary dark:text-dark-textSecondary mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Why Choose FitClub?
              </h2>
              <p className="text-light-textSecondary dark:text-dark-textSecondary text-lg md:text-xl">
                We're revolutionizing gym memberships with our flexible
                subscription model.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <FiMapPin
                    className="text-primary-600 dark:text-primary-500"
                    size={32}
                  />
                ),
                title: "Train Anywhere",
                description:
                  "Access thousands of partner gyms across the country with a single membership.",
              },
              {
                icon: (
                  <FiActivity
                    className="text-primary-600 dark:text-primary-500"
                    size={32}
                  />
                ),
                title: "Flexible Plans",
                description:
                  "Choose from multiple subscription tiers to match your workout needs and budget.",
              },
              {
                icon: (
                  <FiUser
                    className="text-primary-600 dark:text-primary-500"
                    size={32}
                  />
                ),
                title: "Personalized Experience",
                description:
                  "Get custom workout recommendations and track your fitness journey.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card h-full p-8 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-light-textSecondary dark:text-dark-textSecondary text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-gradient-to-b from-light-background to-light-card dark:from-dark-background dark:to-dark-card">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Choose Your Plan
              </h2>
              <p className="text-light-textSecondary dark:text-dark-textSecondary text-lg md:text-xl">
                Flexible plans designed to fit your fitness goals and lifestyle.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PlanCard {...plan} onSelect={() => {}} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/plans"
              className="btn btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
            >
              <span>View All Plans</span>
              <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-accent-600 to-accent-700 dark:from-accent-800 dark:to-accent-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3836861/pexels-photo-3836861.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="container-custom text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to start your fitness journey?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Join thousands of members training at their own pace, on their own
              schedule.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-accent-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Start Free Trial
              </Link>
              <button className="btn border-2 border-white hover:bg-white/10 px-8 py-4 text-lg font-semibold inline-flex items-center">
                <FiPlay className="mr-2" />
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
