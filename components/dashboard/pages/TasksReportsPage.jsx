"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import SectionContainer from "../SectionContainer";
import { motion } from "framer-motion";
import TasksReportsSkeleton from "./TasksReportsSkeleton";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from "lucide-react";

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
  "-": "bg-gray-100 text-gray-700",
};

const STATUS_COLORS = {
  to_do: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  "-": "bg-gray-100 text-gray-700",
};

const STATUS_LABELS = {
  to_do: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const CATEGORY_COLORS = {
  call: "bg-blue-100 text-blue-700",
  email: "bg-green-100 text-green-700",
  meeting: "bg-purple-100 text-purple-700",
  task: "bg-orange-100 text-orange-700",
  reminder: "bg-pink-100 text-pink-700",
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

export default function TasksReportsPage() {
  const { accessToken } = useAppContext();
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [taskType, setTaskType] = useState("personal");

  const queryString = `/reports/tasks?page=${currentPage}&type=${taskType}`;

  const { data: reportsData, isLoading } = useQuery({
    queryKey: [queryString, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const paginationData = reportsData?.data || {};
  const tasks = paginationData?.data || [];
  const totalPages = paginationData?.last_page || 1;
  const total = paginationData?.total || 0;

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
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
  const statusCounts = {
    to_do: tasks.filter(t => t.status === "to_do").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const stats = [
    {
      label: "Total Tasks",
      value: total,
      color: "bg-blue-50",
      icon: ListTodo,
    },
    {
      label: "To Do",
      value: statusCounts.to_do,
      color: "bg-gray-50",
      icon: AlertCircle,
    },
    {
      label: "In Progress",
      value: statusCounts.in_progress,
      color: "bg-blue-50",
      icon: Clock,
    },
    {
      label: "Completed",
      value: statusCounts.completed,
      color: "bg-green-50",
      icon: CheckCircle2,
    },
  ];

  if (isLoading) {
    return <TasksReportsSkeleton />;
  }

  return (
    <SectionContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks Reports</h1>
          <p className="text-gray-600">View and manage all tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Task Type Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
            <select
              value={taskType}
              onChange={(e) => {
                setTaskType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">Personal</option>
              <option value="team">Team</option>
              <option value="all">All</option>
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
                      onClick={() => handleSort("task_title")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Task Title
                      {sortConfig.key === "task_title" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("category")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Category
                      {sortConfig.key === "category" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("priority")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Priority
                      {sortConfig.key === "priority" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Status
                      {sortConfig.key === "status" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("due_date")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Due Date
                      {sortConfig.key === "due_date" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("due_time")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Due Time
                      {sortConfig.key === "due_time" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("current_assignee")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Assignee
                      {sortConfig.key === "current_assignee" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("task_added_by")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Added By
                      {sortConfig.key === "task_added_by" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("related_to")}
                      className="flex items-center gap-2 font-semibold text-gray-900 text-sm hover:text-gray-700"
                    >
                      Related To
                      {sortConfig.key === "related_to" && <SortIconComponent direction={sortConfig.direction} />}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.length > 0 ? (
                  sortedTasks.map((task, index) => (
                    <tr
                      key={task.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{task.task_title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-600 truncate">{task.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            CATEGORY_COLORS[task.category] || CATEGORY_COLORS["-"]
                          }`}
                        >
                          {task.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            PRIORITY_COLORS[task.priority] || PRIORITY_COLORS["-"]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[task.status] || STATUS_COLORS["-"]
                          }`}
                        >
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {task.due_date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {task.due_time}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {task.current_assignee}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {task.task_added_by}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {task.related_to}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
