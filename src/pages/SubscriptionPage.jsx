import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiCheck, FiX, FiArrowLeft, FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";
import SubscriptionQRCode from "../components/ui/SubscriptionQRCode.jsx";

const SubscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedPlanId = searchParams.get("plan");
  const selectedBilling = searchParams.get("billing");

  // Mock plans data (same as in Plans.jsx)
  const plansData = {
    monthly: [
      {
        id: "basic",
        name: "Basic",
        price: 29,
        gymAccess: "100+ Gyms",
        features: [
          "Access to 100+ gyms",
          "24/7 gym access",
          "Basic workout plans",
          "Standard equipment access",
          "Mobile app access",
        ],
        notIncluded: [
          "Personal training sessions",
          "Premium classes",
          "Spa access",
          "Guest passes",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: 49,
        gymAccess: "500+ Gyms",
        features: [
          "Access to 500+ gyms",
          "24/7 gym access",
          "Advanced workout plans",
          "All equipment access",
          "Mobile app access",
          "2 guest passes per month",
          "Group fitness classes",
          "Basic personal training",
        ],
        notIncluded: ["Unlimited personal training", "Premium spa access"],
      },
      {
        id: "elite",
        name: "Elite",
        price: 79,
        gymAccess: "1000+ Gyms",
        features: [
          "Access to 1000+ gyms",
          "24/7 gym access",
          "Elite workout plans",
          "All equipment access",
          "Mobile app access",
          "Unlimited guest passes",
          "All fitness classes",
          "Weekly personal training",
          "Spa access",
          "Priority booking",
        ],
        notIncluded: [],
      },
    ],
    yearly: [
      {
        id: "basic",
        name: "Basic",
        price: 290,
        gymAccess: "100+ Gyms",
        features: [
          "Access to 100+ gyms",
          "24/7 gym access",
          "Basic workout plans",
          "Standard equipment access",
          "Mobile app access",
          "2 months free",
        ],
        notIncluded: [
          "Personal training sessions",
          "Premium classes",
          "Spa access",
          "Guest passes",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: 490,
        gymAccess: "500+ Gyms",
        features: [
          "Access to 500+ gyms",
          "24/7 gym access",
          "Advanced workout plans",
          "All equipment access",
          "Mobile app access",
          "2 guest passes per month",
          "Group fitness classes",
          "Basic personal training",
          "2 months free",
        ],
        notIncluded: ["Unlimited personal training", "Premium spa access"],
      },
      {
        id: "elite",
        name: "Elite",
        price: 790,
        gymAccess: "1000+ Gyms",
        features: [
          "Access to 1000+ gyms",
          "24/7 gym access",
          "Elite workout plans",
          "All equipment access",
          "Mobile app access",
          "Unlimited guest passes",
          "All fitness classes",
          "Weekly personal training",
          "Spa access",
          "Priority booking",
          "2 months free",
        ],
        notIncluded: [],
      },
    ],
  };

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
  });

  useEffect(() => {
    if (selectedBilling && selectedPlanId) {
      const plan = plansData[selectedBilling].find(
        (p) => p.id === selectedPlanId
      );
      if (plan) {
        setSelectedPlan(plan);
      } else {
        navigate("/plans");
      }
    } else {
      navigate("/plans");
    }
  }, [selectedBilling, selectedPlanId, navigate]);

  const calculateValidUntil = () => {
    const now = new Date();
    if (selectedBilling === "monthly") {
      now.setMonth(now.getMonth() + 1);
    } else {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate payment processing
    console.log("Processing payment...", { paymentDetails, selectedPlan });
    
    // Create subscription data for QR code
    const newSubscriptionData = {
      planName: selectedPlan.name,
      memberName: paymentDetails.name || "FitClub Member",
      validUntil: calculateValidUntil(),
      planType: selectedBilling,
      gymAccess: selectedPlan.gymAccess,
      price: selectedPlan.price,
      currency: "USD"
    };
    
    setSubscriptionData(newSubscriptionData);
    setShowQRCode(true);
  };

  const handleCloseQR = () => {
    setShowQRCode(false);
    // Navigate to profile or dashboard
    navigate("/profile");
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container-custom max-w-4xl">
        {/* Back button */}
        <motion.button
          className="flex items-center text-primary-600 dark:text-primary-500 mb-8"
          onClick={() => navigate("/plans")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiArrowLeft className="mr-2" />
          Back to Plans
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedPlan.name} Plan
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-light-textSecondary dark:text-dark-textSecondary">
                    {selectedBilling === "monthly" ? "Monthly" : "Annual"}{" "}
                    Subscription
                  </span>
                  <span className="text-2xl font-bold">
                    ${selectedPlan.price}
                    <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      /{selectedBilling === "monthly" ? "mo" : "yr"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="border-t border-light-border dark:border-dark-border pt-6">
                <h3 className="font-semibold mb-4">What's included:</h3>
                <ul className="space-y-3">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Digital Membership Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  📱 Digital Membership Included
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  You'll receive a QR code for easy gym access verification after payment.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="John Doe"
                    required
                    value={paymentDetails.name}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input pl-10 w-full"
                      placeholder="1234 5678 9012 3456"
                      required
                      value={paymentDetails.cardNumber}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          cardNumber: e.target.value,
                        })
                      }
                    />
                    <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="MM/YY"
                      required
                      value={paymentDetails.expiryDate}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          expiryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="123"
                      required
                      value={paymentDetails.cvv}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          cvv: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-6">
                Subscribe & Get Digital Membership
              </button>

              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center mt-4">
                Your payment is secure and encrypted. You'll receive a QR code for gym access immediately.
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && subscriptionData && (
        <SubscriptionQRCode
          subscriptionData={subscriptionData}
          onClose={handleCloseQR}
        />
      )}
    </div>
  );
};

export default SubscriptionPage;
