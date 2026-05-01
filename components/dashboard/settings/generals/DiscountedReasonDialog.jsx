"use client";

import { useAppContext } from "@/context/context";
import { postWithToken } from "@/helpers/api";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DiscountedReasonDialog({
  open,
  onOpenChange,
  onSuccess,
  editingReason = null,
}) {
  const { accessToken } = useAppContext();
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingReason) {
      setReason(editingReason.reason || "");
    } else {
      setReason("");
    }
    setErrors({});
  }, [editingReason, open]);

  // Mutation for creating or updating reason
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formDataObj = new FormData();

      if (editingReason) {
        formDataObj.append("_method", "PUT");
        formDataObj.append("reason", reason);

        const response = await postWithToken(
          `/discontinued-reasons/${editingReason.id}`,
          formDataObj,
          accessToken
        );

        if (!response.status || response.status !== "success") {
          throw new Error(response.message || "Failed to update reason");
        }

        return response;
      } else {
        formDataObj.append("reason", reason);

        const response = await postWithToken(
          "/discontinued-reasons",
          formDataObj,
          accessToken
        );

        if (!response.status || response.status !== "success") {
          throw new Error(response.message || "Failed to create reason");
        }

        return response;
      }
    },
    onSuccess: () => {
      toast.success(
        editingReason
          ? "Reason updated successfully"
          : "Reason created successfully"
      );
      setReason("");
      setErrors({});
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save reason");
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!reason.trim()) newErrors.reason = "Reason is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    saveMutation.mutate();
  };

  const handleClose = () => {
    setReason("");
    setErrors({});
    onOpenChange(false);
  };

  const handleInputChange = (value) => {
    setReason(value);
    // Clear error
    if (errors.reason) {
      setErrors((prev) => ({
        ...prev,
        reason: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingReason ? "Edit Reason" : "Add New Reason"}
          </DialogTitle>
          <DialogDescription>
            {editingReason
              ? "Update the discontinued reason"
              : "Create a new discontinued reason"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              placeholder="e.g., Error by Team Member"
              value={reason}
              onChange={(e) => handleInputChange(e.target.value)}
              className={errors.reason ? "border-red-500" : ""}
            />
            {errors.reason && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.reason}
              </p>
            )}
          </motion.div>

          {/* Buttons */}
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="gap-2 text-white"
            >
              {saveMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingReason ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
