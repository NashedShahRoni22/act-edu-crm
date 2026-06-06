"use client";

import { Users, Clock } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionContainer from "../SectionContainer";
import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import ContactsFilterSidebar from "../contacts/ContactsFilterSidebar";
import Pagination from "../shared/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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



// ── Main page ────────────────────────────────────────────────
export default function ContactsPage() {
  const { accessToken } = useAppContext();
  const router = useRouter();
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
          {/* Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Name</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Status</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Phone</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Source</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Added Date</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Applications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-32 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-md" /></TableCell>
                      <TableCell className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                      <TableCell className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></TableCell>
                      <TableCell className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
                      <TableCell className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-sm text-red-500 bg-white rounded-xl border border-gray-200">
              Failed to load contacts. Please try again.
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No contacts match your search."
                  : "No contacts found."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Name</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Status</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Phone</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Source</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Added Date</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">Applications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact, index) => {
                    const badgeStyle = STATUS_BADGE[contact.status] ?? "bg-gray-100 text-gray-600";
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
                      <TableRow 
                        key={contact.id || index} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                              <span className="text-white text-sm font-bold">{initials}</span>
                            </div>
                            <div className="max-w-[200px]">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {contact.first_name} {contact.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeStyle}`}>
                            {contact.status || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <p className="text-sm text-gray-600">{contact.phone || "—"}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <p className="text-sm text-gray-600 font-medium">{contact.source || "—"}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{addedDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {contact.applications?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {contact.applications.slice(0, 2).map((app) => (
                                <span
                                  key={app.id}
                                  className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium truncate max-w-[120px]"
                                >
                                  {app.workflow?.name ?? `App #${app.id}`}
                                </span>
                              ))}
                              {contact.applications.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs font-medium">
                                  +{contact.applications.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4">
            <Pagination
              {...paginationInfo}
              onPageChange={setCurrentPage}
              noun="contacts"
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
