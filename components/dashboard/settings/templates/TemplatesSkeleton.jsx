export default function TemplatesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-pulse">
        <div className="min-w-0">
          <div className="h-6 w-44 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full max-w-80 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-full sm:w-34 bg-gray-200 rounded" />
      </div>

      <div className="h-10 w-full max-w-44 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
              <div className="flex flex-col items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-44 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-full max-w-56 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0 self-end sm:self-start" />
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
              <div className="h-3 w-30 bg-gray-100 rounded" />
              <div className="h-3 w-40 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
