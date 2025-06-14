import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { FiDownload, FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

const SubscriptionQRCode = ({ subscriptionData, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate subscription verification data
  const qrData = {
    membershipId: subscriptionData.membershipId || generateMembershipId(),
    planName: subscriptionData.planName,
    memberName: subscriptionData.memberName,
    validUntil: subscriptionData.validUntil,
    planType: subscriptionData.planType,
    gymAccess: subscriptionData.gymAccess,
    verificationCode: generateVerificationCode(),
    issueDate: new Date().toISOString(),
  };

  const qrCodeData = JSON.stringify(qrData);

  function generateMembershipId() {
    return 'FM' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  function generateVerificationCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  const handleCopyMembershipId = async () => {
    try {
      await navigator.clipboard.writeText(qrData.membershipId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("subscription-qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `subscription-qr-${qrData.membershipId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
            Subscription Activated! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your digital membership card is ready
          </p>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-inner mb-6 inline-block">
            <QRCode
              id="subscription-qr-code"
              value={qrCodeData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Membership Details */}
          <div className="bg-gray-50 dark:bg-dark-background rounded-lg p-4 mb-6 text-left">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Membership ID</span>
                <div className="flex items-center">
                  <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                    {qrData.membershipId}
                  </span>
                  <button
                    onClick={handleCopyMembershipId}
                    className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {copied ? (
                      <FiCheck className="text-green-500" size={14} />
                    ) : (
                      <FiCopy className="text-gray-400" size={14} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Plan</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {qrData.planName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Valid Until</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(qrData.validUntil).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Access Level</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {qrData.gymAccess}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              How to use your digital membership:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 text-left space-y-1">
              <li>• Show this QR code at gym entrances</li>
              <li>• Staff will scan it to verify your membership</li>
              <li>• Download and save to your phone for easy access</li>
              <li>• Keep your Membership ID handy as backup</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadQR}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FiDownload size={16} />
              Download QR
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionQRCode; 