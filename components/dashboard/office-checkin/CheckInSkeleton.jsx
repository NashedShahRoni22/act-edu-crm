export default function CheckInSkeleton() {
  return (
    <div className="px-6 pb-6 space-y-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 p-5 rounded-xl border-2 border-gray-100 bg-gray-50/50 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
          </div>
          <div className="hidden md:flex gap-8">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}