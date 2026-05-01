"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DiscountedReasonDialog from "./DiscountedReasonDialog";
import DiscountedReasonSkeleton from "./DiscountedReasonSkeleton";

export default function DiscountedReason() {
  const { accessToken } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [reasonToDelete, setReasonToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch discontinued reasons
  const { data: reasonsData, isLoading } = useQuery({
    queryKey: ["/discontinued-reasons", accessToken, refreshKey],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const reasons = reasonsData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const formDataObj = new FormData();
      formDataObj.append("_method", "DELETE");

      const response = await postWithToken(
        `/discontinued-reasons/${id}`,
        formDataObj,
        accessToken,
      );

      if (!response.status || response.status !== "success") {
        throw new Error(response.message || "Failed to delete reason");
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Reason deleted successfully");
      setReasonToDelete(null);
      setDeleteDialogOpen(false);
      setRefreshKey((prev) => prev + 1);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete reason");
    },
  });

  const handleSuccess = () => {
    setEditingReason(null);
    setDialogOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (reason) => {
    setEditingReason(reason);
    setDialogOpen(true);
  };

  const handleDeleteClick = (reason) => {
    setReasonToDelete(reason);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (reasonToDelete) {
      deleteMutation.mutate(reasonToDelete.id);
    }
  };

  const handleAddNew = () => {
    setEditingReason(null);
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header with Button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            Discontinued Reasons
          </h4>
          <p className="text-gray-600 text-sm mt-1">
            Manage reasons for application discontinuation
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 text-white">
          <Plus className="w-4 h-4" />
          Add Reason
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <DiscountedReasonSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          {reasons.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 font-medium">No reasons yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Create your first discontinued reason
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reasons.map((reason, index) => (
                    <motion.tr
                      key={reason.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {reason.reason}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reason)}
                            className="gap-1 cursor-pointer size-10 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(reason)}
                            className="gap-1 cursor-pointer size-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Dialog */}
      <DiscountedReasonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
        editingReason={editingReason}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Reason?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{reasonToDelete?.reason}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="gap-2 text-white bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
