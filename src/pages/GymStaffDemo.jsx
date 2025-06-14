import { useState } from "react";
import { FiCamera, FiShield, FiUsers, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import QRScanner from "../components/ui/QRScanner.jsx";

const GymStaffDemo = () => {
  const [showScanner, setShowScanner] = useState(false);

  // Mock stats for demo
  const todayStats = {
    membersCheckedIn: 47,
    newMembers: 3,
    expiredMemberships: 2,
    totalScans: 52
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-dark-background">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              🏋️‍♂️ Gym Staff Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Verify member subscriptions using QR code scanning
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <FiUsers className="text-primary-600 dark:text-primary-400 text-xl mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayStats.membersCheckedIn}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Checked In Today
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <FiShield className="text-green-600 dark:text-green-400 text-xl mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayStats.totalScans}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Scans
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center mr-3">
                  +
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayStats.newMembers}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    New Members
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <FiClock className="text-red-600 dark:text-red-400 text-xl mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayStats.expiredMemberships}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expired Today
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Scanner Section */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCamera className="text-primary-600 dark:text-primary-400 text-4xl" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Membership Verification
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Click the button below to start scanning member QR codes. The system will instantly verify their subscription status and access rights.
              </p>

              <button
                onClick={() => setShowScanner(true)}
                className="btn btn-primary btn-lg px-8 py-4 text-lg flex items-center mx-auto"
              >
                <FiCamera className="mr-3" size={20} />
                Start QR Scanner
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-4">
              📋 How to Use the QR Scanner:
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-400">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  Ask member to show their digital membership QR code
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  Click "Start QR Scanner" button above
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  Upload the QR code image for verification
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                  System will show membership status instantly
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">5</span>
                  Grant or deny access based on verification result
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">6</span>
                  Check their ID if membership shows as expired
                </li>
              </ul>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-4">✅</div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                Instant Verification
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Real-time membership status check with expiration date validation
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-4">🔒</div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                Secure Access
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Encrypted QR codes with verification codes to prevent fraud
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
              <div className="text-purple-600 dark:text-purple-400 text-2xl mb-4">📊</div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                Access Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Track member check-ins and identify access patterns
              </p>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Demo Mode:</strong> This is a demonstration of the QR scanning system. 
                In a real implementation, this would connect to your membership database for live verification.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default GymStaffDemo; 