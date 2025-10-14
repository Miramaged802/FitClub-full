import { Link } from "react-router-dom";
import { FiClock, FiUser, FiArrowRight, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";

const ArticleCard = ({ article }) => {
  const {
    id,
    title,
    excerpt,
    cover,
    author,
    readTime,
    date,
    category,
    tags = [],
    authorRole,
  } = article;

  return (
    <motion.div
      className="card h-full flex flex-col overflow-hidden group bg-light-card dark:bg-dark-card hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 text-sm font-medium bg-primary-600/90 text-white rounded-full backdrop-blur-sm shadow-lg">
            {category}
          </span>
        </div>

        {/* Reading Time Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 text-sm font-medium bg-black/30 text-white rounded-full backdrop-blur-sm flex items-center">
            <FiClock className="mr-1" />
            {readTime} min read
          </span>
        </div>

        {/* Title on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6 line-clamp-3">
          {excerpt}
        </p>

        {/* Author and Date Info */}
        <div className="flex items-center justify-between text-sm text-light-textSecondary dark:text-dark-textSecondary mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-2">
                <FiUser className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <span className="font-medium text-light-textPrimary dark:text-dark-textPrimary">
                  {author}
                </span>
                {authorRole && (
                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    {authorRole}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            <span>
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-auto">
          <Link
            to={`/articles/${id}`}
            className="btn btn-outline w-full flex items-center justify-center group-hover:btn-primary transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Read Article
            <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
