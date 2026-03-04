"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Search, Package } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 10;

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-24 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

export default function ServicesPage() {
  const { accessToken } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: servicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/services", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const services = servicesData?.data || [];
  

  const filtered = services.filter((s) =>
    [s.product_name, s.partner_name, s.branch_name, s.display_label]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-400 text-sm">Manage smarter. Perform better.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Product", "Partner", "Branch", "Unique ID", "Workflows"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-red-500">Failed to load services. Please try again.</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No services found matching "${searchQuery}"`
                          : "No services found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((service, index) => (
                  <motion.tr
                    key={service.unique_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#3B4CB8]/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[#3B4CB8]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.product_name}</p>
                          <p className="text-xs text-gray-400">ID #{service.product_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 font-medium">{service.partner_name}</p>
                      <p className="text-xs text-gray-400">Partner #{service.partner_id}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 font-medium">{service.branch_name}</p>
                      <p className="text-xs text-gray-400">Branch #{service.partner_branch_id}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono font-medium">
                        {service.unique_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {service.available_workflows.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {service.available_workflows.map((wf) => (
                            <span
                              key={wf.id}
                              className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium"
                            >
                              {wf.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> services
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>

                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        safePage === page
                          ? "bg-[#3B4CB8] text-white border-[#3B4CB8] font-medium"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}