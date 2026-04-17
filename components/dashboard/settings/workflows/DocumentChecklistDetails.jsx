"use client";

import { useAppContext } from "@/context/context";
import { postWithToken } from "@/helpers/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  List,
  Check,
  Upload,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

function DocumentChecklistDetailsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 2 }).map((_, jdx) => (
                <div key={jdx} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-3 w-32 bg-gray-100 rounded" />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <div className="w-8 h-8 rounded bg-gray-200" />
                      <div className="w-8 h-8 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DocumentChecklistDetails({
  selectedWorkflow,
  stages,
  isLoading,
  onBack,
  onAddChecklist,
  onEditChecklist,
  documentTypes,
  showAddDialog,
  setShowAddDialog,
  editingChecklist,
  setEditingChecklist,
  formData,
  setFormData,
  isPending,
  handleSubmit,
  handleCloseDialog,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/document-checklists/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Checklist item deleted successfully");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        queryClient.invalidateQueries({
          queryKey: [`/document-checklists/${selectedWorkflow?.id}`, accessToken],
        });
        queryClient.invalidateQueries({
          queryKey: ["/document-checklists?checklist_available=0", accessToken],
        });
        queryClient.invalidateQueries({
          queryKey: ["/document-checklists?checklist_available=1", accessToken],
        });
      } else {
        toast.error(res.message || "Failed to delete checklist item");
      }
    },
    onError: () => toast.error("Failed to delete checklist item"),
  });

  const handleDeleteClick = (checklist) => {
    setItemToDelete(checklist);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?.id) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  if (isLoading) {
    return <DocumentChecklistDetailsSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Checklist Item"
        description="Are you sure you want to delete this checklist item? This action cannot be undone."
        itemName={itemToDelete?.document_type_name}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedWorkflow.name}
            </h2>
            <p className="text-sm text-gray-500">
              Manage document checklists for this workflow
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddChecklist}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Checklist Item
        </motion.button>
      </div>

      {/* Stages & Checklists */}
      {stages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <List className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No stages found for this workflow</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => {
            const stageChecklists = stage.checklists || [];

            return (
              <div
                key={stage.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Stage Header */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{stage.name}</h3>
                  <span className="text-xs text-gray-400">
                    {stageChecklists.length} item{stageChecklists.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Checklist Items */}
                <div className="divide-y divide-gray-100">
                  {stageChecklists.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400 italic">
                      No checklist items yet — click &quot;Add Checklist Item&quot; to add one.
                    </div>
                  ) : (
                    stageChecklists.map((checklist, index) => (
                      <motion.div
                        key={checklist.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {/* Title + Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-medium text-gray-900">
                                {checklist.document_type_name}
                              </h4>
                              {checklist.is_mandatory && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                  Mandatory
                                </span>
                              )}
                              {checklist.allow_client_upload && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  Client Upload
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600">{checklist.description}</p>

                            {/* Apply To */}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {checklist.apply_to === "all" ? (
                                <>
                                  <Users className="w-3 h-3" />
                                  <span>All Partners</span>
                                </>
                              ) : (
                                <>
                                  <Building2 className="w-3 h-3" />
                                  <span>Selected Partners</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onEditChecklist(checklist, stage.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteClick(checklist)}
                              disabled={deleteMutation.isPending && itemToDelete?.id === checklist.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deleteMutation.isPending && itemToDelete?.id === checklist.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Checklist Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChecklist ? "Edit Checklist Item" : "Add Checklist Item"}
            </DialogTitle>
            <DialogDescription>
              Configure the document checklist requirements for this workflow stage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Workflow Stage — only for create */}
            {!editingChecklist && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Stage <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.workflow_stage_id}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, workflow_stage_id: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="">Select a stage</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.document_type_id}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, document_type_id: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              >
                <option value="">Select a document type</option>
                {documentTypes.map((docType) => (
                  <option key={docType.id} value={docType.id}>
                    {docType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                placeholder="Describe the document requirements..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                required
              />
            </div>

            {/* Apply To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apply To <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.apply_to === "all"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="apply_to"
                    value="all"
                    checked={formData.apply_to === "all"}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, apply_to: e.target.value }))
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">All Partners</span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.apply_to === "selected"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="apply_to"
                    value="selected"
                    checked={formData.apply_to === "selected"}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, apply_to: e.target.value }))
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Selected Partners</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_client_upload}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, allow_client_upload: e.target.checked }))
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Allow Client Upload</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Clients can upload this document themselves
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_mandatory}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, is_mandatory: e.target.checked }))
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Mandatory Document</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This document is required to proceed
                  </p>
                </div>
              </label>
            </div>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingChecklist ? "Save Changes" : "Create Checklist"}
                  </>
                )}
              </motion.button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
