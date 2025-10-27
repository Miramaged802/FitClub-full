import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Optimized Image Component with lazy loading
 * Supports WebP format and provides loading states
 */
const OptimizedImage = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  aspectRatio = "16/9",
  objectFit = "cover",
  loadingBg = "bg-light-border dark:bg-dark-border",
  blurDataURL,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || "");
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) {
      loadImage();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  useEffect(() => {
    if (isInView || priority) {
      loadImage();
    }
  }, [isInView, priority, src]);

  const loadImage = () => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      console.error(`Failed to load image: ${src}`);
    };
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ aspectRatio }}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className={`absolute inset-0 ${loadingBg} animate-pulse flex items-center justify-center`}
        >
          <div className="w-8 h-8 border-2 border-light-textSecondary dark:border-dark-textSecondary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Actual image */}
      {currentSrc && (
        <motion.img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full ${className}`}
          style={{ objectFit }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

