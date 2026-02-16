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
  User,
  Power,
  Inbox,
  FileSignature,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CompanyEmailCard from "./CompanyEmailCard";

const emptyForm = {
  email_id: "",
  display_name: "",
  signature: "",
  status: true,
  incoming_type: "all",
  shared_users: [],
};

export default function CompanyEmails() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // Fetch list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/company-emails", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const emails = data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/company-emails", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Email added successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
      } else {
        toast.error(res.message || "Failed to add email");
      }
    },
    onError: () => toast.error("Failed to add email"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/company-emails/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Email deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
      } else {
        toast.error(res.message || "Failed to delete email");
      }
    },
    onError: () => toast.error("Failed to delete email"),
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

  // Add shared user
  const addSharedUser = () => {
    setFormData((prev) => ({
      ...prev,
      shared_users: [...prev.shared_users, ""],
    }));
  };

  // Remove shared user
  const removeSharedUser = (index) => {
    setFormData((prev) => ({
      ...prev,
      shared_users: prev.shared_users.filter((_, i) => i !== index),
    }));
  };

  // Update shared user
  const updateSharedUser = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      shared_users: prev.shared_users.map((user, i) =>
        i === index ? value : user
      ),
    }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email_id.trim()) {
      toast.error("Email address is required");
      return;
    }

    // Validate shared users
    const hasEmptyUsers = formData.shared_users.some((user) => !user.trim());
    if (hasEmptyUsers) {
      toast.error("Please fill in all shared user IDs or remove empty fields");
      return;
    }

    const fd = new FormData();
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

    createMutation.mutate(fd);
  };

  // Handle delete
  const handleDelete = (id, emailId) => {
    if (window.confirm(`Delete email "${emailId}"? This action cannot be undone.`)) {
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
          <p className="text-sm text-red-800">Failed to load company emails</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 bg-white rounded-lg"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Company Emails</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your company email accounts
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
            Add Email
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
                  Add Company Email
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Add Email
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emails List */}
      {emails.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Mail className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No company emails configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Email
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email, index) => (
            <CompanyEmailCard
              key={email.id}
              email={email}
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