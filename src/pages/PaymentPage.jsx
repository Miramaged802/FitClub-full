import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiCreditCard,
  FiLock,
  FiArrowLeft,
  FiCheck,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  auth,
  userSubscriptions,
  subscriptionPlans,
  users,
} from "../lib/supabase";
import SubscriptionQRCode from "../components/ui/SubscriptionQRCode.jsx";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planId = searchParams.get("plan");
  const billingType = searchParams.get("billing") || "monthly";
  const gymName = searchParams.get("gymName");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
    country: "US",
  });

  useEffect(() => {
    const initializePayment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check authentication
        const { user: currentUser, error: authError } = await auth.getUser();
        if (authError || !currentUser) {
          navigate("/login");
          return;
        }
        setUser(currentUser);

        // Get user profile
        const { data: profile } = await users.getById(currentUser.id);
        if (profile) {
          setPaymentForm((prev) => ({
            ...prev,
            cardholderName:
              `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              currentUser.email,
          }));
        }

        // Get plan details
        if (planId) {
          const { data: plans, error: planError } =
            await subscriptionPlans.getAll();
          if (planError) throw new Error(planError.message);

          const plan = plans.find((p) => p.id === planId);
          if (!plan) {
            throw new Error("Plan not found");
          }
          setSelectedPlan(plan);
        } else {
          throw new Error("No plan selected");
        }
      } catch (err) {
        console.error("Payment initialization error:", err);
        setError(err.message || "Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [planId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19)
        formattedValue = formattedValue.slice(0, 19);
    }

    // Format expiry date
    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (formattedValue.length > 5)
        formattedValue = formattedValue.slice(0, 5);
    }

    // Format CVV
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setPaymentForm((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (
      !paymentForm.cardNumber ||
      paymentForm.cardNumber.replace(/\s/g, "").length < 16
    ) {
      errors.push("Valid card number is required");
    }

    if (
      !paymentForm.expiryDate ||
      !/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)
    ) {
      errors.push("Valid expiry date is required (MM/YY)");
    }

    if (!paymentForm.cvv || paymentForm.cvv.length < 3) {
      errors.push("Valid CVV is required");
    }

    if (!paymentForm.cardholderName.trim()) {
      errors.push("Cardholder name is required");
    }

    return errors;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate unique membership ID
      const membershipId =
        "FM" +
        Date.now().toString().slice(-8) +
        Math.random().toString(36).substr(2, 4).toUpperCase();
      const verificationCode = Math.random()
        .toString(36)
        .substr(2, 8)
        .toUpperCase();

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (billingType === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create subscription record
      const subscriptionPayload = {
        user_id: user.id,
        plan_id: selectedPlan.id,
        membership_id: membershipId,
        status: "active",
        billing_type: billingType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        verification_code: verificationCode,
        qr_code_data: JSON.stringify({
          membershipId,
          planName: selectedPlan.name,
          memberName: paymentForm.cardholderName,
          validUntil: endDate.toISOString(),
          planType: billingType,
          gymAccess: selectedPlan.gym_access_description,
          verificationCode,
          issueDate: startDate.toISOString(),
          gymName: gymName || null,
          price:
            billingType === "monthly"
              ? selectedPlan.price_monthly
              : selectedPlan.price_yearly,
        }),
      };

      // Store subscription in database
      const { error: subscriptionError } = await userSubscriptions.create(
        subscriptionPayload
      );

      if (subscriptionError) {
        throw new Error(subscriptionError.message);
      }

      // Prepare QR code data
      const qrData = {
        membershipId,
        planName: selectedPlan.name,
        memberName: paymentForm.cardholderName,
        validUntil: endDate.toISOString(),
        planType: billingType,
        gymAccess: selectedPlan.gym_access_description,
        price:
          billingType === "monthly"
            ? selectedPlan.price_monthly
            : selectedPlan.price_yearly,
        gymName: gymName || null,
        verificationCode,
      };

      setSubscriptionData(qrData);
      setShowQRCode(true);
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRClose = () => {
    setShowQRCode(false);
    navigate("/profile?tab=subscription&success=true");
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

  if (error && !selectedPlan) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <div className="text-error-600 dark:text-error-400 text-5xl mb-4">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Error</h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="btn btn-primary"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-dark-background">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 dark:text-primary-500 mr-4"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              Secure payment powered by industry-leading encryption
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handlePayment}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FiCreditCard className="mr-3 text-primary-600 dark:text-primary-500" />
                    Payment Information
                  </h2>

                  {error && (
                    <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400 p-4 rounded-lg mb-6">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentForm.cardNumber}
                          onChange={handleInputChange}
                          className="input pl-12 w-full"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                        <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                      </div>
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentForm.expiryDate}
                          onChange={handleInputChange}
                          className="input w-full"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentForm.cvv}
                          onChange={handleInputChange}
                          className="input w-full"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Cardholder Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardholderName"
                          value={paymentForm.cardholderName}
                          onChange={handleInputChange}
                          className="input pl-12 w-full"
                          placeholder="John Doe"
                          required
                        />
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary" />
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Billing Address
                      </label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={paymentForm.billingAddress}
                        onChange={handleInputChange}
                        className="input w-full mb-4"
                        placeholder="123 Main Street"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="city"
                          value={paymentForm.city}
                          onChange={handleInputChange}
                          className="input w-full"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          name="zipCode"
                          value={paymentForm.zipCode}
                          onChange={handleInputChange}
                          className="input w-full"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <FiShield className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Secure Payment
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Your payment information is encrypted and secure. We
                        never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full btn btn-primary btn-lg flex items-center justify-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FiLock className="mr-3" />
                      Complete Payment - $
                      {billingType === "monthly"
                        ? selectedPlan?.price_monthly
                        : selectedPlan?.price_yearly}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="card sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              {/* Plan Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{selectedPlan?.name} Plan</h4>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {billingType === "monthly" ? "Monthly" : "Annual"}{" "}
                      subscription
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">
                      $
                      {billingType === "monthly"
                        ? selectedPlan?.price_monthly
                        : selectedPlan?.price_yearly}
                    </span>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      /{billingType === "monthly" ? "month" : "year"}
                    </p>
                  </div>
                </div>

                {gymName && (
                  <div className="bg-light-background dark:bg-dark-background p-3 rounded-lg">
                    <p className="text-sm font-medium">Gym Access:</p>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {gymName}
                    </p>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              <div className="border-t border-light-border dark:border-dark-border pt-6 mb-6">
                <h4 className="font-semibold mb-3">What&apos;s Included:</h4>
                <ul className="space-y-2">
                  {selectedPlan &&
                    (selectedPlan.features || [])
                      .slice(0, 5)
                      .map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <FiCheck
                            className="text-success-500 mr-2 mt-0.5 flex-shrink-0"
                            size={14}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                </ul>
              </div>

              {/* Total */}
              <div className="border-t border-light-border dark:border-dark-border pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                    $
                    {billingType === "monthly"
                      ? selectedPlan?.price_monthly
                      : selectedPlan?.price_yearly}
                  </span>
                </div>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  {billingType === "yearly" && "Billed annually • "}
                  Cancel anytime
                </p>
              </div>

              {/* Digital Membership Notice */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  📱 Digital Membership Included
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Get instant access with your QR code membership card after
                  payment.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && subscriptionData && (
        <SubscriptionQRCode
          subscriptionData={subscriptionData}
          onClose={handleQRClose}
        />
      )}
    </div>
  );
};

export default PaymentPage;
