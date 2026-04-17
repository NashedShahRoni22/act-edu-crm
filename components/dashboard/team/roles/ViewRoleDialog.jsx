"use client";

import { motion } from "framer-motion";
import { Shield, Check, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const formatPermissionName = (name) =>
  name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function ViewRoleDialog({
  open,
  onOpenChange,
  role,          // full role object with assigned_permissions[] (array of strings)
  groupedPermissions,
  onEdit,        // (role) => void
}) {
  if (!role) return null;

  // Handle assigned_permissions (array of strings from GET /roles/:id)
  const rolePermissionNames = role.assigned_permissions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {role.name}
          </DialogTitle>
          <DialogDescription>{role.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.keys(groupedPermissions).map((groupName) => {
            const groupPerms = groupedPermissions[groupName].filter((p) =>
              rolePermissionNames.includes(p.name)
            );
            if (groupPerms.length === 0) return null;

            return (
              <div key={groupName}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{groupName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {groupPerms.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-900">
                        {formatPermissionName(permission.name)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {rolePermissionNames.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">
              No permissions assigned to this role
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onOpenChange(false);
              onEdit(role);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Role
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}