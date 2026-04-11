"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Download,
  Eye,
  Loader2,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithToken, postWithToken, deleteWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";
import TaskCreateDialog from "../tasks/TaskCreateDialog";
import TaskViewDialog from "../tasks/TaskViewDialog";

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-800",
  normal: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  to_do: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  in_review: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
};

const STATUS_ICONS = {
  to_do: <Circle className="w-4 h-4" />,
  in_progress: <Clock className="w-4 h-4" />,
  in_review: <AlertCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
};

export default function Tasks() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch tasks
  const { data, isLoading } = useQuery({
    queryKey: ["/tasks?filter=all", accessToken],
    queryFn: () =>
      fetchWithToken({
        queryKey: [`/tasks?filter=all`, accessToken],
      }),
    enabled: !!accessToken,
  });

  const tasks = data?.data || [];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;

    return matchesSearch && matchesStatus;
  });



  // Handlers
  const handleView = (task) => {
    setSelectedTask(task);
    setShowViewDialog(true);
  };

  const handleAddNew = () => {
    setShowCreateDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isOverdue = (dueDate, status) => {
    if (status === "completed") return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your tasks
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </motion.button>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Status Filter */}
          <div className="flex gap-2">
            {["all", "to_do", "in_progress", "in_review", "completed"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {status.replace(/_/g, " ").toUpperCase()}
                </button>
              )
            )}
          </div>

          {/* Search */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tasks Grid/List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-12 h-12 text-gray-300" />
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? `No tasks found matching "${searchQuery}"`
                  : "No tasks found"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {task.title}
                        </p>
                        {task.category && (
                          <span className="text-xs text-gray-500 capitalize">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {task.assignee.first_name?.[0]}
                              {task.assignee.last_name?.[0]}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">
                            {task.assignee.first_name} {task.assignee.last_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          PRIORITY_COLORS[task.priority] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 capitalize ${
                            STATUS_COLORS[task.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {STATUS_ICONS[task.status]}
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`text-sm font-medium ${
                            isOverdue(task.due_date, task.status)
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatDate(task.due_date)}
                        </span>
                        {task.due_time && (
                          <span className="text-xs text-gray-500">
                            {formatTime(task.due_time)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleView(task)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Dialogs */}
      <TaskCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/tasks"] })}
      />

      <TaskViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        task={selectedTask}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/tasks"] })}
      />
    </motion.div>
  );
}
