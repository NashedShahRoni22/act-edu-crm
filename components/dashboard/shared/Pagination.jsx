import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  noun = "items",
}) {
  if (total === 0) return null;

  // Calculate visible page buttons to prevent too many buttons from rendering
  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(lastPage, currentPage + 2);

    if (end - start < 4) {
      if (start === 1) end = Math.min(lastPage, start + 4);
      else if (end === lastPage) start = Math.max(1, end - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
    >
      <p className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {from || 0} – {to || 0}
        </span>{" "}
        of <span className="font-medium text-gray-900">{total}</span> {noun}
      </p>

      {lastPage > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={!hasPrevPage}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#3B4CB8] text-white hover:bg-[#3B4CB8]/90"
                    : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={!hasNextPage}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}