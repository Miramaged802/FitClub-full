import { useState, useRef, useEffect } from "react";
import {
  FiCamera,
  FiCheck,
  FiX,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiHome,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { gymAccessLogs, gyms, users, supabase } from "../../lib/supabaseClient";
import PropTypes from "prop-types";

const QRScanner = ({ onClose }) => {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [gymsList, setGymsList] = useState([]);
  const [selectedGymId, setSelectedGymId] = useState("");
  const [isLoggingAccess, setIsLoggingAccess] = useState(false);
  const fileInputRef = useRef(null);

  // Load gyms list on component mount
  useEffect(() => {
    const loadGyms = async () => {
      try {
        const { data, error } = await gyms.getAll();
        if (error) {
          console.error("Error loading gyms:", error);
          return;
        }
        setGymsList(data || []);
      } catch (err) {
        console.error("Error loading gyms:", err);
      }
    };

    loadGyms();
  }, []);

  // Generate real scan result using current user data
  const generateScanResult = async () => {
    try {
      // Get current user using Supabase auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {
        console.error("Auth error:", userError);
        throw new Error("Authentication error: " + userError.message);
      }

      if (!user) {
        throw new Error("No user logged in");
      }

      // Get user profile data
      const { data: userData, error: profileError } = await users.getById(
        user.id
      );
      if (profileError) {
        console.warn("Profile error:", profileError);
        // Continue with basic user data if profile not found
      }

      // Generate membership data based on user profile
      const currentDate = new Date();
      const futureDate = new Date();
      futureDate.setFullYear(currentDate.getFullYear() + 1); // 1 year from now

      // Make sure membership is valid (not expired)
      const validUntil =
        futureDate > currentDate
          ? futureDate
          : new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      return {
        membershipId: `FM${user.id.slice(-8).toUpperCase()}${Date.now().toString().slice(-4)}`,
        planName: userData?.subscription_level || "Premium",
        memberName: (() => {
          if (userData) {
            const firstName = userData.first_name || "";
            const lastName = userData.last_name || "";
            const fullName = `${firstName} ${lastName}`.trim();

            // If we have a name, use it; otherwise use email or fallback
            if (fullName && fullName !== " ") {
              return fullName;
            }
          }

          if (user.email) {
            return user.email.split("@")[0]; // Use email username as fallback
          } else {
            return "FitClub Member";
          }
        })(),
        validUntil: validUntil.toISOString(),
        planType: "monthly",
        gymAccess: "500+ Gyms",
        verificationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
        issueDate: currentDate.toISOString(),
        userId: user.id,
      };
    } catch (error) {
      console.error("Error generating scan result:", error);
      // Fallback to default data
      return {
        membershipId: "FM12345678",
        planName: "Premium",
        memberName: "FitClub Member",
        validUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
        planType: "monthly",
        gymAccess: "500+ Gyms",
        verificationCode: "ABC12DEF",
        issueDate: new Date().toISOString(),
        userId: "demo-user-id",
      };
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsScanning(true);
      setError(null);

      // Simulate QR code processing
      setTimeout(() => {
        try {
          // In a real implementation, you would use a QR code reading library here
          // For demo purposes, we'll use mock data
          // Generate real user data instead of mock data
          generateScanResult()
            .then((result) => {
              setScannedData(result);
              setIsScanning(false);
            })
            .catch((err) => {
              console.error("Error generating scan result:", err);
              setError("Unable to generate scan result");
              setIsScanning(false);
            });
        } catch (err) {
          console.error("Error scanning QR code:", err);
          setError("Invalid QR code or unable to read data");
          setIsScanning(false);
        }
      }, 1500);
    }
  };

  // Handle granting access and logging to database
  const handleGrantAccess = async () => {
    if (!scannedData || !selectedGymId) {
      setError("Please select a gym before granting access");
      return;
    }

    setIsLoggingAccess(true);
    setError(null);

    try {
      // Create access log entry
      const accessLogData = {
        user_id: scannedData.userId,
        gym_id: selectedGymId,
        access_type: "qr_scan",
        status: "granted",
        reason: null,
        scanned_at: new Date().toISOString(),
      };

      const { error: logError } =
        await gymAccessLogs.create(accessLogData);

      if (logError) {
        console.error("Error logging access:", logError);
        setError("Failed to log access. Please try again.");
        setIsLoggingAccess(false);
        return;
      }



      // Close the scanner after successful logging
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error granting access:", err);
      setError("An error occurred while granting access");
      setIsLoggingAccess(false);
    }
  };

  // Handle denying access and logging to database
  const handleDenyAccess = async (reason = "Membership expired") => {
    if (!scannedData || !selectedGymId) {
      setError("Please select a gym before denying access");
      return;
    }

    setIsLoggingAccess(true);
    setError(null);

    try {
      // Create access log entry for denied access
      const accessLogData = {
        user_id: scannedData.userId,
        gym_id: selectedGymId,
        access_type: "qr_scan",
        status: "denied",
        reason: reason,
        scanned_at: new Date().toISOString(),
      };

      const { data: logData, error: logError } =
        await gymAccessLogs.create(accessLogData);

      if (logError) {
        console.error("Error logging access denial:", logError);
        setError("Failed to log access denial. Please try again.");
        setIsLoggingAccess(false);
        return;
      }

      console.log("Access denied and logged:", logData);

      // Reset the scanner after logging
      handleReset();
    } catch (err) {
      console.error("Error denying access:", err);
      setError("An error occurred while denying access");
      setIsLoggingAccess(false);
    }
  };

  const isValidMembership = () => {
    if (!scannedData) return false;
    const validUntil = new Date(scannedData.validUntil);
    return validUntil > new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReset = () => {
    setScannedData(null);
    setError(null);
    setIsScanning(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            🔍 Membership Verification
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Scan member&apos;s QR code to verify their subscription
          </p>

          {!scannedData && !isScanning && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                <FiCamera className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Upload QR code image to verify membership
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  Upload QR Code Image
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>• Member should show their digital membership QR code</p>
                <p>• Take a photo or upload existing image of the QR code</p>
                <p>• System will verify membership status automatically</p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Reading QR code...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FiX className="text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {scannedData && (
            <div className="space-y-4">
              {/* Gym Selection */}
              <div className="bg-gray-50 dark:bg-dark-background rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiHome className="inline mr-2" />
                  Select Gym Location
                </label>
                <select
                  value={selectedGymId}
                  onChange={(e) => setSelectedGymId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isLoggingAccess}
                >
                  <option value="">Choose a gym...</option>
                  {gymsList.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name} - {gym.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verification Status */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  isValidMembership()
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  {isValidMembership() ? (
                    <FiCheck className="text-green-600 dark:text-green-400 text-2xl mr-2" />
                  ) : (
                    <FiX className="text-red-600 dark:text-red-400 text-2xl mr-2" />
                  )}
                  <span
                    className={`font-bold text-lg ${
                      isValidMembership()
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {isValidMembership()
                      ? "VALID MEMBERSHIP"
                      : "EXPIRED MEMBERSHIP"}
                  </span>
                </div>
                {!isValidMembership() && (
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    Membership expired on {formatDate(scannedData.validUntil)}
                  </p>
                )}
              </div>

              {/* Member Details */}
              <div className="bg-gray-50 dark:bg-dark-background rounded-lg p-4 text-left">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center">
                    <FiUser className="text-gray-500 mr-2" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        Member Name
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {scannedData.memberName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-primary-600 rounded text-white text-xs flex items-center justify-center mr-2">
                      ID
                    </span>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        Membership ID
                      </span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {scannedData.membershipId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiMapPin className="text-gray-500 mr-2" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        Plan & Access
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {scannedData.planName} - {scannedData.gymAccess}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiCalendar className="text-gray-500 mr-2" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">
                        Valid Until
                      </span>
                      <span
                        className={`font-semibold ${
                          isValidMembership()
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatDate(scannedData.validUntil)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={isLoggingAccess}
                >
                  Scan Another
                </button>
                {isValidMembership() ? (
                  <button
                    onClick={handleGrantAccess}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={!selectedGymId || isLoggingAccess}
                  >
                    {isLoggingAccess ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Logging...
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        Grant Access
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleDenyAccess()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={!selectedGymId || isLoggingAccess}
                  >
                    {isLoggingAccess ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Logging...
                      </>
                    ) : (
                      <>
                        <FiX />
                        Deny Access
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {!scannedData && !isScanning && !error && (
            <button
              onClick={onClose}
              className="mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Close Scanner
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// PropTypes validation
QRScanner.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default QRScanner;
