"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm = {
  module: "",
  section_id: "",
  name: "",
  type: "text",
  allow_multiple: false,
  is_mandatory: false,
  show_on_list_view: false,
  status: false,
};

const MODULES = ["client", "partner", "agent", "product", "application"];
const FIELD_TYPES = ["text", "file", "date", "number"];

export default function CustomFieldsDialog({
  open,
  onOpenChange,
  onSuccess,
}) {
  const { accessToken } = useAppContext();
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Fetch sections
  const { data: sectionsData, isLoading: loadingSections } = useQuery({
    queryKey: [`/custom-fields/sections?module=${formData.module}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open && !!formData.module,
  });

  const sections = sectionsData?.data || [];

  // Mutation for creating custom field
  const createFieldMutation = useMutation({
    mutationFn: async () => {
      const formDataObj = new FormData();
      formDataObj.append("module", formData.module);
      formDataObj.append("section_id", formData.section_id);
      formDataObj.append("name", formData.name);
      formDataObj.append("type", formData.type);
      formDataObj.append("allow_multiple", formData.allow_multiple ? 1 : 0);
      formDataObj.append("is_mandatory", formData.is_mandatory ? 1 : 0);
      formDataObj.append(
        "show_on_list_view",
        formData.show_on_list_view ? 1 : 0
      );
      formDataObj.append("status", formData.status ? 1 : 0);

      const response = await postWithToken(
        "/custom-fields",
        formDataObj,
        accessToken
      );

      if (!response.status || response.status !== "success") {
        throw new Error(response.message || "Failed to create custom field");
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Custom field created successfully");
      setFormData(emptyForm);
      setErrors({});
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create custom field");
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.module) newErrors.module = "Module is required";
    if (!formData.section_id) newErrors.section_id = "Section is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.type) newErrors.type = "Type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    createFieldMutation.mutate();
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setErrors({});
    onOpenChange(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>
            Create a new custom field for your modules
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="module">Module *</Label>
            <Select
              value={formData.module}
              onValueChange={(value) => handleInputChange("module", value)}
            >
              <SelectTrigger className={`w-full ${errors.module ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((mod) => (
                  <SelectItem key={mod} value={mod}>
                    {mod.charAt(0).toUpperCase() + mod.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.module && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.module}
              </p>
            )}
          </motion.div>

          {/* Section Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="section">Section *</Label>
            <Select
              value={formData.section_id}
              onValueChange={(value) => handleInputChange("section_id", value)}
              disabled={!formData.module}
            >
              <SelectTrigger className={`w-full ${errors.section_id ? "border-red-500" : ""}`}>
                <SelectValue placeholder={formData.module ? "Select a section" : "Select a module first"} />
              </SelectTrigger>
              <SelectContent>
                {loadingSections ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : sections.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No sections available
                  </div>
                ) : (
                  sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.section_id && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.section_id}
              </p>
            )}
          </motion.div>

          {/* Field Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-2"
          >
            <Label htmlFor="name">Field Name *</Label>
            <Input
              id="name"
              placeholder="e.g., What is your future goal?"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </motion.div>

          {/* Field Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="type">Field Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger className={`w-full ${errors.type ? "border-red-500" : ""}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((fieldType) => (
                  <SelectItem key={fieldType} value={fieldType}>
                    {fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.type}
              </p>
            )}
          </motion.div>

          {/* Checkboxes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_multiple}
                onChange={(e) =>
                  handleInputChange("allow_multiple", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Allow Multiple
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) =>
                  handleInputChange("is_mandatory", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Mandatory
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_on_list_view}
                onChange={(e) =>
                  handleInputChange("show_on_list_view", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Show on List View
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => handleInputChange("status", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Active
              </span>
            </label>
          </motion.div>

          {/* Buttons */}
          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createFieldMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createFieldMutation.isPending}
              className="gap-2 text-white"
            >
              {createFieldMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Create Field
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
