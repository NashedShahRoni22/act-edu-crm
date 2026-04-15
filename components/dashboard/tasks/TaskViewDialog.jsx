"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Check,
  Loader2,
  X,
  Download,
  FileText,
  Archive,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  postWithToken,
  fetchWithToken,
  putWithToken,
  deleteWithToken,
} from "@/helpers/api";
import { useAppContext } from "@/context/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUSES = [
  { value: "to_do", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

const STATUS_COLORS = {
  to_do: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  in_review: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
};

export default function TaskViewDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [fullTaskData, setFullTaskData] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [newAttachments, setNewAttachments] = useState([]);

  // Fetch full task details
  useEffect(() => {
    if (task?.id && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTaskLoading(true);
      fetchWithToken({
        queryKey: [`/tasks/${task.id}`, accessToken],
      })
        .then((res) => {
          if (res?.data) {
            setFullTaskData(res.data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch task details:", error);
        })
        .finally(() => {
          setTaskLoading(false);
        });
    }
  }, [task?.id, open, accessToken]);

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      return postWithToken(`/tasks/${task.id}/archive`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(
          fullTaskData?.is_archived ? "Task unarchived" : "Task archived",
        );
        queryClient.invalidateQueries({ queryKey: ["/tasks?filter=all"] });
        queryClient.invalidateQueries({ queryKey: [`/tasks/${task.id}`] });
        // Refetch full task data
        fetchWithToken({
          queryKey: [`/tasks/${task.id}`, accessToken],
        }).then((res) => {
          if (res?.data) setFullTaskData(res.data);
        });
      }
    },
    onError: () => {
      toast.error("Failed to update archive status");
    },
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("status", newStatus);
      return postWithToken(`/tasks/${task.id}/status`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Status updated");
        queryClient.invalidateQueries({ queryKey: ["/tasks?filter=all"] });
        queryClient.invalidateQueries({ queryKey: [`/tasks/${task.id}`] }); // Refetch full task data
        fetchWithToken({
          queryKey: [`/tasks/${task.id}`, accessToken],
        }).then((res) => {
          if (res?.data) setFullTaskData(res.data);
        });
      }
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("comment", comment);
      return postWithToken(`/tasks/${task.id}/comments`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Comment added");
        setComment("");
        queryClient.invalidateQueries({ queryKey: ["/tasks?filter=all"] });
        queryClient.invalidateQueries({ queryKey: [`/tasks/${task.id}`] }); // Refetch full task data
        fetchWithToken({
          queryKey: [`/tasks/${task.id}`, accessToken],
        }).then((res) => {
          if (res?.data) setFullTaskData(res.data);
        });
      }
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  // Upload attachments mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      newAttachments.forEach((file) => {
        fd.append("file", file);
      });
      return postWithToken(`/tasks/${task.id}/attachments`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Attachments uploaded");
        setNewAttachments([]);
        queryClient.invalidateQueries({ queryKey: ["/tasks?filter=all"] });
        queryClient.invalidateQueries({ queryKey: [`/tasks/${task.id}`] }); // Refetch full task data
        fetchWithToken({
          queryKey: [`/tasks/${task.id}`, accessToken],
        }).then((res) => {
          if (res?.data) setFullTaskData(res.data);
        });
      }
    },
    onError: () => {
      toast.error("Failed to upload attachments");
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return deleteWithToken(`/tasks/${task.id}`, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Task deleted");
        queryClient.invalidateQueries({ queryKey: ["/tasks?filter=all"] });
        onOpenChange(false);
        onSuccess?.();
      }
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const handleAddComment = () => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    commentMutation.mutate();
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    setNewAttachments((prev) => [...prev, ...files]);
  };

  const handleUploadAttachments = () => {
    if (newAttachments.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    uploadMutation.mutate();
  };

  if (!fullTaskData || taskLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[50vw] sm:w-full max-w-[50vw] w-[50vw] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[50vw] sm:w-full max-w-[50vw] w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {fullTaskData.title}
          </DialogTitle>
          <DialogDescription>Task details and activity</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-6 py-4">
          {/* Left Column - Task Details */}
          <div className="col-span-3 space-y-6">
            {/* Status Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status
              </label>
              <select
                value={fullTaskData.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  statusMutation.isPending ? "opacity-50" : ""
                }`}
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {fullTaskData.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Priority
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    fullTaskData.priority === "low"
                      ? "bg-blue-100 text-blue-800"
                      : fullTaskData.priority === "normal"
                        ? "bg-gray-100 text-gray-800"
                        : fullTaskData.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {fullTaskData.priority}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Assignee
                </p>
                {fullTaskData.assignee ? (
                  <p className="text-sm font-medium text-gray-900">
                    {fullTaskData.assignee.first_name}{" "}
                    {fullTaskData.assignee.last_name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Unassigned</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Creator
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {fullTaskData.creator?.first_name}{" "}
                  {fullTaskData.creator?.last_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Due Date
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {fullTaskData.due_date
                    ? new Date(fullTaskData.due_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "Not set"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Due Time
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {fullTaskData.due_time
                    ? new Date(
                        `2000-01-01 ${fullTaskData.due_time}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "Not set"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Related To
                </p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {fullTaskData.related_to_type}
                </p>
              </div>
            </div>

            {/* Related Information */}
            {fullTaskData.related_to_type !== "internal" && fullTaskData.related_to_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-3 capitalize">
                  Related {fullTaskData.related_to_type} Details
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  {fullTaskData.related_to_type === "contact" && fullTaskData.contact && (
                    <>
                      <p><span className="font-medium">Name:</span> {fullTaskData.contact.first_name} {fullTaskData.contact.last_name}</p>
                      <p><span className="font-medium">Email:</span> {fullTaskData.contact.email || "-"}</p>
                      <p><span className="font-medium">Phone:</span> {fullTaskData.contact.phone || "-"}</p>
                    </>
                  )}
                  {fullTaskData.related_to_type === "partner" && fullTaskData.partner && (
                    <>
                      <p><span className="font-medium">Name:</span> {fullTaskData.partner.name}</p>
                      <p><span className="font-medium">Email:</span> {fullTaskData.partner.email || "-"}</p>
                    </>
                  )}
                  {fullTaskData.related_to_type === "application" && fullTaskData.application && (
                    <>
                      <p><span className="font-medium">Workflow:</span> {fullTaskData.application.workflow?.name || "-"}</p>
                      <p><span className="font-medium">Contact:</span> {fullTaskData.application.contact?.first_name} {fullTaskData.application.contact?.last_name}</p>
                      <p><span className="font-medium">Status:</span> {fullTaskData.application.status}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {fullTaskData.description && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {fullTaskData.description}
                </p>
              </div>
            )}

            {/* Followers */}
            {fullTaskData.followers && fullTaskData.followers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Followers ({fullTaskData.followers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {fullTaskData.followers.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-2"
                    >
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {follower.first_name?.[0]}
                          {follower.last_name?.[0]}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-900">
                        {follower.first_name} {follower.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders */}
            {fullTaskData.reminders && fullTaskData.reminders.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Reminders ({fullTaskData.reminders.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fullTaskData.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      <p className="text-xs font-medium text-amber-900 uppercase tracking-wide">
                        {reminder.channel === "both"
                          ? "Notification & Email"
                          : reminder.channel}
                      </p>
                      <p className="text-sm text-amber-800 font-medium">
                        {reminder.duration} {reminder.duration_type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-900">
                  Attachments ({(fullTaskData.attachments || []).length})
                </p>
              </div>

              {fullTaskData.attachments &&
                fullTaskData.attachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {fullTaskData.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.attachment_full_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                )}

              {/* Upload new attachments */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachment}
                    className="hidden"
                  />
                </label>
              </div>

              {newAttachments.length > 0 && (
                <div>
                  <div className="mt-3 space-y-2 mb-3">
                    {newAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-xs text-gray-900 truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            setNewAttachments((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUploadAttachments}
                    disabled={uploadMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        Upload Files
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-3">
                Comments ({(fullTaskData.comments || []).length})
              </p>

              {/* Comment Input */}
              <div className="mb-4 space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddComment}
                  disabled={commentMutation.isPending || !comment.trim()}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50"
                >
                  {commentMutation.isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3 h-3" />
                      Add Comment
                    </>
                  )}
                </motion.button>
              </div>

              {/* Comments List */}
              {fullTaskData.comments && fullTaskData.comments.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {fullTaskData.comments.map((commentItem) => (
                    <div
                      key={commentItem.id}
                      className="bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {commentItem.user?.first_name?.[0]}
                            {commentItem.user?.last_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">
                            {commentItem.user?.first_name}{" "}
                            {commentItem.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(commentItem.created_at).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                          <p className="text-xs text-gray-700 mt-2">
                            {commentItem.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {archiveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  {fullTaskData.is_archived ? "Unarchive" : "Archive"}
                </>
              )}
            </motion.button>

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(fullTaskData.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(fullTaskData.updated_at).toLocaleString()}
                </p>
              </div>

              {fullTaskData.is_archived && (
                <div className="bg-amber-100 border border-amber-300 p-2 rounded">
                  <p className="text-amber-800 font-medium">
                    This task is archived
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
