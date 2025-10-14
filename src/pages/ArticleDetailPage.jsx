import { useParams, Link } from "react-router-dom";
import {
  FiClock,
  FiUser,
  FiCalendar,
  FiShare2,
  FiArrowLeft,
  FiBookmark,
  FiMessageCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";

// Mock articles data
export const articlesData = [
  {
    id: 1,
    title: "The Ultimate Guide to Building Muscle: Science-Backed Strategies",
    excerpt:
      "Learn the fundamentals of muscle building with this comprehensive guide covering workouts, nutrition, and recovery strategies.",
    content: `
      Building muscle effectively requires a well-structured approach combining proper training, nutrition, and recovery. This comprehensive guide will walk you through the essential components of muscle building, backed by scientific research.

      ## Training Principles
      
      The foundation of muscle growth lies in progressive overload - gradually increasing the demands on your muscles. Key training principles include:
      
      1. Compound exercises (squats, deadlifts, bench press)
      2. Progressive overload
      3. Proper form and technique
      4. Adequate volume and intensity
      
      ## Nutrition Fundamentals
      
      Your diet plays a crucial role in muscle growth. Focus on:
      
      - Adequate protein intake (1.6-2.2g per kg of body weight)
      - Caloric surplus (10-20% above maintenance)
      - Quality carbohydrates for energy
      - Healthy fats for hormonal balance
      
      ## Recovery Strategies
      
      Muscles grow during recovery, not during training. Optimize your recovery with:
      
      - Quality sleep (7-9 hours per night)
      - Proper hydration
      - Active recovery techniques
      - Stress management
    `,
    cover: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg",
    author: "Michael Johnson",
    authorRole: "Certified Strength Coach",
    readTime: 8,
    date: "2024-01-15",
    category: "Training",
    tags: ["Muscle Building", "Strength Training", "Nutrition", "Recovery"],
  },
  {
    id: 2,
    title: "Nutrition Essentials: Fueling Your Workouts for Maximum Results",
    excerpt:
      "Discover the key nutritional principles that will help fuel your workouts and accelerate recovery for maximum results.",
    content: `
      Proper nutrition is the cornerstone of athletic performance and fitness progress. Understanding how to fuel your body before, during, and after workouts can significantly impact your results.

      ## Pre-Workout Nutrition
      
      What you eat before training affects your performance. Key considerations include:
      
      1. Timing of meals
      2. Carbohydrate intake
      3. Protein requirements
      4. Hydration status
      
      ## During Workout Nutrition
      
      For longer training sessions, consider:
      
      - Hydration strategies
      - Electrolyte balance
      - Energy supplementation
      
      ## Post-Workout Recovery
      
      The post-workout window is crucial for recovery and adaptation:
      
      - Protein synthesis
      - Glycogen replenishment
      - Micronutrient considerations
      - Hydration restoration
    `,
    cover: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
    author: "Sarah Miller",
    authorRole: "Sports Nutritionist",
    readTime: 6,
    date: "2024-01-12",
    category: "Nutrition",
    tags: ["Nutrition", "Performance", "Recovery", "Meal Planning"],
  },
  {
    id: 3,
    title: "Recovery Techniques That Actually Work: A Scientific Approach",
    excerpt:
      "Explore science-backed recovery methods to reduce soreness, prevent injuries, and optimize your body's ability to adapt and grow stronger.",
    content: `
      Recovery is often the missing link in many fitness programs. Understanding and implementing effective recovery techniques can enhance your results and prevent burnout.

      ## Active Recovery
      
      Active recovery involves light exercise to promote blood flow and recovery:
      
      1. Light cardio
      2. Mobility work
      3. Dynamic stretching
      4. Low-intensity activities
      
      ## Passive Recovery Techniques
      
      Sometimes, the best recovery is complete rest:
      
      - Quality sleep
      - Meditation
      - Stress management
      - Rest days
      
      ## Recovery Tools and Techniques
      
      Modern recovery methods include:
      
      - Foam rolling
      - Massage therapy
      - Compression gear
      - Cold therapy
    `,
    cover: "https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg",
    author: "James Wilson",
    authorRole: "Physical Therapist",
    readTime: 5,
    date: "2024-01-10",
    category: "Recovery",
    tags: ["Recovery", "Injury Prevention", "Mobility", "Wellness"],
  },
];

const ArticleDetailPage = () => {
  const { id } = useParams();
  const article = articlesData.find((a) => a.id === parseInt(id));

  if (!article) {
    return (
      <div className="min-h-screen py-16">
        <div className="container-custom">
          <motion.div
            className="card text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/articles" className="btn btn-primary">
              <FiArrowLeft className="mr-2" />
              Back to Articles
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-light-background dark:to-dark-background" />
        </div>

        {/* Content */}
        <div className="container-custom relative text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Back Button */}
            <Link
              to="/articles"
              className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Articles
            </Link>

            {/* Tags */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {article.title}
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              {article.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-center gap-6 text-white/80">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-3">
                  <FiUser className="text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-medium text-white">
                    {article.author}
                  </span>
                  <span className="text-sm">{article.authorRole}</span>
                </div>
              </div>
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                <span>
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-2" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Action Buttons */}
            <motion.div
              className="flex items-center justify-between mb-8 sticky top-4 z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                <button className="btn btn-outline">
                  <FiBookmark className="mr-2" />
                  Save Article
                </button>
                <button className="btn btn-outline">
                  <FiMessageCircle className="mr-2" />
                  Comment
                </button>
              </div>
              <button className="btn btn-outline">
                <FiShare2 className="mr-2" />
                Share
              </button>
            </motion.div>

            {/* Article Content */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="prose dark:prose-invert max-w-none p-8">
                {article.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("##")) {
                    return (
                      <motion.h2
                        key={index}
                        className="text-2xl font-bold mt-8 mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {paragraph.replace("##", "").trim()}
                      </motion.h2>
                    );
                  }
                  if (paragraph.startsWith("-")) {
                    return (
                      <motion.ul
                        key={index}
                        className="list-disc pl-6 mb-4 space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {paragraph.split("\n").map((item, i) => (
                          <li
                            key={i}
                            className="text-light-textPrimary dark:text-dark-textPrimary"
                          >
                            {item.replace("-", "").trim()}
                          </li>
                        ))}
                      </motion.ul>
                    );
                  }
                  if (paragraph.match(/^\d\./)) {
                    return (
                      <motion.ol
                        key={index}
                        className="list-decimal pl-6 mb-4 space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {paragraph.split("\n").map((item, i) => (
                          <li
                            key={i}
                            className="text-light-textPrimary dark:text-dark-textPrimary"
                          >
                            {item.replace(/^\d\./, "").trim()}
                          </li>
                        ))}
                      </motion.ol>
                    );
                  }
                  return (
                    <motion.p
                      key={index}
                      className="mb-4 text-light-textPrimary dark:text-dark-textPrimary"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {paragraph}
                    </motion.p>
                  );
                })}
              </div>
            </motion.div>

            {/* Related Articles */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {articlesData
                  .filter((a) => a.id !== article.id)
                  .slice(0, 2)
                  .map((relatedArticle) => (
                    <motion.div
                      key={relatedArticle.id}
                      className="card group overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        to={`/articles/${relatedArticle.id}`}
                        className="block"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={relatedArticle.cover}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {relatedArticle.title}
                          </h3>
                          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-4 line-clamp-2">
                            {relatedArticle.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-light-textSecondary dark:text-dark-textSecondary">
                            <FiUser className="mr-1" />
                            <span>{relatedArticle.author}</span>
                            <span className="mx-2">•</span>
                            <FiClock className="mr-1" />
                            <span>{relatedArticle.readTime} min read</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
