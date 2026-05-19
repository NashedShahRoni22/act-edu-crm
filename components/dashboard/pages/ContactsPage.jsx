"use client";

import { Users } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import SectionContainer from "../SectionContainer";
import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import ContactCard from "../contacts/ContactCard";
import ContactsFilterSidebar from "../contacts/ContactsFilterSidebar";
import Pagination from "../shared/Pagination";

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

// ── Main page ────────────────────────────────────────────────
export default function ContactsPage() {
  const { accessToken } = useAppContext();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
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
  queryParams.append("rows", "10");

  const {
    data: contactsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/contacts?${queryParams.toString()}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const contacts = useMemo(
    () => contactsData?.data || [],
    [contactsData?.data],
  );

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

  const handleFilterChange = (setter) => (value) => {
    setter(value);
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

      <div className="flex flex-col lg:flex-row gap-6">
        <ContactsFilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={handleFilterChange(setSelectedStatus)}
          selectedSource={selectedSource}
          setSelectedSource={handleFilterChange(setSelectedSource)}
        />

        <div className="flex-1 min-w-0">
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
                {searchQuery
                  ? "No contacts match your search."
                  : "No contacts found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact, index) => {
                const badgeStyle =
                  STATUS_BADGE[contact.status] ?? "bg-gray-100 text-gray-600";
                const color = avatarColor(
                  contact.first_name,
                  contact.last_name,
                );
                const initials = getInitials(
                  contact.first_name,
                  contact.last_name,
                );
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

          <Pagination
            {...paginationInfo}
            onPageChange={setCurrentPage}
            noun="contacts"
          />
        </div>
      </div>
    </SectionContainer>
  );
}
