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
  Plus,
  User,
  Users as UsersIcon,
  FileSignature,
  Power,
  Inbox,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export default function CompanyEmailCard({ email, index, onDelete, isDeleting }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email_id: "",
    display_name: "",
    signature: "",
    status: true,
    incoming_type: "all",
    shared_users: [],
  });

  // Fetch detailed email data
  const { data: detailData, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/company-emails/${email.id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && isDialogOpen,
  });

  const emailDetails = detailData?.data || email;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(`/company-emails/${email.id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Email updated successfully");
        setIsEditMode(false);
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
        queryClient.invalidateQueries({ queryKey: [`/company-emails/${email.id}`] });
      } else {
        toast.error(res.message || "Failed to update email");
      }
    },
    onError: () => toast.error("Failed to update email"),
  });

  // Populate form when switching to edit mode
  useEffect(() => {
    if (isEditMode && detailData?.data) {
      setFormData({
        email_id: emailDetails.email_id || "",
        display_name: emailDetails.display_name || "",
        signature: emailDetails.signature || "",
        status: emailDetails.status === 1 || emailDetails.status === true,
        incoming_type: emailDetails.incoming_type || "all",
        shared_users: emailDetails.shared_users || [],
      });
    }
  }, [isEditMode, detailData, emailDetails]);

  const handleViewDetails = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    if (detailData?.data) {
      setFormData({
        email_id: emailDetails.email_id || "",
        display_name: emailDetails.display_name || "",
        signature: emailDetails.signature || "",
        status: emailDetails.status === 1 || emailDetails.status === true,
        incoming_type: emailDetails.incoming_type || "all",
        shared_users: emailDetails.shared_users || [],
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

    if (!formData.email_id.trim()) {
      toast.error("Email ID is required");
      return;
    }

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("email_id", formData.email_id.trim());
    fd.append("status", formData.status ? "1" : "0");
    fd.append("incoming_type", formData.incoming_type);

    if (formData.display_name) {
      fd.append("display_name", formData.display_name.trim());
    }

    if (formData.signature) {
      fd.append("signature", formData.signature.trim());
    }

    if (formData.shared_users && formData.shared_users.length > 0) {
      formData.shared_users.forEach((userId, index) => {
        fd.append(`shared_users[${index}]`, userId);
      });
    }

    updateMutation.mutate(fd);
  };

  const addSharedUser = () => {
    setFormData((prev) => ({
      ...prev,
      shared_users: [...prev.shared_users, ""],
    }));
  };

  const removeSharedUser = (index) => {
    setFormData((prev) => ({
      ...prev,
      shared_users: prev.shared_users.filter((_, i) => i !== index),
    }));
  };

  const updateSharedUser = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      shared_users: prev.shared_users.map((user, i) =>
        i === index ? value : user
      ),
    }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {email.email_id}
              </h4>
              <div className="flex items-center gap-4 mt-1">
                {email.display_name && (
                  <>
                    <p className="text-xs text-gray-500">{email.display_name}</p>
                    <span className="text-xs text-gray-300">•</span>
                  </>
                )}
                <p className="text-xs text-gray-500 capitalize">
                  {email.incoming_type}
                </p>
                <span className="text-xs text-gray-300">•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    email.status === 1 || email.status === true
                      ? "bg-success/10 text-success"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {email.status === 1 || email.status === true ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleViewDetails}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEditClick}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(email.id, email.email_id)}
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
      </motion.div>

      {/* Details/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {isEditMode ? "Edit Company Email" : "Email Details"}
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isEditMode ? (
            // Edit Form
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Email ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email_id}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email_id: e.target.value }))
                  }
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, display_name: e.target.value }))
                  }
                  placeholder="e.g. Sales Team"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Status and Incoming Type */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.status === true}
                        onChange={() => setFormData((p) => ({ ...p, status: true }))}
                        className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.status === false}
                        onChange={() => setFormData((p) => ({ ...p, status: false }))}
                        className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Incoming Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incoming Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.incoming_type}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, incoming_type: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  >
                    <option value="all">All</option>
                    <option value="associated_only">Associated Only</option>
                  </select>
                </div>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Signature
                </label>
                <textarea
                  value={formData.signature}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, signature: e.target.value }))
                  }
                  placeholder="Enter email signature..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Shared Users */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Shared Users
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addSharedUser}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </motion.button>
                </div>

                <div className="space-y-2">
                  {formData.shared_users.map((userId, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => updateSharedUser(index, e.target.value)}
                        placeholder="User ID"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeSharedUser(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                  {formData.shared_users.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No shared users added
                    </p>
                  )}
                </div>
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
              {/* Email Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {emailDetails.email_id}
                  </p>
                </div>
                {emailDetails.display_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Display Name
                    </label>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {emailDetails.display_name}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Power className="w-4 h-4" />
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        emailDetails.status === 1 || emailDetails.status === true
                          ? "bg-success/10 text-success"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {emailDetails.status === 1 || emailDetails.status === true
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Inbox className="w-4 h-4" />
                    Incoming Type
                  </label>
                  <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">
                    {emailDetails.incoming_type}
                  </p>
                </div>
              </div>

              {/* Signature */}
              {emailDetails.signature && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                    <FileSignature className="w-4 h-4" />
                    Email Signature
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {emailDetails.signature}
                    </p>
                  </div>
                </div>
              )}

              {/* Shared Users */}
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <UsersIcon className="w-4 h-4" />
                  Shared Users ({emailDetails.shared_users?.length || 0})
                </label>
                {emailDetails.shared_users && emailDetails.shared_users.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {emailDetails.shared_users.map((userId, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        <User className="w-3 h-3" />
                        User {userId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No shared users</p>
                )}
              </div>

              {/* Edit Button */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setFormData({
                      email_id: emailDetails.email_id || "",
                      display_name: emailDetails.display_name || "",
                      signature: emailDetails.signature || "",
                      status: emailDetails.status === 1 || emailDetails.status === true,
                      incoming_type: emailDetails.incoming_type || "all",
                      shared_users: emailDetails.shared_users || [],
                    });
                    setIsEditMode(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Email
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}