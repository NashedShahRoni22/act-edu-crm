"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CreditCard,
  FileText,
  ChevronDown,
  X,
  Check,
  AlignLeft,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";

const INVOICE_TYPES = [
  "Net Commission Invoice",
  "Client General Invoice",
  "Partner General Invoice",
  "Tax Invoice",
  "Proformance Invoice",
  "Gross Commission Invoice",
  "Group Invoice",
];

const emptyForm = {
  name: "",
  content: "",
  invoice_types: [],
};

export default function ManualPayment() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(false);

  // Fetch list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/manual-payment-details", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const payments = data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/manual-payment-details", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Payment detail created successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/manual-payment-details"] });
      } else {
        toast.error(res.message || "Failed to create payment detail");
      }
    },
    onError: () => toast.error("Failed to create payment detail"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/manual-payment-details/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Payment detail updated successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/manual-payment-details"] });
      } else {
        toast.error(res.message || "Failed to update payment detail");
      }
    },
    onError: () => toast.error("Failed to update payment detail"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/manual-payment-details/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Payment detail deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/manual-payment-details"] });
      } else {
        toast.error(res.message || "Failed to delete payment detail");
      }
    },
    onError: () => toast.error("Failed to delete payment detail"),
  });

  // Reset form
  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setInvoiceDropdownOpen(false);
  };

  // Open add form
  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (payment) => {
    setFormData({
      name: payment.name,
      content: payment.content,
      invoice_types: payment.invoice_types || [],
    });
    setEditingId(payment.id);
    setShowForm(true);
  };

  // Toggle invoice type selection
  const toggleInvoiceType = (type) => {
    setFormData((prev) => ({
      ...prev,
      invoice_types: prev.invoice_types.includes(type)
        ? prev.invoice_types.filter((t) => t !== type)
        : [...prev.invoice_types, type],
    }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (formData.invoice_types.length === 0) {
      toast.error("Select at least one invoice type");
      return;
    }

    const fd = new FormData();
    if (editingId) fd.append("_method", "PUT");
    fd.append("name", formData.name.trim());
    fd.append("content", formData.content.trim());
    formData.invoice_types.forEach((type) => fd.append("invoice_types[]", type));

    if (editingId) {
      updateMutation.mutate({ id: editingId, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  // Handle delete
  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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
          <p className="text-sm text-red-800">Failed to load payment details</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 bg-white p-6 rounded-lg border border-gray-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          Manual Payment Details
        </p>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Payment Detail
          </motion.button>
        )}
      </div>

      {/* Add / Edit Form */}
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
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-gray-900">
                  {editingId ? "Edit Payment Detail" : "Add Payment Detail"}
                </h3>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. ACT Trans Details"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bank / Payment Content <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, content: e.target.value }))
                    }
                    rows={6}
                    placeholder={
                      "Account Name: ...\nBSB: ...\nAccount Number: ...\nSWIFT Code: ...\nBank Name: ..."
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none leading-relaxed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Each line will be displayed as a separate entry on invoices.
                </p>
              </div>

              {/* Invoice Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice Types <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setInvoiceDropdownOpen((p) => !p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <span className="text-gray-700">
                      {formData.invoice_types.length === 0
                        ? "Select invoice types..."
                        : `${formData.invoice_types.length} type${formData.invoice_types.length > 1 ? "s" : ""} selected`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${invoiceDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {invoiceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-y-auto max-h-64"
                      >
                        {INVOICE_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleInvoiceType(type)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                formData.invoice_types.includes(type)
                                  ? "bg-primary border-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData.invoice_types.includes(type) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-gray-700">{type}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected tags */}
                {formData.invoice_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.invoice_types.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => toggleInvoiceType(type)}
                          className="hover:text-primary-deep"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
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
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingId ? "Save Changes" : "Create"}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Cards List */}
      {payments.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <CreditCard className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No payment details configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Payment Detail
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {payment.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ID: {payment.id} &bull; Agency: {payment.agency_id}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(payment)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(payment.id, payment.name)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5" />
                    Bank Details
                  </p>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    {payment.content.split("\n").map((line, i) =>
                      line.trim() ? (
                        <p key={i} className="text-sm text-gray-700 leading-relaxed">
                          {line}
                        </p>
                      ) : (
                        <div key={i} className="h-2" />
                      )
                    )}
                  </div>
                </div>

                {/* Invoice Types */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Applied to Invoice Types
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {payment.invoice_types.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}