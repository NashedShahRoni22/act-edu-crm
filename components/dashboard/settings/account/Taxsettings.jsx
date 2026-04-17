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
  Percent,
  FileText,
  X,
  Check,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

// Tax Settings Skeleton Loader
function TaxSettingsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 bg-white p-6 rounded-lg border border-gray-200"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-5 py-6 bg-white">
              <div className="text-center space-y-2">
                <div className="h-4 w-16 bg-gray-100 rounded mx-auto" />
                <div className="h-10 w-20 bg-gray-200 rounded mx-auto" />
                <div className="h-3 w-48 bg-gray-100 rounded mx-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const emptyForm = {
  code: "",
  rate: "",
  is_default: false,
};

export default function TaxSettings() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/tax-settings", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const taxSettings = data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/tax-settings", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Tax setting created successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/tax-settings"] });
      } else {
        toast.error(res.message || "Failed to create tax setting");
      }
    },
    onError: () => toast.error("Failed to create tax setting"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/tax-settings/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Tax setting updated successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/tax-settings"] });
      } else {
        toast.error(res.message || "Failed to update tax setting");
      }
    },
    onError: () => toast.error("Failed to update tax setting"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/tax-settings/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Tax setting deleted successfully");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        queryClient.invalidateQueries({ queryKey: ["/tax-settings"] });
      } else {
        toast.error(res.message || "Failed to delete tax setting");
      }
    },
    onError: () => toast.error("Failed to delete tax setting"),
  });

  // Reset form
  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  // Open add form
  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (taxSetting) => {
    setFormData({
      code: taxSetting.code,
      rate: taxSetting.rate,
      is_default: taxSetting.is_default === 1 || taxSetting.is_default === true,
    });
    setEditingId(taxSetting.id);
    setShowForm(true);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error("Tax code is required");
      return;
    }
    
    if (!formData.rate || formData.rate === "") {
      toast.error("Tax rate is required");
      return;
    }

    const rateNum = parseFloat(formData.rate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      toast.error("Tax rate must be between 0 and 100");
      return;
    }

    const fd = new FormData();
    if (editingId) fd.append("_method", "PUT");
    fd.append("code", formData.code.trim());
    fd.append("rate", formData.rate);
    fd.append("is_default", formData.is_default ? "1" : "0");

    if (editingId) {
      updateMutation.mutate({ id: editingId, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  // Handle delete
  const handleDelete = (tax) => {
    setItemToDelete(tax);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <TaxSettingsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load tax settings</p>
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
      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tax Setting"
        description="Are you sure you want to delete this tax setting? This action cannot be undone."
        itemName={itemToDelete?.code}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tax Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your tax codes and rates for invoices
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Tax Setting
        </motion.button>
      </div>

      {/* Add / Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              {editingId ? "Edit Tax Setting" : "Add Tax Setting"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tax Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tax Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, code: e.target.value }))
                  }
                  placeholder="e.g. GST, VAT, HST"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a unique tax code identifier (e.g., GST, VAT, Sales Tax)
              </p>
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tax Rate (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, rate: e.target.value }))
                  }
                  placeholder="e.g. 10"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the tax rate as a percentage (0-100)
              </p>
            </div>

            {/* Is Default */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, is_default: e.target.checked }))
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-gray-900">
                      Set as Default Tax
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This tax will be automatically applied to new invoices
                  </p>
                </div>
              </label>
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
        </DialogContent>
      </Dialog>

      {/* Tax Settings Cards List */}
      {taxSettings.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Percent className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No tax settings configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Tax Setting
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxSettings.map((tax, index) => (
            <motion.div
              key={tax.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Percent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900">
                          {tax.code}
                        </h4>
                        {(tax.is_default === 1 || tax.is_default === true) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ID: {tax.id}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(tax)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(tax)}
                      disabled={deleteMutation.isPending && itemToDelete?.id === tax.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteMutation.isPending && itemToDelete?.id === tax.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 py-6 bg-white">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Tax Rate
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">
                      {tax.rate}
                    </span>
                    <span className="text-2xl font-semibold text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    This rate will be applied to taxable amounts on invoices
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}