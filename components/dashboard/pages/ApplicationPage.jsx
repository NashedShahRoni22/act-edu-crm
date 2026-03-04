"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, FileText, User, GitBranch, BookOpen } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  "Completed":   "bg-green-50 text-green-700 border-green-100",
  "Cancelled":   "bg-red-50 text-red-700 border-red-100",
  "On Hold":     "bg-yellow-50 text-yellow-700 border-yellow-100",
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-36 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-28 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1 flex-wrap">
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

function getInitials(first, last) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function Avatar({ first, last }) {
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];
  const idx = ((first?.charCodeAt(0) ?? 0) + (last?.charCodeAt(0) ?? 0)) % colors.length;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colors[idx]}`}>
      {getInitials(first, last)}
    </div>
  );
}

export default function ApplicationPage() {
  const { accessToken } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: appData, isLoading, error } = useQuery({
    queryKey: ["/applications", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const applications = appData?.data || [];

  const filtered = applications.filter((a) => {
    const contact = a.contact;
    const fullName = `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`;
    return [
      fullName,
      contact?.email,
      a.workflow?.name,
      a.current_stage?.name,
      a.status,
      ...(a.courses?.map((c) => c.product?.name) ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-400 text-sm">Track and manage all client applications.</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Contact", "Workflow", "Stage", "Courses", "Status", "Started"].map((col) => (
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-red-500">Failed to load applications. Please try again.</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No applications found matching "${searchQuery}"`
                          : "No applications found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((app, index) => {
                  const contact = app.contact;
                  const statusStyle = STATUS_STYLES[app.status] ?? "bg-gray-100 text-gray-600 border-gray-200";

                  return (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar first={contact?.first_name} last={contact?.last_name} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact?.first_name} {contact?.last_name}
                            </p>
                            <p className="text-xs text-gray-400">{contact?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Workflow */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{app.workflow?.name ?? "—"}</p>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B4CB8] flex-shrink-0" />
                          <p className="text-sm text-gray-600">{app.current_stage?.name ?? "—"}</p>
                        </div>
                      </td>

                      {/* Courses */}
                      <td className="px-6 py-4">
                        {!app.courses?.length ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {app.courses.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium"
                              >
                                <BookOpen className="w-3 h-3" />
                                {c.product?.name ?? `Course #${c.id}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle}`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Started */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {app.started_at
                            ? new Date(app.started_at).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> applications
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>

                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
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