"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import SectionContainer from "../SectionContainer";
import { motion } from "framer-motion";
import ClientsByApplicationReportsSkeleton from "./ClientsByApplicationReportsSkeleton";
import Pagination from "../shared/Pagination";
import {
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  User,
  FileText,
  Badge as BadgeIcon,
} from "lucide-react";

const CONTACT_SOURCE_COLORS = {
  System: "bg-blue-100 text-blue-700",
  "Website Form": "bg-green-100 text-green-700",
  Referral: "bg-purple-100 text-purple-700",
  "Walk-in": "bg-orange-100 text-orange-700",
  "Facebook Lead Ads": "bg-pink-100 text-pink-700",
};

function SortIconComponent({ direction }) {
  if (direction === "asc") {
    return <ChevronUp className="w-4 h-4" />;
  } else if (direction === "desc") {
    return <ChevronDown className="w-4 h-4" />;
  }
  return <div className="w-4 h-4" />;
}

export default function ClientsByApplicationReportsPage() {
  const { accessToken } = useAppContext();
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: reportsData, isLoading, isFetching } = useQuery({
    queryKey: [`/reports/clients-by-application?rows=10&page=${currentPage}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
    placeholderData: keepPreviousData,
  });

  const paginationData = reportsData || {};
  const clients = paginationData.data || [];
  const totalPages = paginationData?.last_page || 1;
  const perPage = paginationData?.per_page || 50;
  const total = paginationData?.total || 0;
  const paginationInfo = {
    currentPage: paginationData?.current_page || 1,
    lastPage: totalPages,
    total,
    from: paginationData?.from,
    to: paginationData?.to,
    hasNextPage: !!paginationData?.next_page_url,
    hasPrevPage: !!paginationData?.prev_page_url,
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const sortedClients = [...clients].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === "-") return 1;
    if (bValue === null || bValue === "-") return -1;

    if (typeof aValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });

  if (isLoading) {
    return <ClientsByApplicationReportsSkeleton />;
  }

  const uniqueWorkflows = [...new Set(clients.flatMap((c) => c.workflows_array || []))];
  const uniqueSources = [
    ...new Set(clients.map((c) => c.contact_source).filter(Boolean)),
  ];

  return (
    <SectionContainer>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Clients by Application Report
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View clients grouped by their applications
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Records",
            value: total,
            color: "bg-blue-100 text-blue-700",
            icon: User,
          },
          {
            label: "Workflows",
            value: uniqueWorkflows.length,
            color: "bg-green-100 text-green-700",
            icon: FileText,
          },
          {
            label: "Contact Sources",
            value: uniqueSources.length,
            color: "bg-purple-100 text-purple-700",
            icon: Mail,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("client_name")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Client Name
                    {sortConfig.key === "client_name" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Email
                    {sortConfig.key === "email" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("phone")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Phone
                    {sortConfig.key === "phone" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("workflows")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Workflows
                    {sortConfig.key === "workflows" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("contact_source")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Source
                    {sortConfig.key === "contact_source" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("assignee")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Assigned
                    {sortConfig.key === "assignee" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("assignee_office")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Office
                    {sortConfig.key === "assignee_office" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("added_date")}
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                  >
                    Date
                    {sortConfig.key === "added_date" && <SortIconComponent direction={sortConfig.direction} />}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.length > 0 ? (
                sortedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-white">
                            {client.client_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {client.client_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate">
                        {client.email || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {client.phone || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {client.workflows !== "-" ? client.workflows : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          CONTACT_SOURCE_COLORS[client.contact_source] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {client.contact_source || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {client.assignee || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate">
                        {client.assignee_office || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {client.added_date || "-"}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <p className="text-gray-500">No data found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isFetching && !isLoading && (
          <div className="border-t border-gray-200 px-6 py-2 bg-gray-50 text-right text-xs text-gray-500">
            Updating...
          </div>
        )}
      </motion.div>

      <Pagination {...paginationInfo} onPageChange={setCurrentPage} noun="records" />
    </SectionContainer>
  );
}
