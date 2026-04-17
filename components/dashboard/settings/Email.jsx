"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmailRowsSkeleton from "./email/EmailRowsSkeleton";
import EmailRow from "./email/EmailRow";
import EmailForm from "./email/EmailForm";
import { EMPTY_FORM } from "./email/constants";
import { buildFormData } from "./email/helpers";

export default function Email() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/company-emails", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: userData } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const emails = data?.data || [];
  const users = userData?.data || [];

  const createMutation = useMutation({
    mutationFn: (fd) => postWithToken("/company-emails", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Email added successfully");
        setFormData(EMPTY_FORM);
        setShowAddDialog(false);
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
      } else {
        toast.error(res.message || "Failed to add email");
      }
    },
    onError: () => toast.error("Failed to add email"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return postWithToken(`/company-emails/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Email deleted successfully");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
      } else {
        toast.error(res.message || "Failed to delete email");
      }
    },
    onError: () => toast.error("Failed to delete email"),
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.email_id.trim()) {
      toast.error("Email address is required");
      return;
    }
    createMutation.mutate(buildFormData(formData, false));
  };

  const handleDelete = (id, emailId) => {
    setItemToDelete({ id, email_id: emailId });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?.id) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 bg-white rounded-lg">
        <div className="flex items-center justify-between animate-pulse">
          <div>
            <div className="h-6 w-44 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-72 bg-gray-100 rounded" />
          </div>
          <div className="h-10 w-28 bg-gray-200 rounded" />
        </div>
        <EmailRowsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load company emails</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 bg-white rounded-lg"
    >
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setItemToDelete(null);
        }}
        title="Delete Email"
        description="Are you sure you want to delete this email? This action cannot be undone."
        itemName={itemToDelete?.email_id}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Company Emails</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your company email accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setFormData(EMPTY_FORM);
            setShowAddDialog(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Email
        </motion.button>
      </div>

      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setFormData(EMPTY_FORM);
          }
        }}
      >
        <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Add Company Email
            </DialogTitle>
          </DialogHeader>
          <EmailForm
            formData={formData}
            setFormData={setFormData}
            users={users}
            onSubmit={handleAddSubmit}
            onCancel={() => {
              setShowAddDialog(false);
              setFormData(EMPTY_FORM);
            }}
            isPending={createMutation.isPending}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {emails.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Mail className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No company emails configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Your First Email
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email, index) => (
            <EmailRow
              key={email.id}
              email={email}
              index={index}
              users={users}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending && itemToDelete?.id === email.id}
              accessToken={accessToken}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
