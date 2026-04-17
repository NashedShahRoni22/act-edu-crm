"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Loader2, Shield, Search, Eye, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import RoleFormDialog from "../team/roles/RoleFormDialog";
import ViewRoleDialog from "../team/roles/ViewRoleDialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

function RolesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-pulse">
        <div className="min-w-0">
          <div className="h-6 w-56 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full max-w-80 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-full sm:w-32 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-10 w-full max-w-md bg-gray-100 rounded-lg" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left"><div className="h-3 w-20 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-left"><div className="h-3 w-24 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-left"><div className="h-3 w-24 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-right"><div className="h-3 w-16 bg-gray-200 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-16 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-56 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-24 bg-gray-100 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-9 h-9 rounded-lg bg-gray-200" />
                      <div className="w-9 h-9 rounded-lg bg-gray-200" />
                      <div className="w-9 h-9 rounded-lg bg-gray-200" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Roles() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);

  // Fetch roles list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/roles", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const roles = data?.data || [];

  // Fetch grouped permissions
  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ["/permissions/grouped", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const groupedPermissions = permissionsData?.data || {};

  // Filtered rows
  const filteredRoles = roles.filter(
    (role) =>
      role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return postWithToken(`/roles/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      setDeletingId(null);
      if (res.status === "success") {
        toast.success(res.message || "Role deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/roles"] });
      } else {
        toast.error(res.message || "Failed to delete role");
      }
    },
    onError: () => {
      setDeletingId(null);
      toast.error("Failed to delete role");
    },
  });

  // Handlers
  const handleAdd = () => {
    setEditingRole(null);
    setShowFormDialog(true);
  };

  const handleEdit = async (role) => {
    setEditLoadingId(role.id);
    try {
      const res = await fetchWithToken({ queryKey: [`/roles/${role.id}`, accessToken] });
      if (res?.data) {
        setEditingRole(res.data);
        setShowFormDialog(true);
      }
    } catch {
      toast.error("Failed to load role details");
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleView = async (role) => {
    setViewLoadingId(role.id);
    try {
      const res = await fetchWithToken({ queryKey: [`/roles/${role.id}`, accessToken] });
      if (res?.data) {
        setViewingRole(res.data);
        setShowViewDialog(true);
      }
    } catch {
      toast.error("Failed to load role details");
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleDelete = (id, name) => {
    setItemToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?.id) {
      setDeletingId(itemToDelete.id);
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  // Loading / Error states
  if (isLoading || loadingPermissions) {
    return <RolesSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load roles</p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setItemToDelete(null);
        }}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        itemName={itemToDelete?.name}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage roles and their associated permissions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </motion.button>
      </div>

      {/* Search */}
      {roles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {roles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Shield className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No roles configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Role
          </motion.button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No roles found matching &quot;{searchQuery}&quot;
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, index) => (
                    <motion.tr
                      key={role.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{role.name}</p>
                            <p className="text-xs text-gray-500">ID: {role.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>
                      </td>

                      {/* Permissions count */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" />
                          {role.no_of_permissions ?? 0} permissions
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleView(role)}
                            disabled={viewLoadingId === role.id}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            {viewLoadingId === role.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(role)}
                            disabled={editLoadingId === role.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            {editLoadingId === role.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Edit2 className="w-4 h-4" />
                            )}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(role.id, role.name)}
                            disabled={deletingId === role.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === role.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredRoles.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredRoles.length}</span> of{" "}
                <span className="font-medium">{roles.length}</span> roles
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <RoleFormDialog
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) setEditingRole(null);
        }}
        editingRole={editingRole}
        groupedPermissions={groupedPermissions}
        accessToken={accessToken}
        onSuccess={() => {
          setShowFormDialog(false);
          setEditingRole(null);
        }}
      />

      {/* View Dialog */}
      <ViewRoleDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        role={viewingRole}
        groupedPermissions={groupedPermissions}
        onEdit={handleEdit}
      />
    </motion.div>
  );
}