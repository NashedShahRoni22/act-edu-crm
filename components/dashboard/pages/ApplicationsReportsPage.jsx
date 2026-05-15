"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import SectionContainer from "../SectionContainer";
import { motion } from "framer-motion";
import ApplicationsReportsSkeleton from "./ApplicationsReportsSkeleton";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
  User as UserIcon,
} from "lucide-react";

const APPLICATION_STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Discontinued: "bg-red-100 text-red-700",
  "-": "bg-gray-100 text-gray-700",
};

const CLIENT_SOURCE_COLORS = {
  System: "bg-blue-100 text-blue-700",
  "Website Form": "bg-green-100 text-green-700",
  Referral: "bg-purple-100 text-purple-700",
  "Walk-in": "bg-orange-100 text-orange-700",
  "Facebook Lead Ads": "bg-pink-100 text-pink-700",
  "-": "bg-gray-100 text-gray-700",
};

function SortIconComponent({ direction }) {
  if (direction === "asc") {
    return <ChevronUp className="w-4 h-4" />;
  } else if (direction === "desc") {
    return <ChevronDown className="w-4 h-4" />;
  }
  return <div className="w-4 h-4" />;
}

export default function ApplicationsReportsPage() {
  const { accessToken } = useAppContext();
  const [sortConfig, setSortConfig] = useState({
    key: "application_id",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [workflows, setWorkflows] = useState([]);

  // Fetch workflows for filter
  const { data: workflowsData } = useQuery({
    queryKey: ["/workflows", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (workflowsData?.data) {
      setWorkflows(workflowsData.data);
    }
  }, [workflowsData]);

  // Build query string with optional workflow_id
  const queryString = selectedWorkflowId
    ? `/reports/applications?page=${currentPage}&workflow_id=${selectedWorkflowId}`
    : `/reports/applications?page=${currentPage}`;

  const { data: reportsData, isLoading } = useQuery({
    queryKey: [queryString, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const paginationData = reportsData?.data || {};
  const applications = paginationData?.data || [];
  const totalPages = paginationData?.last_page || 1;
  const total = paginationData?.total || 0;

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const sortedApplications = [...applications].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === "-") return 1;
    if (bValue === null || bValue === "-") return -1;

    if (typeof aValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Calculate stats
  const statuses = {
    Pending: applications.filter((app) => app.status === "Pending").length,
    "In Progress": applications.filter((app) => app.status === "In Progress")
      .length,
    Completed: applications.filter((app) => app.status === "Completed").length,
    Discontinued: applications.filter((app) => app.status === "Discontinued")
      .length,
  };

  const stats = [
    {
      label: "Total Applications",
      value: total,
      color: "bg-blue-50",
      icon: Zap,
    },
    {
      label: "In Progress",
      value: statuses["In Progress"],
      color: "bg-blue-50",
      icon: Clock,
    },
    {
      label: "Completed",
      value: statuses.Completed,
      color: "bg-green-50",
      icon: CheckCircle2,
    },
  ];

  if (isLoading) {
    return <ApplicationsReportsSkeleton />;
  }

  return (
    <SectionContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Applications Reports
          </h1>
          <p className="text-gray-600">View and manage all applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
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
                  <div
                    className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Workflow Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Workflow:
            </label>
            <select
              value={selectedWorkflowId}
              onChange={(e) => {
                setSelectedWorkflowId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Workflows</option>
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>
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
                      onClick={() => handleSort("client")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Client
                      {sortConfig.key === "client" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Email
                      {sortConfig.key === "email" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("workflow")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Workflow
                      {sortConfig.key === "workflow" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("stage")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Stage
                      {sortConfig.key === "stage" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Status
                      {sortConfig.key === "status" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("partner")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Partner
                      {sortConfig.key === "partner" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("product")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Product
                      {sortConfig.key === "product" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("assigned_to_user")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Assigned
                      {sortConfig.key === "assigned_to_user" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("client_source")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Source
                      {sortConfig.key === "client_source" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("added_date")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Date
                      {sortConfig.key === "added_date" && (
                        <SortIconComponent direction={sortConfig.direction} />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.length > 0 ? (
                  sortedApplications.map((application, index) => (
                    <tr
                      key={application.application_id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {(
                              application.client?.charAt(0) || "C"
                            ).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {application.client}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {application.workflow}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.stage}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            APPLICATION_STATUS_COLORS[application.status] ||
                            APPLICATION_STATUS_COLORS["-"]
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.partner}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.product}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.assigned_to_user}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            CLIENT_SOURCE_COLORS[application.client_source] ||
                            CLIENT_SOURCE_COLORS["-"]
                          }`}
                        >
                          {application.client_source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {application.added_date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page <span className="font-semibold">{currentPage}</span>{" "}
              of <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
