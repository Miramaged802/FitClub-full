import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import ArticleCard from "../components/ui/ArticleCard.jsx";
import { articlesData } from "./ArticleDetailPage.jsx";

const Articles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Categories based on article data
  const categories = [
    "All",
    ...new Set(articlesData.map((article) => article.category)),
  ];

  // Filter articles based on search and category
  const filteredArticles = articlesData.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || article.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

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
              Fitness Articles
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Expert advice, tips, and inspiration for your fitness journey
            </p>

            {/* Search box */}
            <div className="mt-8 max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 py-3 text-light-text dark:text-dark-text bg-white/90 dark:bg-dark-background/90 backdrop-blur border-transparent focus:border-transparent"
                />
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary dark:text-dark-textSecondary"
                  size={20}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-card"
                    onClick={() => setSearchQuery("")}
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-light-border dark:border-dark-border sticky top-16 bg-light-background dark:bg-dark-background z-10 backdrop-blur-sm">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16">
        <div className="container-custom">
          {/* Results count */}
          <div className="mb-8">
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              {filteredArticles.length === 0
                ? "No articles found"
                : `Showing ${filteredArticles.length} articles`}
              {searchQuery && <> for "{searchQuery}"</>}
              {activeCategory !== "All" && <> in {activeCategory}</>}
            </p>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                Try adjusting your search or category filter
              </p>
              <button
                className="mt-4 btn btn-outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Articles;
