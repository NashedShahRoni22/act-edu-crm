"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postWithToken } from "@/helpers/api";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Eye, Loader2, Trash2, Users as UsersIcon } from "lucide-react";
import EmailForm from "./EmailForm";
import EmailView from "./EmailView";
import { EMPTY_FORM } from "./constants";
import { buildFormData, emailToForm, getSharedUserNames } from "./helpers";

export default function EmailRow({
  email,
  index,
  users,
  onDelete,
  isDeleting,
  accessToken,
}) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const openView = () => setDialog("view");
  const openEdit = () => {
    setFormData(emailToForm(email));
    setDialog("edit");
  };
  const closeDialog = () => setDialog(null);

  const updateMutation = useMutation({
    mutationFn: (fd) => postWithToken(`/company-emails/${email.id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Email updated successfully");
        closeDialog();
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
      } else {
        toast.error(res.message || "Failed to update email");
      }
    },
    onError: () => toast.error("Failed to update email"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email_id.trim()) {
      toast.error("Email address is required");
      return;
    }
    updateMutation.mutate(buildFormData(formData, true));
  };

  const isActive = email.status === "Active";
  const sharedNames = getSharedUserNames(email, users);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{email.email_id}</h4>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {email.config?.display_name && (
                  <>
                    <p className="text-xs text-gray-500">{email.config.display_name}</p>
                    <span className="text-xs text-gray-300">•</span>
                  </>
                )}
                <p className="text-xs text-gray-500">
                  {email.config?.incoming_type === "associated_only" ? "Associated Only" : "All"}
                </p>
                <span className="text-xs text-gray-300">•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {email.status}
                </span>
                {sharedNames.length > 0 && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <UsersIcon className="w-3 h-3 text-gray-500" />
                      {sharedNames.slice(0, 2).map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-medium"
                        >
                          {name}
                        </span>
                      ))}
                      {sharedNames.length > 2 && (
                        <span className="text-[11px] text-gray-500 font-medium">
                          +{sharedNames.length - 2} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openView}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(email.id, email.email_id)}
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

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {dialog === "edit" ? "Edit Company Email" : "Email Details"}
            </DialogTitle>
          </DialogHeader>

          {dialog === "view" && (
            <EmailView
              email={email}
              users={users}
              onEdit={openEdit}
              onClose={closeDialog}
            />
          )}
          {dialog === "edit" && (
            <EmailForm
              formData={formData}
              setFormData={setFormData}
              users={users}
              onSubmit={handleSubmit}
              onCancel={closeDialog}
              isPending={updateMutation.isPending}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
