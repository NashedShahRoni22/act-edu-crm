"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Calendar,
  UserPlus,
  PlayCircle,
  CheckCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";
import AssignHostModal from "./AssignHostModal";

export default function CheckInCard({
  item,
  index,
  statusColor,
  displayTime,
  displayDate,
}) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  // Timer for attending status
  useEffect(() => {
    if (item.status !== "Attending") return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [item.status]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const attendMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      return postWithToken(`/check-ins/${item.id}/attend`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        toast.success(res.message || "Check-in marked as attending");
        // Refetch all check-ins data
        setTimeout(() => {
          queryClient.invalidateQueries();
        }, 500);
      } else {
        toast.error(res?.message || "Failed to mark as attending");
      }
    },
    onError: () => toast.error("Failed to mark as attending"),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      return postWithToken(`/check-ins/${item.id}/complete`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        toast.success(res.message || "Check-in marked as completed");
        // Refetch all check-ins data
        setTimeout(() => {
          queryClient.invalidateQueries();
        }, 500);
      } else {
        toast.error(res?.message || "Failed to mark as completed");
      }
    },
    onError: () => toast.error("Failed to mark as completed"),
  });
  const getStatusBgColor = (color) => {
    switch (color) {
      case "yellow":
        return "bg-warning/10 border-warning/30";
      case "cyan":
        return "bg-progress/10 border-progress/30";
      case "green":
        return "bg-success/10 border-success/30";
      case "gray":
        return "bg-gray-100 border-gray-300";
      case "blue":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusTextColor = (color) => {
    switch (color) {
      case "yellow":
        return "text-warning";
      case "cyan":
        return "text-progress";
      case "green":
        return "text-success";
      case "gray":
        return "text-gray-600";
      case "blue":
        return "text-primary";
      default:
        return "text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`grid grid-cols-12 gap-4 p-5 rounded-xl border-2 transition-all hover:shadow-md ${getStatusBgColor(
        statusColor,
      )}`}
    >
      {/* Left: Avatar & Contact Info */}
      <div className="col-span-12 sm:col-span-3 flex gap-3">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${
            statusColor === "yellow"
              ? "border-warning bg-warning/20"
              : statusColor === "cyan"
                ? "border-progress bg-progress/20"
                : statusColor === "green"
                  ? "border-success bg-success/20"
                  : statusColor === "gray"
                    ? "border-gray-400 bg-gray-100"
                    : "border-primary bg-primary/20"
          }`}
        >
          <AlertCircle
            className={`w-6 h-6 ${getStatusTextColor(statusColor)}`}
            strokeWidth={2}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            {item.contact?.first_name || ""} {item.contact?.last_name || ""}
          </h3>
          <p className="text-xs text-gray-500">{item.contact?.email || ""}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-400">
              {item.contact?.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Middle-Left: Purpose */}
      <div className="col-span-12 sm:col-span-2">
        <p className="text-xs text-gray-500 uppercase font-semibold">Purpose</p>
        <p className="text-sm font-medium text-gray-900 mt-1">
          {item.visit_purpose || "N/A"}
        </p>
      </div>

      {/* Middle: Assignee Info */}
      <div className="col-span-12 sm:col-span-2">
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Assigned To
        </p>
        {item.assignee ? (
          <div className="mt-1">
            <p className="text-sm font-medium text-gray-900">
              {item.assignee.first_name} {item.assignee.last_name}
            </p>
            <p className="text-xs text-gray-500">{item.assignee.email}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-1">Unassigned</p>
        )}
      </div>

      {/* Middle-Right: Time & Date */}
      {/* <div className="col-span-12 sm:col-span-2 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 mt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">{displayTime}</p>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">{displayDate}</p>
        </div>
      </div> */}

      {/* Right: Status, Timer & Actions */}
      <div className="col-span-12 sm:col-span-4 flex gap-2 justify-center items-center">
        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-2 h-fit ${
            statusColor === "yellow"
              ? "bg-warning/10 border-warning text-warning"
              : statusColor === "cyan"
                ? "bg-progress/10 border-progress text-progress"
                : statusColor === "green"
                  ? "bg-success/10 border-success text-success"
                : statusColor === "gray"
                  ? "bg-gray-100 border-gray-400 text-gray-600"
                  : "bg-primary/10 border-primary text-primary"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              statusColor === "yellow"
                ? "bg-warning"
                : statusColor === "cyan"
                  ? "bg-progress"
                  : statusColor === "green"
                    ? "bg-success"
                    : statusColor === "gray"
                      ? "bg-gray-400"
                      : "bg-primary"
            }`}
          />
          {item.status || "Unassigned"}
        </div>

        {/* Timer Display - Only when Attending */}
        {item.status === "Attending" && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-2 bg-cyan-50 border-cyan-200">
            <div className="animate-pulse w-2 h-2 rounded-full bg-cyan-500" />
            <span className="font-mono font-bold text-cyan-700">
              {formatTime(elapsedTime)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1 flex-nowrap items-center">
          {/* Step 1: Assign */}
          {item.status === "Unassigned" && (
            <Button
              size="sm"
              className={`gap-1 whitespace-nowrap border-2 rounded-full font-semibold text-xs py-1.5 px-3 bg-gray-100 border-gray-400 text-gray-600 hover:bg-gray-200`}
              onClick={() => setIsAssignModalOpen(true)}
            >
              <UserPlus className="w-3 h-3" />
              Assign
            </Button>
          )}

          {/* Step 2: Start Meeting */}
          {item.status === "Waiting" && (
            <Button
              size="sm"
              className={`gap-1 whitespace-nowrap border-2 rounded-full font-semibold text-xs py-1.5 px-3 bg-warning/10 border-warning text-warning hover:bg-warning/20`}
              onClick={() => attendMutation.mutate()}
              disabled={attendMutation.isPending}
            >
              <PlayCircle className="w-3 h-3" />
              {attendMutation.isPending ? "Starting..." : "Start"}
            </Button>
          )}

          {/* Step 3: Complete */}
          {item.status === "Attending" && (
            <Button
              size="sm"
              className={`gap-1 whitespace-nowrap border-2 rounded-full font-semibold text-xs py-1.5 px-3 bg-success/10 border-success text-success hover:bg-success/20`}
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
            >
              <CheckCircle className="w-3 h-3" />
              {completeMutation.isPending ? "Completing..." : "Complete"}
            </Button>
          )}
        </div>
      </div>

      <AssignHostModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        checkInId={item.id}
      />
    </motion.div>
  );
}
