import React from "react";

export const SkeletonLoader = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-light-border dark:bg-dark-border rounded ${className}`}
  />
);

export const CardSkeleton = () => (
  <div className="card">
    <SkeletonLoader className="h-48 mb-4" />
    <SkeletonLoader className="h-6 w-3/4 mb-2" />
    <SkeletonLoader className="h-4 w-1/2 mb-4" />
    <SkeletonLoader className="h-4 w-full mb-2" />
    <SkeletonLoader className="h-4 w-5/6" />
  </div>
);

export const GymCardSkeleton = () => (
  <div className="card overflow-hidden">
    <SkeletonLoader className="h-48 w-full" />
    <div className="p-4">
      <SkeletonLoader className="h-6 w-3/4 mb-2" />
      <SkeletonLoader className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <SkeletonLoader className="h-8 w-20" />
        <SkeletonLoader className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const PlanCardSkeleton = () => (
  <div className="card">
    <SkeletonLoader className="h-8 w-32 mb-4" />
    <SkeletonLoader className="h-12 w-40 mb-6" />
    <div className="space-y-3">
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />
    </div>
    <SkeletonLoader className="h-12 w-full mt-6" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-light-border dark:border-dark-border">
          {[...Array(cols)].map((_, i) => (
            <th key={i} className="text-left py-3 px-4">
              <SkeletonLoader className="h-4 w-24" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-b border-light-border dark:border-dark-border"
          >
            {[...Array(cols)].map((_, colIndex) => (
              <td key={colIndex} className="py-3 px-4">
                <SkeletonLoader className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="min-h-screen py-16">
    <div className="container-custom">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="lg:w-1/4">
          <div className="card">
            <div className="flex justify-center mb-4">
              <SkeletonLoader className="w-24 h-24 rounded-full" />
            </div>
            <SkeletonLoader className="h-6 w-3/4 mx-auto mb-2" />
            <SkeletonLoader className="h-4 w-1/2 mx-auto mb-8" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <SkeletonLoader key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="lg:w-3/4">
          <div className="card">
            <SkeletonLoader className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <SkeletonLoader className="h-4 w-24 mb-2" />
                  <SkeletonLoader className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <SkeletonLoader className="h-4 w-24 mb-2" />
        <SkeletonLoader className="h-8 w-32 mb-2" />
        <SkeletonLoader className="h-3 w-20" />
      </div>
      <SkeletonLoader className="w-16 h-16 rounded-full" />
    </div>
  </div>
);

export default SkeletonLoader;

