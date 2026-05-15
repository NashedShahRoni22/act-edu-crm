"use client";

import { motion } from "framer-motion";
import SectionContainer from "../SectionContainer";

export default function TasksReportsSkeleton() {
  return (
    <SectionContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[...Array(9)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-gray-200 ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {[...Array(9)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
