import {
  FiMapPin,
  FiStar,
  FiClock,
  FiPhone,
  FiDollarSign,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const GymCard = ({ gym }) => {
  const {
    id,
    name,
    images,
    image,
    location,
    rating,
    reviewCount = 0,
    hours,
    amenities = [],
    distance,
    monthlyPrice,
    currency = "EGP",
    phone,
    address,
  } = gym;

  // Use the first image from images array or fallback to image property
  const displayImage = images ? images[0] : image;

  // Format hours for display - handle both string and object formats
  const formatHours = (hours) => {
    if (typeof hours === "string") {
      return hours;
    }
    if (typeof hours === "object" && hours) {
      // If it's an object, show a generic message or the first day's hours
      const firstDay = Object.values(hours)[0];
      return firstDay || "See details for hours";
    }
    return "Hours not available";
  };

  return (
    <motion.div
      className="card overflow-hidden h-full flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/gyms/${id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {distance && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <FiMapPin size={12} className="mr-1" />
              <span>{distance} km</span>
            </div>
          )}
          {monthlyPrice && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-sm px-2 py-1 rounded-full flex items-center font-bold">
              <FiDollarSign size={12} className="mr-1" />
              <span>
                {monthlyPrice} {currency}/month
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/gyms/${id}`} className="block">
          <h3 className="text-xl font-bold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center text-sm text-light-textSecondary dark:text-dark-textSecondary mb-2">
          <FiMapPin size={14} className="mr-1" />
          <span>{location}</span>
        </div>

        {address && (
          <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-3">
            {address}
          </div>
        )}

        {rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <FiStar className="text-warning-500 mr-1" size={16} />
              <span className="font-medium">{rating}</span>
            </div>
            {reviewCount > 0 && (
              <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
                ({reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {hours && (
          <div className="flex items-center text-sm text-light-textSecondary dark:text-dark-textSecondary mb-3">
            <FiClock size={14} className="mr-1" />
            <span>{formatHours(hours)}</span>
          </div>
        )}

        {phone && (
          <div className="flex items-center text-sm text-light-textSecondary dark:text-dark-textSecondary mb-3">
            <FiPhone size={14} className="mr-1" />
            <span>{phone}</span>
          </div>
        )}

        {amenities.length > 0 && (
          <div className="mt-auto pt-3">
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs bg-light-background dark:bg-dark-background px-2 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 4 && (
                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
                  +{amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 pt-0">
        <Link
          to={`/gyms/${id}`}
          className="w-full btn btn-outline hover:btn-primary transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

GymCard.propTypes = {
  gym: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    location: PropTypes.string.isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    hours: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    amenities: PropTypes.arrayOf(PropTypes.string),
    distance: PropTypes.string,
    monthlyPrice: PropTypes.number,
    currency: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
  }).isRequired,
};

export default GymCard;
