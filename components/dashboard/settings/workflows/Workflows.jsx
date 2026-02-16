"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Workflow as WorkflowIcon,
  X,
  Check,
  GripVertical,
  Users,
  Building2,
  Trophy,
  Calendar,
  FileText,
  ClipboardList,
} from "lucide-react";
import { toast } from "react-hot-toast";
import WorkflowCard from "./WorkflowCard";

const emptyStage = {
  name: "",
  is_win_stage: false,
  require_partner_client_id: false,
  add_start_and_end_date: false,
  add_note: false,
  add_application_intake_field: false,
};

const emptyForm = {
  name: "",
  access_type: "all",
  selected_offices: [],
  stages: [{ ...emptyStage }],
};

export default function Workflows() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // Fetch list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/workflows", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const workflows = data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/workflows", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Workflow created successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/workflows"] });
      } else {
        toast.error(res.message || "Failed to create workflow");
      }
    },
    onError: () => toast.error("Failed to create workflow"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/workflows/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Workflow deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/workflows"] });
      } else {
        toast.error(res.message || "Failed to delete workflow");
      }
    },
    onError: () => toast.error("Failed to delete workflow"),
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

    // Validate all stages have names
    const invalidStage = formData.stages.find((stage) => !stage.name.trim());
    if (invalidStage) {
      toast.error("All stages must have a name");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("access_type", formData.access_type);

    // Add selected offices if access_type is selected
    if (formData.access_type === "selected" && formData.selected_offices.length > 0) {
      formData.selected_offices.forEach((office) => {
        fd.append("selected_offices[]", office);
      });
    }

    // Add stages
    formData.stages.forEach((stage, index) => {
      fd.append(`stages[${index}][name]`, stage.name.trim());
      fd.append(`stages[${index}][is_win_stage]`, stage.is_win_stage ? "1" : "0");
      fd.append(`stages[${index}][require_partner_client_id]`, stage.require_partner_client_id ? "1" : "0");
      fd.append(`stages[${index}][add_start_and_end_date]`, stage.add_start_and_end_date ? "1" : "0");
      fd.append(`stages[${index}][add_note]`, stage.add_note ? "1" : "0");
      fd.append(`stages[${index}][add_application_intake_field]`, stage.add_application_intake_field ? "1" : "0");
    });

    createMutation.mutate(fd);
  };

  // Handle delete
  const handleDelete = (id, name) => {
    if (window.confirm(`Delete workflow "${name}"? This action cannot be undone.`)) {
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
          <p className="text-sm text-red-800">Failed to load workflows</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 bg-white rounded-lg border border-border "
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Workflows</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your application workflows and stages
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
            Add Workflow
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
                <WorkflowIcon className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-gray-900">Add Workflow</h3>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                      Create Workflow
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflows List */}
      {workflows.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <WorkflowIcon className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No workflows configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Workflow
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
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