"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  UserCheck,
  Target,
  Upload,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import SectionContainer from "../SectionContainer";
import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import Link from "next/link";
import ContactCard from "../contacts/ContactCard";

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

// ── Select arrow component ────────────────────────────────────
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

// ── Main page ────────────────────────────────────────────────
export default function ContactsPage() {
  const { accessToken } = useAppContext();
  const [selectedStatus, setSelectedStatus] = useState("Lead");
  const [selectedSource, setSelectedSource] = useState("System");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params for API
  const queryParams = new URLSearchParams();
  if (selectedStatus && selectedStatus !== "all") {
    queryParams.append("status", selectedStatus);
  }
  if (selectedSource && selectedSource !== "all") {
    queryParams.append("source", selectedSource);
  }
  if (debouncedSearch.trim()) {
    queryParams.append("search", debouncedSearch);
  }
  queryParams.append("page", currentPage.toString());
  queryParams.append("rows", "5");

  const {
    data: contactsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/contacts?${queryParams.toString()}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const contacts = useMemo(() => contactsData?.data || [], [contactsData?.data]);
  
  // Pagination info from API
  const paginationInfo = useMemo(
    () => ({
      currentPage: contactsData?.current_page || 1,
      lastPage: contactsData?.last_page || 1,
      total: contactsData?.total || 0,
      perPage: contactsData?.per_page || 5,
      from: contactsData?.from,
      to: contactsData?.to,
      hasNextPage: !!contactsData?.next_page_url,
      hasPrevPage: !!contactsData?.prev_page_url,
    }),
    [contactsData],
  );

  // Stats derived from meta data
  const stats = useMemo(
    () => [
      {
        count: contactsData?.meta?.total || 0,
        label: "Total Contacts",
        icon: Users,
        iconBg: "bg-[#3B4CB8]",
      },
      {
        count: contactsData?.meta?.lead || 0,
        label: "Leads",
        icon: UserPlus,
        iconBg: "bg-[#1FB3C8]",
      },
      {
        count: contactsData?.meta?.client || 0,
        label: "Clients",
        icon: UserCheck,
        iconBg: "bg-[#F5C842]",
      },
      {
        count: contactsData?.meta?.prospect || 0,
        label: "Prospects",
        icon: Target,
        iconBg: "bg-[#2DD4BF]",
      },
    ],
    [contactsData?.meta],
  );

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <option value="Lead">Lead</option>
                <option value="Archived">Archived</option>
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
                <option value="System">System</option>
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
      </motion.div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-sm text-red-500">
          Failed to load contacts. Please try again.
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {searchQuery ? "No contacts match your search." : "No contacts found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact, index) => {
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
              <ContactCard
                key={index}
                contact={contact}
                index={index}
                badgeStyle={badgeStyle}
                color={color}
                initials={initials}
                addedDate={addedDate}
              />
            );
          })}
        </div>
      )}

      {/* Pagination info and controls */}
      {!isLoading && contacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Info */}
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {paginationInfo.from || 0} – {paginationInfo.to || 0}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">{paginationInfo.total}</span>{" "}
            contacts
          </p>

          {/* Pagination controls */}
          {paginationInfo.lastPage > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!paginationInfo.hasPrevPage}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: paginationInfo.lastPage }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        paginationInfo.currentPage === page
                          ? "bg-[#3B4CB8] text-white"
                          : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(paginationInfo.lastPage, p + 1),
                  )
                }
                disabled={!paginationInfo.hasNextPage}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </SectionContainer>
  );
}
