"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
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
  master_category_id: "",
  select_type: "product_type",
  name: "",
};

const TYPE_OPTIONS = [
  { value: "product_type", label: "Product Type" },
  { value: "partner_type", label: "Partner Type" },
];

export default function ProductPartnerTypeDialog({
  open,
  onOpenChange,
  onSuccess,
}) {
  const { accessToken } = useAppContext();
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Fetch master categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["/partners/master-categories", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open,
  });

  const categories = categoriesData?.data || [];

  // Mutation for creating type
  const createTypeMutation = useMutation({
    mutationFn: async () => {
      const formDataObj = new FormData();
      formDataObj.append("master_category_id", formData.master_category_id);
      formDataObj.append("select_type", formData.select_type);
      formDataObj.append("name", formData.name);

      const response = await postWithToken(
        "/settings/types",
        formDataObj,
        accessToken
      );

      if (!response.status || response.status !== "success") {
        throw new Error(response.message || "Failed to create type");
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Type created successfully");
      setFormData(emptyForm);
      setErrors({});
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create type");
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.master_category_id) newErrors.master_category_id = "Category is required";
    if (!formData.select_type) newErrors.select_type = "Type is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    createTypeMutation.mutate();
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Type</DialogTitle>
          <DialogDescription>
            Create a new product or partner type
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Master Category */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="category">Master Category *</Label>
            <Select
              value={formData.master_category_id}
              onValueChange={(value) =>
                handleInputChange("master_category_id", value)
              }
            >
              <SelectTrigger
                className={`w-full ${
                  errors.master_category_id ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No categories available
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.master_category_id && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.master_category_id}
              </p>
            )}
          </motion.div>

          {/* Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-2"
          >
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.select_type}
              onValueChange={(value) => handleInputChange("select_type", value)}
            >
              <SelectTrigger
                className={`w-full ${errors.select_type ? "border-red-500" : ""}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.select_type && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.select_type}
              </p>
            )}
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Short Course"
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

          {/* Buttons */}
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTypeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTypeMutation.isPending}
              className="gap-2 text-white"
            >
              {createTypeMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
