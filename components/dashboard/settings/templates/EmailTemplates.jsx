"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Mail,
  X,
  Check,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmailTemplateCard from "./EmailTemplateCard";

const emptyForm = {
  title: "",
  subject: "",
  body: "",
};

export default function EmailTemplates() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // Fetch list with type=email query parameter
  const { data, isLoading, error } = useQuery({
    queryKey: ["/email-templates", "email", accessToken],
    queryFn: async () => {
      const response = await fetchWithToken({
        queryKey: ["/email-templates?type=email", accessToken],
      });
      return response;
    },
    enabled: !!accessToken,
  });

  const templates = data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/email-templates", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Template created successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/email-templates"] });
      } else {
        toast.error(res.message || "Failed to create template");
      }
    },
    onError: () => toast.error("Failed to create template"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/email-templates/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Template deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/email-templates"] });
      } else {
        toast.error(res.message || "Failed to delete template");
      }
    },
    onError: () => toast.error("Failed to delete template"),
  });

  // Reset form
  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
  };

  // Open add form
  const handleAdd = () => {
    setFormData(emptyForm);
    setShowForm(true);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!formData.body.trim()) {
      toast.error("Body is required");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title.trim());
    fd.append("subject", formData.subject.trim());
    fd.append("body", formData.body.trim());

    createMutation.mutate(fd);
  };

  // Handle delete
  const handleDelete = (id, title) => {
    if (window.confirm(`Delete template "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load email templates</p>
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage reusable email templates
          </p>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </motion.button>
        )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-gray-900">
                  Add Email Template
                </h3>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Template Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Welcome Email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="e.g. Welcome to our platform"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, body: e.target.value }))
                  }
                  placeholder="Enter the email body content..."
                  rows={12}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none font-mono"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  You can use variables like {"{name}"}, {"{email}"}, etc.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Template
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      {templates.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Mail className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No email templates created yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Template
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <EmailTemplateCard
              key={template.id}
              template={template}
              index={index}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}