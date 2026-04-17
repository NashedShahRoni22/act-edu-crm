"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Loader2,
  FileCheck,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DocumentChecklistDetails from "./DocumentChecklistDetails";

function DocumentChecklistListSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DocumentChecklist() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddWorkflowDialog, setShowAddWorkflowDialog] = useState(false);
  const [selectedWorkflowToMark, setSelectedWorkflowToMark] = useState("");
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [formData, setFormData] = useState({
    workflow_stage_id: "",
    document_type_id: "",
    description: "",
    apply_to: "all",
    selected_partners: [],
    allow_client_upload: false,
    is_mandatory: false,
  });

  // Workflows that already have checklists — shown on the main list (checklist_available=0)
  const { data: unavailableWorkflowsData, isLoading: loadingChecklisted } = useQuery({
    queryKey: ["/document-checklists?checklist_available=0", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const unavailableWorkflows = unavailableWorkflowsData?.data || [];

  // Workflows without checklists yet — shown in the "Add Checklist" modal dropdown (checklist_available=1)
  const { data: availableData, isLoading: loadingAvailable } = useQuery({
    queryKey: ["/document-checklists?checklist_available=1", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const availableWorkflows = availableData?.data || [];

  // Fetch document types
  const { data: docTypesData } = useQuery({
    queryKey: ["/document-types", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const documentTypes = docTypesData?.data || [];

  // Fetch selected workflow details — { id, name, stages: [{ id, name, order, checklists: [...] }] }
  const { data: workflowDetailsData, isLoading: loadingDetails } = useQuery({
    queryKey: [`/document-checklists/${selectedWorkflow?.id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!selectedWorkflow?.id,
  });

  const workflowDetails = workflowDetailsData?.data;
  const stages = workflowDetails?.stages || [];

  const invalidateWorkflowLists = () => {
    queryClient.invalidateQueries({
      queryKey: ["/document-checklists?checklist_available=0", accessToken],
    });
    queryClient.invalidateQueries({
      queryKey: ["/document-checklists?checklist_available=1", accessToken],
    });
  };

  const invalidateWorkflowDetails = () => {
    queryClient.invalidateQueries({
      queryKey: [`/document-checklists/${selectedWorkflow?.id}`, accessToken],
    });
  };

  // Mark workflow as checklisted
  const markChecklistedMutation = useMutation({
    mutationFn: async (workflowId) => {
      const fd = new FormData();
      fd.append("workflow_id", workflowId);
      return await postWithToken(
        "/document-checklists/mark-workflow-as-checklisted",
        fd,
        accessToken
      );
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Workflow marked as checklisted");
        invalidateWorkflowLists();
        setShowAddWorkflowDialog(false);
        setSelectedWorkflowToMark("");
      } else {
        toast.error(res.message || "Failed to mark workflow");
      }
    },
    onError: () => toast.error("Failed to mark workflow as checklisted"),
  });

  // Create checklist item
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/document-checklists", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Checklist item created successfully");
        handleCloseDialog();
        invalidateWorkflowDetails();
        invalidateWorkflowLists();
      } else {
        toast.error(res.message || "Failed to create checklist item");
      }
    },
    onError: () => toast.error("Failed to create checklist item"),
  });

  // Update checklist item
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/document-checklists/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Checklist item updated successfully");
        handleCloseDialog();
        invalidateWorkflowDetails();
        invalidateWorkflowLists();
      } else {
        toast.error(res.message || "Failed to update checklist item");
      }
    },
    onError: () => toast.error("Failed to update checklist item"),
  });

  // Delete checklist item
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/document-checklists/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Checklist item deleted successfully");
        invalidateWorkflowDetails();
        invalidateWorkflowLists();
      } else {
        toast.error(res.message || "Failed to delete checklist item");
      }
    },
    onError: () => toast.error("Failed to delete checklist item"),
  });

  const handleSelectWorkflow = (workflow) => setSelectedWorkflow(workflow);
  const handleBackToList = () => setSelectedWorkflow(null);

  const handleAddChecklist = () => {
    setFormData({
      workflow_stage_id: "",
      document_type_id: "",
      description: "",
      apply_to: "all",
      selected_partners: [],
      allow_client_upload: false,
      is_mandatory: false,
    });
    setEditingChecklist(null);
    setShowAddDialog(true);
  };

  const handleEditChecklist = (checklist, stageId) => {
    setFormData({
      workflow_stage_id: stageId || "",
      document_type_id: checklist.document_type_id || "",
      description: checklist.description || "",
      apply_to: checklist.apply_to || "all",
      selected_partners: checklist.selected_partners || [],
      allow_client_upload: !!checklist.allow_client_upload,
      is_mandatory: !!checklist.is_mandatory,
    });
    setEditingChecklist(checklist);
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingChecklist(null);
    setFormData({
      workflow_stage_id: "",
      document_type_id: "",
      description: "",
      apply_to: "all",
      selected_partners: [],
      allow_client_upload: false,
      is_mandatory: false,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingChecklist && !formData.workflow_stage_id) {
      toast.error("Please select a workflow stage");
      return;
    }
    if (!formData.document_type_id) {
      toast.error("Please select a document type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const fd = new FormData();
    if (editingChecklist) {
      fd.append("_method", "PUT");
    } else {
      fd.append("workflow_id", selectedWorkflow.id);
      fd.append("workflow_stage_id", formData.workflow_stage_id);
    }

    fd.append("document_type_id", formData.document_type_id);
    fd.append("description", formData.description.trim());
    fd.append("apply_to", formData.apply_to);
    fd.append("allow_client_upload", formData.allow_client_upload ? "1" : "0");
    fd.append("is_mandatory", formData.is_mandatory ? "1" : "0");

    if (formData.apply_to === "selected" && formData.selected_partners.length > 0) {
      formData.selected_partners.forEach((partner) => {
        fd.append("selected_partners[]", partner);
      });
    }

    if (editingChecklist) {
      updateMutation.mutate({ id: editingChecklist.id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const handleDelete = (id) => {
    // Handled in DocumentChecklistDetails component
  };

  const handleMarkNewWorkflow = () => {
    if (!selectedWorkflowToMark) {
      toast.error("Please select a workflow");
      return;
    }
    markChecklistedMutation.mutate(selectedWorkflowToMark);
  };

  const isLoading = loadingChecklisted || loadingAvailable;
  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <DocumentChecklistListSkeleton />;
  }

  // ─── Workflow List View ───────────────────────────────────────────────────────
  if (!selectedWorkflow) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Document Checklists</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a workflow to manage its document checklists
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedWorkflowToMark("");
              setShowAddWorkflowDialog(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Checklist
          </motion.button>
        </div>

        {availableWorkflows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
            <FileCheck className="w-12 h-12 text-gray-300" />
            <p className="text-sm text-gray-500">No checklisted workflows yet</p>
            <p className="text-xs text-gray-400">Add a checklist to get started</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedWorkflowToMark("");
                setShowAddWorkflowDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Checklist
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectWorkflow(workflow)}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {workflow.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {workflow.total_partners} partners
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileCheck className="w-4 h-4 text-gray-400" />
                    <span>{workflow.total_checklist || 0} checklists</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === "Active"
                        ? "bg-success/10 text-success"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {workflow.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Workflow Checklist Dialog */}
        <Dialog open={showAddWorkflowDialog} onOpenChange={setShowAddWorkflowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Document Checklist</DialogTitle>
              <DialogDescription>
                Select a workflow to mark as checklisted and begin managing its document requirements.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow <span className="text-red-500">*</span>
                </label>
                {unavailableWorkflows.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>All workflows already have checklists assigned.</span>
                  </div>
                ) : (
                  <select
                    value={selectedWorkflowToMark}
                    onChange={(e) => setSelectedWorkflowToMark(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select a workflow</option>
                    {unavailableWorkflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddWorkflowDialog(false);
                  setSelectedWorkflowToMark("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkNewWorkflow}
                disabled={
                  markChecklistedMutation.isPending ||
                  !selectedWorkflowToMark ||
                  unavailableWorkflows.length === 0
                }
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markChecklistedMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Add Checklist
                  </>
                )}
              </motion.button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // ─── Checklist Detail View ────────────────────────────────────────────────────
  return (
    <DocumentChecklistDetails
      selectedWorkflow={selectedWorkflow}
      stages={stages}
      isLoading={loadingDetails}
      onBack={handleBackToList}
      onAddChecklist={handleAddChecklist}
      onEditChecklist={handleEditChecklist}
      documentTypes={documentTypes}
      showAddDialog={showAddDialog}
      setShowAddDialog={setShowAddDialog}
      editingChecklist={editingChecklist}
      setEditingChecklist={setEditingChecklist}
      formData={formData}
      setFormData={setFormData}
      isPending={isPending}
      handleSubmit={handleSubmit}
      handleCloseDialog={handleCloseDialog}
    />
  );
}