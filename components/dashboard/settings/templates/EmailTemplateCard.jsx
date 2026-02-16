"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Edit2,
  Trash2,
  Loader2,
  Mail,
  Eye,
  Check,
  X,
  FileText,
  Paperclip,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export default function EmailTemplateCard({ template, index, onDelete, isDeleting }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    body: "",
  });

  // Fetch detailed template data
  const { data: detailData, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/email-templates/${template.id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && isDialogOpen,
  });

  const templateDetails = detailData?.data || template;
  console.log(templateDetails);
  

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(`/email-templates/${template.id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Template updated successfully");
        setIsEditMode(false);
        queryClient.invalidateQueries({ queryKey: ["/email-templates"] });
        queryClient.invalidateQueries({ queryKey: [`/email-templates/${template.id}`] });
      } else {
        toast.error(res.message || "Failed to update template");
      }
    },
    onError: () => toast.error("Failed to update template"),
  });

  // Populate form when switching to edit mode
  useEffect(() => {
    if (isEditMode && detailData?.data) {
      setFormData({
        title: templateDetails.title || "",
        subject: templateDetails.subject || "",
        body: templateDetails.body || "",
      });
    }
  }, [isEditMode, detailData, templateDetails]);

  const handleViewDetails = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    if (detailData?.data) {
      setFormData({
        title: templateDetails.title || "",
        subject: templateDetails.subject || "",
        body: templateDetails.body || "",
      });
      setIsEditMode(true);
    } else {
      setIsDialogOpen(true);
      setIsEditMode(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
  };

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
    fd.append("_method", "PUT");
    fd.append("title", formData.title.trim());
    fd.append("subject", formData.subject.trim());
    fd.append("body", formData.body.trim());

    updateMutation.mutate(fd);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {template.title}
                </h4>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  {template.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {template.body_preview}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleViewDetails}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
              {/* <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleViewDetails}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </motion.button> */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(template.id, template.title)}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{template.attachments_count || 0} attachments</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {template.updated_at}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {isEditMode ? "Edit Email Template" : "Email Template Details"}
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isEditMode ? (
            // Edit Form
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                  onClick={handleCloseDialog}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            // View Details
            <div className="py-4 space-y-6">
              {/* Template Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Template Title
                  </label>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {templateDetails.title}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Subject
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {templateDetails.subject}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Email Body
                  </label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {templateDetails.body}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {templateDetails.attachments_count || 0}
                  </p>
                </div>
                {templateDetails.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Updated
                    </label>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {templateDetails.updated_at}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setFormData({
                      title: templateDetails.title || "",
                      subject: templateDetails.subject || "",
                      body: templateDetails.body || "",
                    });
                    setIsEditMode(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Template
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}