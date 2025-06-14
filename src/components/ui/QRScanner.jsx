import { useState, useRef } from "react";
import { FiCamera, FiCheck, FiX, FiUser, FiCalendar, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

const QRScanner = ({ onClose }) => {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Mock scan result for demo purposes
  const mockScanResult = {
    membershipId: "FM12345678",
    planName: "Premium",
    memberName: "John Doe",
    validUntil: "2024-12-15T00:00:00.000Z",
    planType: "monthly",
    gymAccess: "500+ Gyms",
    verificationCode: "ABC12DEF",
    issueDate: "2024-01-15T00:00:00.000Z",
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
          setScannedData(mockScanResult);
          setIsScanning(false);
        } catch (err) {
          setError("Invalid QR code or unable to read data");
          setIsScanning(false);
        }
      }, 1500);
    }
  };

  const isValidMembership = () => {
    if (!scannedData) return false;
    const validUntil = new Date(scannedData.validUntil);
    return validUntil > new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            Scan member's QR code to verify their subscription
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
              {/* Verification Status */}
              <div className={`p-4 rounded-lg border-2 ${
                isValidMembership() 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  {isValidMembership() ? (
                    <FiCheck className="text-green-600 dark:text-green-400 text-2xl mr-2" />
                  ) : (
                    <FiX className="text-red-600 dark:text-red-400 text-2xl mr-2" />
                  )}
                  <span className={`font-bold text-lg ${
                    isValidMembership() 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {isValidMembership() ? 'VALID MEMBERSHIP' : 'EXPIRED MEMBERSHIP'}
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
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Member Name</span>
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
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Membership ID</span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {scannedData.membershipId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiMapPin className="text-gray-500 mr-2" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Plan & Access</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {scannedData.planName} - {scannedData.gymAccess}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiCalendar className="text-gray-500 mr-2" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Valid Until</span>
                      <span className={`font-semibold ${
                        isValidMembership() 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Scan Another
                </button>
                {isValidMembership() && (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Grant Access
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

export default QRScanner; 