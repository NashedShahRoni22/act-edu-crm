"use client";

import { BookOpen } from "lucide-react";

export default function ProductsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-gray-200 w-14 h-14 rounded-xl" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded" />
          </div>

          <div className="space-y-2.5 mb-6">
            <div className="h-3 w-2/5 bg-gray-200 rounded" />
            <div className="h-3 w-3/5 bg-gray-200 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
