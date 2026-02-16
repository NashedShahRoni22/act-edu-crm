"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit2,
  Trash2,
  Loader2,
  Workflow as WorkflowIcon,
  Eye,
  Trophy,
  Calendar,
  FileText,
  ClipboardList,
  Users,
  X,
  Check,
  Plus,
  GripVertical,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

const emptyStage = {
  name: "",
  is_win_stage: false,
  require_partner_client_id: false,
  add_start_and_end_date: false,
  add_note: false,
  add_application_intake_field: false,
};

export default function WorkflowCard({ workflow, index, onDelete, isDeleting }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    access_type: "all",
    selected_offices: [],
    stages: [{ ...emptyStage }],
  });

  // Fetch detailed workflow data
  const { data: detailData, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/workflows/${workflow.id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && isDialogOpen,
  });

  const workflowDetails = detailData?.data || workflow;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(`/workflows/${workflow.id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Workflow updated successfully");
        setIsEditMode(false);
        queryClient.invalidateQueries({ queryKey: ["/workflows"] });
        queryClient.invalidateQueries({ queryKey: [`/workflows/${workflow.id}`] });
      } else {
        toast.error(res.message || "Failed to update workflow");
      }
    },
    onError: () => toast.error("Failed to update workflow"),
  });

  const handleViewDetails = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    if (detailData?.data) {
      // Populate form with existing data
      setFormData({
        name: workflowDetails.name,
        access_type: workflowDetails.access_type,
        selected_offices: workflowDetails.selected_offices || [],
        stages: workflowDetails.stages.map((stage) => ({
          id: stage.id,
          name: stage.name,
          is_win_stage: stage.is_win_stage === 1 || stage.is_win_stage === true,
          require_partner_client_id: stage.require_partner_client_id === 1 || stage.require_partner_client_id === true,
          add_start_and_end_date: stage.add_start_and_end_date === 1 || stage.add_start_and_end_date === true,
          add_note: stage.add_note === 1 || stage.add_note === true,
          add_application_intake_field: stage.add_application_intake_field === 1 || stage.add_application_intake_field === true,
        })),
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

  // Add new stage
  const addStage = () => {
    setFormData((prev) => ({
      ...prev,
      stages: [...prev.stages, { ...emptyStage }],
    }));
  };

  // Remove stage
  const removeStage = (index) => {
    if (formData.stages.length === 1) {
      toast.error("Workflow must have at least one stage");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index),
    }));
  };

  // Update stage field
  const updateStage = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) =>
        i === index ? { ...stage, [field]: value } : stage
      ),
    }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    if (formData.stages.length === 0) {
      toast.error("Add at least one stage");
      return;
    }

    const invalidStage = formData.stages.find((stage) => !stage.name.trim());
    if (invalidStage) {
      toast.error("All stages must have a name");
      return;
    }

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("name", formData.name.trim());
    fd.append("access_type", formData.access_type);

    if (formData.access_type === "selected" && formData.selected_offices.length > 0) {
      formData.selected_offices.forEach((office) => {
        fd.append("selected_offices[]", office);
      });
    }

    formData.stages.forEach((stage, index) => {
      if (stage.id) fd.append(`stages[${index}][id]`, stage.id);
      fd.append(`stages[${index}][name]`, stage.name.trim());
      fd.append(`stages[${index}][is_win_stage]`, stage.is_win_stage ? "1" : "0");
      fd.append(`stages[${index}][require_partner_client_id]`, stage.require_partner_client_id ? "1" : "0");
      fd.append(`stages[${index}][add_start_and_end_date]`, stage.add_start_and_end_date ? "1" : "0");
      fd.append(`stages[${index}][add_note]`, stage.add_note ? "1" : "0");
      fd.append(`stages[${index}][add_application_intake_field]`, stage.add_application_intake_field ? "1" : "0");
    });

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
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <WorkflowIcon className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {workflow.name}
              </h4>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-xs text-gray-500">
                  {workflow.stages?.length || 0} stages
                </p>
                <span className="text-xs text-gray-300">•</span>
                <p className="text-xs text-gray-500">
                  {workflow.total_partners} partners
                </p>
                <span className="text-xs text-gray-300">•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    workflow.status === "Active"
                      ? "bg-success/10 text-success"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {workflow.status}
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
              onClick={handleViewDetails}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(workflow.id, workflow.name)}
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
        <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WorkflowIcon className="w-5 h-5 text-primary" />
              {isEditMode ? "Edit Workflow" : "Workflow Details"}
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isEditMode ? (
            // Edit Form
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Workflow Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workflow Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Student Visa Application"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Access Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.access_type === "all"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_type"
                      value="all"
                      checked={formData.access_type === "all"}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, access_type: e.target.value }))
                      }
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          All Offices
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Available to all offices
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.access_type === "selected"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_type"
                      value="selected"
                      checked={formData.access_type === "selected"}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, access_type: e.target.value }))
                      }
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Selected Offices
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose specific offices
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Stages Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Workflow Stages <span className="text-red-500">*</span>
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addStage}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Stage
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {formData.stages.map((stage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-2">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex-1 space-y-3">
                          {/* Stage Name */}
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {index + 1}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) =>
                                updateStage(index, "name", e.target.value)
                              }
                              placeholder="Stage name"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                          </div>

                          {/* Stage Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-11">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={stage.is_win_stage}
                                onChange={(e) =>
                                  updateStage(index, "is_win_stage", e.target.checked)
                                }
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/50"
                              />
                              <Trophy className="w-4 h-4 text-gray-500" />
                              <span>Win Stage</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={stage.require_partner_client_id}
                                onChange={(e) =>
                                  updateStage(
                                    index,
                                    "require_partner_client_id",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/50"
                              />
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>Require Partner/Client</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={stage.add_start_and_end_date}
                                onChange={(e) =>
                                  updateStage(
                                    index,
                                    "add_start_and_end_date",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/50"
                              />
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>Add Dates</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={stage.add_note}
                                onChange={(e) =>
                                  updateStage(index, "add_note", e.target.checked)
                                }
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/50"
                              />
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span>Add Note</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={stage.add_application_intake_field}
                                onChange={(e) =>
                                  updateStage(
                                    index,
                                    "add_application_intake_field",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/50"
                              />
                              <ClipboardList className="w-4 h-4 text-gray-500" />
                              <span>Add Intake Field</span>
                            </label>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeStage(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
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
              {/* Workflow Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Workflow Name</label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{workflowDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Access Type</label>
                  <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{workflowDetails.access_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        workflowDetails.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {workflowDetails.status}
                    </span>
                  </p>
                </div>
                {workflowDetails.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {new Date(workflowDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Stages */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-semibold text-gray-700">
                    Workflow Stages ({workflowDetails.stages?.length || 0})
                  </h5>
                  <button
                    onClick={() => {
                      setFormData({
                        name: workflowDetails.name,
                        access_type: workflowDetails.access_type,
                        selected_offices: workflowDetails.selected_offices || [],
                        stages: workflowDetails.stages.map((stage) => ({
                          id: stage.id,
                          name: stage.name,
                          is_win_stage: stage.is_win_stage === 1 || stage.is_win_stage === true,
                          require_partner_client_id: stage.require_partner_client_id === 1 || stage.require_partner_client_id === true,
                          add_start_and_end_date: stage.add_start_and_end_date === 1 || stage.add_start_and_end_date === true,
                          add_note: stage.add_note === 1 || stage.add_note === true,
                          add_application_intake_field: stage.add_application_intake_field === 1 || stage.add_application_intake_field === true,
                        })),
                      });
                      setIsEditMode(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Workflow
                  </button>
                </div>
                <div className="space-y-3">
                  {workflowDetails.stages?.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h6 className="text-sm font-medium text-gray-900 mb-2">
                          {stage.name}
                        </h6>
                        <div className="flex flex-wrap gap-2">
                          {stage.is_win_stage && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded text-xs font-medium">
                              <Trophy className="w-3 h-3" />
                              Win Stage
                            </span>
                          )}
                          {stage.require_partner_client_id === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              <Users className="w-3 h-3" />
                              Partner/Client
                            </span>
                          )}
                          {stage.add_start_and_end_date === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              <Calendar className="w-3 h-3" />
                              Dates
                            </span>
                          )}
                          {stage.add_note === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <FileText className="w-3 h-3" />
                              Notes
                            </span>
                          )}
                          {stage.add_application_intake_field === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                              <ClipboardList className="w-3 h-3" />
                              Intake Field
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}