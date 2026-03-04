"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  UserCheck,
  Target,
  Upload,
  Eye,
  Edit,
  MessageSquare,
  MoreVertical,
  Phone,
  Mail,
  Clock,
  Search,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import SectionContainer from "../SectionContainer";
import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import Link from "next/link";

const PAGE_SIZE = 9; // 3-col grid looks best with multiples of 3

const AVATAR_COLORS = [
  "bg-[#3B4CB8]",
  "bg-[#1FB3C8]",
  "bg-[#9333EA]",
  "bg-[#F97316]",
  "bg-[#2DD4BF]",
  "bg-gray-700",
];

const STATUS_BADGE = {
  Client: "bg-green-50 text-green-700",
  Lead: "bg-yellow-50 text-yellow-800",
  Prospect: "bg-blue-50 text-blue-700",
};

function getInitials(first, last) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function avatarColor(first, last) {
  const n =
    ((first?.charCodeAt(0) ?? 0) + (last?.charCodeAt(0) ?? 0)) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[n];
}

// ── Skeleton card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-5 w-14 bg-gray-100 rounded-md" />
          </div>
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-3.5 w-36 bg-gray-200 rounded" />
        <div className="h-3.5 w-44 bg-gray-200 rounded" />
        <div className="h-3.5 w-28 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-3.5 w-24 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ count, label, icon: Icon, iconBg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div
          className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ContactsPage() {
  const { accessToken } = useAppContext();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: contactsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/contacts", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const contacts = contactsData?.data || [];

  // Derive unique sources from API data
  const sources = useMemo(() => {
    const s = new Set(contacts.map((c) => c.source).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [contacts]);

  // Stats derived from real data
  const stats = useMemo(
    () => [
      {
        count: contacts.length,
        label: "Total Contacts",
        icon: Users,
        iconBg: "bg-[#3B4CB8]",
      },
      {
        count: contacts.filter((c) => c.status === "Lead").length,
        label: "Leads",
        icon: UserPlus,
        iconBg: "bg-[#1FB3C8]",
      },
      {
        count: contacts.filter((c) => c.status === "Client").length,
        label: "Clients",
        icon: UserCheck,
        iconBg: "bg-[#F5C842]",
      },
      {
        count: contacts.filter((c) => c.status === "Prospect").length,
        label: "Prospects",
        icon: Target,
        iconBg: "bg-[#2DD4BF]",
      },
    ],
    [contacts],
  );

  // Filter + search
  const filtered = useMemo(
    () =>
      contacts.filter((c) => {
        const matchStatus =
          selectedStatus === "all" || c.status === selectedStatus;
        const matchSource =
          selectedSource === "all" || c.source === selectedSource;
        const matchSearch = [c.first_name, c.last_name, c.email, c.phone]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchStatus && matchSource && matchSearch;
      }),
    [contacts, selectedStatus, selectedSource, searchQuery],
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      )
        pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const SelectArrow = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );

  return (
    <SectionContainer>
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm">
          Manage and organize your contacts efficiently
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.1} />
        ))}
      </div>

      {/* Filters + Actions bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-4 sm:p-5"
      >
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          {/* Left: search + filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] transition-all"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={handleFilterChange(setSelectedStatus)}
                className="appearance-none pl-4 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40"
              >
                <option value="all">All Status</option>
                <option value="Lead">Lead</option>
                <option value="Client">Client</option>
                <option value="Prospect">Prospect</option>
              </select>
              <SelectArrow />
            </div>

            {/* Source filter */}
            <div className="relative">
              <select
                value={selectedSource}
                onChange={handleFilterChange(setSelectedSource)}
                className="appearance-none pl-4 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40"
              >
                {sources.map((src) => (
                  <option key={src} value={src}>
                    {src === "all" ? "All Sources" : src}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>
          </div>

          {/* Right: export + add */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Export
            </motion.button>

            <Link href={"/dashboard/add-client"}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Count */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">{filtered.length}</span>{" "}
            contacts
          </p>
        </div>
      </motion.div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-sm text-red-500">
          Failed to load contacts. Please try again.
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {searchQuery || selectedStatus !== "all" || selectedSource !== "all"
              ? "No contacts match your filters."
              : "No contacts found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((contact, index) => {
            const badgeStyle =
              STATUS_BADGE[contact.status] ?? "bg-gray-100 text-gray-600";
            const color = avatarColor(contact.first_name, contact.last_name);
            const initials = getInitials(contact.first_name, contact.last_name);
            const addedDate = contact.created_at
              ? new Date(contact.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${color} w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white text-lg font-bold">
                        {initials}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeStyle}`}
                      >
                        {contact.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{contact.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Added: {addedDate}</span>
                  </div>
                </div>

                {/* Applications pill */}
                {contact.applications?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.applications.map((app) => (
                        <span
                          key={app.id}
                          className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium"
                        >
                          {app.workflow?.name ?? `App #${app.id}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Source:{" "}
                    <span className="font-medium text-gray-900">
                      {contact.source || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>

          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`e-${i}`}
                className="px-2 py-1.5 text-sm text-gray-400"
              >
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
            ),
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
    </SectionContainer>
  );
}
