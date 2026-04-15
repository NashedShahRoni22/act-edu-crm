"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { postWithToken, fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { value: "reminder", label: "Reminder" },
  { value: "call", label: "Call" },
  { value: "call_back", label: "Call Back" },
  { value: "follow_up", label: "Follow Up" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "support", label: "Support" },
  { value: "others", label: "Others" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const REMINDER_CHANNELS = [
  { value: "notification", label: "Notification" },
  { value: "email", label: "Email" },
  { value: "both", label: "Both" },
];

const DURATION_TYPES = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const emptyForm = {
  title: "",
  category: "reminder",
  priority: "normal",
  description: "",
  assignee_id: "",
  due_date: "",
  due_time: "",
  related_to_type: "internal",
  related_to_id: "",
};

const emptyReminder = {
  channel: "email",
  duration: "",
  duration_type: "hours",
};

export default function TaskCreateDialog({ open, onOpenChange, onSuccess, presetType, presetId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(
    presetType && presetId
      ? { ...emptyForm, related_to_type: presetType, related_to_id: presetId }
      : emptyForm
  );
  const [attachments, setAttachments] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followerInput, setFollowerInput] = useState("");
  const [reminders, setReminders] = useState([]);

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open,
  });
  const users = usersData?.data || [];

  // Fetch contacts
  const { data: contactsData } = useQuery({
    queryKey: ["/contacts", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open && formData.related_to_type === "contact",
  });
  const contacts = contactsData?.data || [];

  // Fetch partners
  const { data: partnersData } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open && formData.related_to_type === "partner",
  });
  const partners = partnersData?.data || [];

  // Fetch applications
  const { data: applicationsData } = useQuery({
    queryKey: ["/applications", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open && formData.related_to_type === "application",
  });
  const applications = applicationsData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();

      fd.append("title", data.title);
      fd.append("category", data.category);
      fd.append("priority", data.priority);
      fd.append("description", data.description);
      fd.append("assignee_id", data.assignee_id);
      fd.append("due_date", data.due_date);
      fd.append("due_time", data.due_time);
      fd.append("related_to_type", data.related_to_type);
      fd.append("related_to_id", data.related_to_id);

      // Add followers
      followers.forEach((follower, idx) => {
        fd.append(`followers[${idx}]`, follower);
      });

      // Add reminders
      reminders.forEach((reminder, idx) => {
        fd.append(`reminders[${idx}][channel]`, reminder.channel);
        fd.append(`reminders[${idx}][duration]`, reminder.duration);
        fd.append(`reminders[${idx}][duration_type]`, reminder.duration_type);
      });

      // Add attachments
      attachments.forEach((file) => {
        fd.append("attachments[]", file);
      });

      return postWithToken(`/tasks`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Task created successfully");
        resetForm();
        onOpenChange(false);
        queryClient.invalidateQueries({ queryKey: ["/tasks?filter=all"] });
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to create task");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const resetForm = () => {
    if (presetType && presetId) {
      setFormData({ ...emptyForm, related_to_type: presetType, related_to_id: presetId });
    } else {
      setFormData(emptyForm);
    }
    setAttachments([]);
    setFollowers([]);
    setFollowerInput("");
    setReminders([]);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const addFollower = () => {
    if (followerInput && !followers.includes(followerInput)) {
      setFollowers((prev) => [...prev, followerInput]);
      setFollowerInput("");
    }
  };

  const removeFollower = (idx) => {
    setFollowers((prev) => prev.filter((_, i) => i !== idx));
  };

  const addReminder = () => {
    if (reminders.some((r) => !r.duration)) {
      toast.error("Please complete the current reminder");
      return;
    }
    setReminders((prev) => [...prev, { ...emptyReminder }]);
  };

  const updateReminder = (idx, field, value) => {
    setReminders((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeReminder = (idx) => {
    setReminders((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (formData.related_to_type !== "internal" && !formData.related_to_id) {
      toast.error("Related item is required when type is not Internal");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[50vw] sm:w-full max-w-[50vw] w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Fill in the task details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri.value} value={pri.value}>
                    {pri.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Assignee
              </label>
              <select
                value={formData.assignee_id}
                onChange={(e) => handleChange("assignee_id", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select Assignee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Due Time
            </label>
            <input
              type="time"
              value={formData.due_time}
              onChange={(e) => handleChange("due_time", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Related To Type & ID */}
          {!presetType ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Related To Type
                </label>
                <select
                  value={formData.related_to_type}
                  onChange={(e) => {
                    handleChange("related_to_type", e.target.value);
                    handleChange("related_to_id", "");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="internal">Internal</option>
                  <option value="contact">Contact</option>
                  <option value="partner">Partner</option>
                  <option value="application">Application</option>
                </select>
              </div>

              {formData.related_to_type !== "internal" && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {formData.related_to_type === "contact"
                      ? "Select Contact"
                      : formData.related_to_type === "partner"
                        ? "Select Partner"
                        : "Select Application"}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.related_to_id}
                    onChange={(e) => handleChange("related_to_id", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">
                      Select{" "}
                      {formData.related_to_type === "contact"
                        ? "Contact"
                        : formData.related_to_type === "partner"
                          ? "Partner"
                          : "Application"}
                    </option>
                    {formData.related_to_type === "contact" &&
                      contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </option>
                      ))}
                    {formData.related_to_type === "partner" &&
                      partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name}
                        </option>
                      ))}
                    {formData.related_to_type === "application" &&
                      applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.workflow?.name} - Contact{" "}
                          {app.contact?.first_name} {app.contact?.last_name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          ) : null}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter task description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Followers */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Add Followers
            </label>
            <div className="flex gap-2 mb-3">
              <select
                value={followerInput}
                onChange={(e) => setFollowerInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select user to follow</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
              <button
                onClick={addFollower}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
              >
                Add
              </button>
            </div>

            {followers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {followers.map((followerId, idx) => {
                  const user = users.find((u) => u.id.toString() === followerId.toString());
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>
                        {user?.first_name} {user?.last_name}
                      </span>
                      <button
                        onClick={() => removeFollower(idx)}
                        className="hover:text-primary-deep"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Reminders
              </label>
              <button
                onClick={addReminder}
                className="px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary-deep transition-colors"
              >
                + Add Reminder
              </button>
            </div>

            {reminders.length > 0 && (
              <div className="space-y-3">
                {reminders.map((reminder, idx) => (
                  <div key={idx} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Channel
                      </label>
                      <select
                        value={reminder.channel}
                        onChange={(e) => updateReminder(idx, "channel", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      >
                        {REMINDER_CHANNELS.map((ch) => (
                          <option key={ch.value} value={ch.value}>
                            {ch.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="number"
                        value={reminder.duration}
                        onChange={(e) => updateReminder(idx, "duration", e.target.value)}
                        placeholder="Enter duration"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={reminder.duration_type}
                        onChange={(e) => updateReminder(idx, "duration_type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      >
                        {DURATION_TYPES.map((dt) => (
                          <option key={dt.value} value={dt.value}>
                            {dt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => removeReminder(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <label className="flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachment}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-900 truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Task
              </>
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
