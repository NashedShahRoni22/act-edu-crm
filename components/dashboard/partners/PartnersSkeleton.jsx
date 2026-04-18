export default function PartnersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-pulse">
        <div className="min-w-0">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full max-w-64 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1">
                <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-48 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Partner Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-gray-100 rounded mb-2" />
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="h-3 w-8 bg-gray-100 rounded mb-1" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div>
                <div className="h-3 w-16 bg-gray-100 rounded mb-1" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, statIdx) => (
                <div
                  key={statIdx}
                  className="bg-gray-50 rounded-lg p-3 text-center"
                >
                  <div className="h-5 w-6 bg-gray-200 rounded mx-auto mb-1" />
                  <div className="h-5 w-8 bg-gray-200 rounded mx-auto mb-1" />
                  <div className="h-3 w-12 bg-gray-100 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
