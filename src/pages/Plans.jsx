import { useState, useEffect } from "react";
import {
  FiCheck,
  FiToggleRight,
  FiToggleLeft,
  FiHelpCircle,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PlanCard from "../components/ui/PlanCard.jsx";
import { subscriptionPlans } from "../lib/supabase";
import { mockSubscriptionPlansData } from "../data/mockSubscriptionPlansData";

const Plans = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plansData, setPlansData] = useState({
    monthly: [],
    yearly: [],
  });

  const navigate = useNavigate();

  // Fetch subscription plans from Supabase
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await subscriptionPlans.getAll();

        if (error) {
          // Check if the error is about missing table
          if (
            error.message &&
            error.message.includes(
              'relation "public.subscription_plans" does not exist'
            )
          ) {
            console.log(
              "Subscription plans table does not exist in Supabase, using mock data instead"
            );
            setPlansData(mockSubscriptionPlansData);
            return;
          }
          throw new Error(
            error.message || "Failed to fetch subscription plans"
          );
        }

        if (data && data.length > 0) {
          // Transform the data into the format we need
          const formattedPlans = {
            monthly: [],
            yearly: [],
          };

          data.forEach((plan) => {
            // Common plan data
            const planBase = {
              id: plan.id,
              name: plan.name,
              description: plan.description || `${plan.name} plan`,
              features:
                typeof plan.features === "string"
                  ? JSON.parse(plan.features)
                  : plan.features || [
                      `Access to ${
                        plan.name === "Basic"
                          ? "100+"
                          : plan.name === "Premium"
                          ? "500+"
                          : "1000+"
                      } gyms`,
                      "24/7 gym access",
                      `${
                        plan.name === "Basic"
                          ? "Basic"
                          : plan.name === "Premium"
                          ? "Advanced"
                          : "Elite"
                      } workout plans`,
                      `${
                        plan.name === "Basic" ? "Standard" : "All"
                      } equipment access`,
                      "Mobile app access",
                    ],
              notIncluded:
                typeof plan.not_included === "string"
                  ? JSON.parse(plan.not_included)
                  : plan.not_included || [],
              popular: plan.name === "Premium", // Mark Premium as popular by default
            };

            // Monthly plan
            formattedPlans.monthly.push({
              ...planBase,
              price: plan.price_monthly,
              period: "month",
            });

            // Yearly plan (with 2 months free - 20% discount)
            formattedPlans.yearly.push({
              ...planBase,
              price: plan.price_yearly,
              period: "year",
              features: [...planBase.features, "2 months free"],
            });
          });

          // Sort plans by price
          formattedPlans.monthly.sort((a, b) => a.price - b.price);
          formattedPlans.yearly.sort((a, b) => a.price - b.price);

          setPlansData(formattedPlans);
        } else {
          // If no plans found in database, use default mock data
          setPlansData(mockSubscriptionPlansData);
        }
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
        setError(err.message || "Failed to load subscription plans");
        // Fallback to mock data on any error
        setPlansData(mockSubscriptionPlansData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    // Navigate to payment page with selected plan
    navigate(`/payment?plan=${planId}&billing=${billingPeriod}`);
  };

  const plans = plansData[billingPeriod];

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
          <h2 className="text-2xl font-bold mb-2">Error Loading Plans</h2>
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
              Choose Your Plan
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find the perfect membership that fits your fitness goals and
              budget
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16">
        <div className="container-custom">
          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <motion.div
              className="bg-light-card dark:bg-dark-card rounded-full p-1 inline-flex"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-primary-600 text-white"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}
                onClick={() => setBillingPeriod("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "yearly"
                    ? "bg-primary-600 text-white"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}
                onClick={() => setBillingPeriod("yearly")}
              >
                Yearly
                <span className="ml-1 text-xs bg-success-500 text-white px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </motion.div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                {...plan}
                onSelect={() => handlePlanSelect(plan.id)}
              />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                Everything you need to know about our membership plans
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {[
                {
                  question: "Can I cancel my subscription anytime?",
                  answer:
                    "Yes, you can cancel your subscription at any time. For monthly plans, your access will continue until the end of your current billing period. For yearly plans, you can request a prorated refund.",
                },
                {
                  question: "Are there any hidden fees?",
                  answer:
                    "No, there are no hidden fees. The price you see is the price you pay. We believe in transparent pricing with no surprise charges.",
                },
                {
                  question: "How many gyms can I access?",
                  answer:
                    "The number of accessible gyms depends on your plan. Basic gives you access to 100+ gyms, Premium to 500+ gyms, and Elite to 1000+ gyms across the country.",
                },
                {
                  question: "Can I upgrade my plan later?",
                  answer:
                    "Absolutely! You can upgrade your plan at any time. When upgrading, you'll only pay the difference prorated for the remainder of your billing period.",
                },
                {
                  question: "Can I freeze my membership?",
                  answer:
                    "Yes, you can freeze your membership for up to 3 months per year. A small monthly maintenance fee may apply during the freeze period.",
                },
                {
                  question: "Do I need to bring my own equipment?",
                  answer:
                    "Typically no. Our partner gyms are fully equipped with everything you need for a great workout. However, personal items like workout clothes, shoes, and towels are usually your responsibility.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="card"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FiHelpCircle className="text-primary-600 dark:text-primary-500 mr-2" />
                    {faq.question}
                  </h3>
                  <p className="text-light-textSecondary dark:text-dark-textSecondary">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Plans;