"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Loader2,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import TaskCreateDialog from "@/components/dashboard/tasks/TaskCreateDialog";
import TaskViewDialog from "@/components/dashboard/tasks/TaskViewDialog";

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

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-800",
  normal: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

function TaskSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-lg p-4">
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString) {
  if (!timeString) return "";
  return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ContactTasksTab({ contactId }) {
  const { accessToken } = useAppContext();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: [`/tasks?filter=all&client_id=${contactId}`, accessToken],
    queryFn: async () => {
      const response = await fetchWithToken({
        queryKey: [`/tasks?filter=all&client_id=${contactId}`, accessToken],
      });
      return response;
    },
    enabled: !!accessToken && !!contactId,
  });

  const tasks = data?.data || [];

  const handleView = (task) => {
    setSelectedTask(task);
    setShowViewDialog(true);
  };

  const handleAddNew = () => {
    setShowCreateDialog(true);
  };

  const isOverdue = (dueDate, status) => {
    if (status === "completed") return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Contact Tasks</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </motion.button>
        </div>
        <TaskSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contact Tasks</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </motion.button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No tasks yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              onClick={() => handleView(task)}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    STATUS_COLORS[task.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {STATUS_ICONS[task.status]}
                  {task.status === "to_do"
                    ? "To Do"
                    : task.status === "in_progress"
                      ? "In Progress"
                      : task.status === "in_review"
                        ? "In Review"
                        : "Completed"}
                </span>

                {/* Priority Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    PRIORITY_COLORS[task.priority] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.priority === "low"
                    ? "Low"
                    : task.priority === "high"
                      ? "High"
                      : task.priority === "urgent"
                        ? "Urgent"
                        : "Normal"}
                </span>

                {/* Due Date */}
                {task.due_date && (
                  <span
                    className={`text-xs font-medium ${
                      isOverdue(task.due_date, task.status)
                        ? "text-red-600 bg-red-50 px-2.5 py-1 rounded-full"
                        : "text-gray-600"
                    }`}
                  >
                    {formatDate(task.due_date)}
                  </span>
                )}

                {/* Assignee */}
                {task.assignee && (
                  <span className="text-xs text-gray-500 ml-auto">
                    Assigned to:{" "}
                    <span className="font-medium">
                      {task.assignee.first_name} {task.assignee.last_name}
                    </span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TaskCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        presetType="contact"
        presetId={contactId}
        onSuccess={() => {}}
      />

      {selectedTask && (
        <TaskViewDialog
          task={selectedTask}
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          onSuccess={() => {}}
        />
      )}
    </motion.div>
  );
}
