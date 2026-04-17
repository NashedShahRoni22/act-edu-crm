"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckSquare, Check, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postWithToken } from "@/helpers/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PermissionsAccordion from "./Permissionsaccordion";

const emptyForm = { name: "", description: "", permissions: [] };

export default function RoleFormDialog({
  open,
  onOpenChange,
  editingRole, // full role object with assigned_permissions[] (array of strings)
  groupedPermissions,
  accessToken,
  onSuccess,
}) {
  const queryClient = useQueryClient();

  // Derive form state from editingRole prop (reset whenever it changes)
  const [formData, setFormData] = useState(emptyForm);
  const [prevRole, setPrevRole] = useState(null);

  // Sync formData when editingRole changes (avoids useEffect + stale closure)
  if (editingRole !== prevRole) {
    setPrevRole(editingRole);
    setFormData(
      editingRole
        ? {
            name: editingRole.name || "",
            description: editingRole.description || "",
            // Handle assigned_permissions (array of strings from GET /roles/:id)
            permissions: editingRole.assigned_permissions || [],
          }
        : emptyForm
    );
  }

  const createMutation = useMutation({
    mutationFn: (fd) => postWithToken("/roles", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Role created successfully");
        queryClient.invalidateQueries({ queryKey: ["/roles"] });
        onSuccess();
      } else {
        toast.error(res.message || "Failed to create role");
      }
    },
    onError: () => toast.error("Failed to create role"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => postWithToken(`/roles/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Role updated successfully");
        queryClient.invalidateQueries({ queryKey: ["/roles"] });
        onSuccess();
      } else {
        toast.error(res.message || "Failed to update role");
      }
    },
    onError: () => toast.error("Failed to update role"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Role name is required");
    if (!formData.description.trim()) return toast.error("Description is required");

    const fd = new FormData();
    if (editingRole) fd.append("_method", "PUT");
    fd.append("name", formData.name.trim());
    fd.append("description", formData.description.trim());
    formData.permissions.forEach((p, i) => fd.append(`permissions[${i}]`, p));

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData(emptyForm);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
          <DialogDescription>
            {editingRole
              ? "Update the role information and permissions."
              : "Create a new role and assign permissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Accountant"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Financial Controller for the agency"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                required
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Permissions
              </h3>
              <span className="text-xs text-gray-500">
                {formData.permissions.length} selected
              </span>
            </div>

            <PermissionsAccordion
              groupedPermissions={groupedPermissions}
              selectedPermissions={formData.permissions}
              onChange={(permissions) => setFormData((p) => ({ ...p, permissions }))}
            />
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={handleClose}
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
                  {editingRole ? "Save Changes" : "Create Role"}
                </>
              )}
            </motion.button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}