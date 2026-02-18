"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Loader2, Mail, Eye, Edit2, Trash2,
  Check, X, ChevronDown, User, Users as UsersIcon,
  FileSignature, Power, Inbox,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  email_id: "",
  display_name: "",
  signature: "",
  status: "1",
  incoming_type: "all",
  shared_users: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emailToForm(email) {
  return {
    email_id: email.email_id || "",
    display_name: email.config?.display_name || "",
    signature: email.signature_content || "",
    status: email.status === "Active" ? "1" : "0",
    incoming_type: email.config?.incoming_type || "all",
    shared_users: email.shared_user_ids || [],
  };
}

function buildFormData(formData, isEdit = false) {
  const fd = new FormData();
  if (isEdit) fd.append("_method", "PUT");
  fd.append("email_id", formData.email_id.trim());
  fd.append("status", formData.status);
  fd.append("incoming_type", formData.incoming_type);
  if (formData.display_name) fd.append("display_name", formData.display_name.trim());
  if (formData.signature) fd.append("signature", formData.signature.trim());
  formData.shared_users.forEach((id, i) => fd.append(`shared_users[${i}]`, id));
  return fd;
}

// ─── UserMultiSelect ──────────────────────────────────────────────────────────

function UserMultiSelect({ users, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);

  const toggle = (userId) => {
    onChange(
      selectedIds.includes(userId)
        ? selectedIds.filter((id) => id !== userId)
        : [...selectedIds, userId]
    );
  };

  const selected = users.filter((u) => selectedIds.includes(u.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex flex-wrap gap-1.5 items-center bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
            selected.length === 0 && "text-gray-400"
          )}
        >
          {selected.length === 0 ? (
            <span className="flex-1">Select shared users...</span>
          ) : (
            selected.map((u) => (
              <Badge key={u.id} variant="secondary" className="flex items-center gap-1 pr-1 text-xs">
                {u.name}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggle(u.id); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); toggle(u.id); } }}
                  className="ml-0.5 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
              </Badge>
            ))
          )}
          <ChevronDown className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-56 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No users found</p>
          ) : (
            users.map((user) => {
              const isSel = selectedIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggle(user.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left",
                    isSel && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                    isSel ? "bg-primary border-primary" : "border-gray-300"
                  )}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── EmailForm (shared between Add & Edit) ────────────────────────────────────

function EmailForm({ formData, setFormData, users, onSubmit, onCancel, isPending, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 py-2">
      <div className="space-y-1.5">
        <Label>Email Address <span className="text-red-500">*</span></Label>
        <Input
          type="email"
          value={formData.email_id}
          onChange={(e) => setFormData((p) => ({ ...p, email_id: e.target.value }))}
          placeholder="email@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Display Name</Label>
        <Input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))}
          placeholder="e.g. Sales Team"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status <span className="text-red-500">*</span></Label>
          <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Incoming Type <span className="text-red-500">*</span></Label>
          <Select value={formData.incoming_type} onValueChange={(v) => setFormData((p) => ({ ...p, incoming_type: v }))}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="associated_only">Associated Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Email Signature</Label>
        <Textarea
          value={formData.signature}
          onChange={(e) => setFormData((p) => ({ ...p, signature: e.target.value }))}
          placeholder="Enter email signature..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Shared Users</Label>
        <UserMultiSelect
          users={users}
          selectedIds={formData.shared_users}
          onChange={(ids) => setFormData((p) => ({ ...p, shared_users: ids }))}
        />
        {formData.shared_users.length > 0 && (
          <p className="text-xs text-gray-500">
            {formData.shared_users.length} user{formData.shared_users.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary-deep text-white">
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEdit ? "Saving..." : "Adding..."}</>
            : <><Check className="w-4 h-4 mr-2" />{isEdit ? "Save Changes" : "Add Email"}</>
          }
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── EmailView ────────────────────────────────────────────────────────────────

function EmailView({ email, onEdit, onClose }) {
  const isActive = email.status === "Active";

  return (
    <div className="py-2 space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </p>
          <p className="text-sm font-semibold text-gray-900 break-all">{email.email_id}</p>
        </div>

        {email.config?.display_name && (
          <div>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5" /> Display Name
            </p>
            <p className="text-sm font-semibold text-gray-900">{email.config.display_name}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
            <Power className="w-3.5 h-3.5" /> Status
          </p>
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {email.status}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
            <Inbox className="w-3.5 h-3.5" /> Incoming Type
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {email.config?.incoming_type === "associated_only" ? "Associated Only" : "All"}
          </p>
        </div>

        {email.system_email && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5" /> System Email
            </p>
            <p className="text-xs text-gray-600 break-all font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              {email.system_email}
            </p>
          </div>
        )}
      </div>

      {email.signature_content && (
        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
            <FileSignature className="w-3.5 h-3.5" /> Email Signature
          </p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{email.signature_content}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
          <UsersIcon className="w-3.5 h-3.5" /> Shared Users
        </p>
        {email.user_sharing_display ? (
          <div className="flex flex-wrap gap-2">
            {email.user_sharing_display.split(", ").map((name, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <User className="w-3 h-3" /> {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No shared users</p>
        )}
      </div>

      <DialogFooter className="pt-2 border-t border-gray-100">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={onEdit} className="bg-primary hover:bg-primary-deep text-white">
          <Edit2 className="w-4 h-4 mr-2" /> Edit Email
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── EmailRow ─────────────────────────────────────────────────────────────────

function EmailRow({ email, index, users, onDelete, isDeleting, accessToken }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null); // null | "view" | "edit"
  const [formData, setFormData] = useState(EMPTY_FORM);

  const openView = () => setDialog("view");
  const openEdit = () => { setFormData(emailToForm(email)); setDialog("edit"); };
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
    if (!formData.email_id.trim()) return toast.error("Email address is required");
    updateMutation.mutate(buildFormData(formData, true));
  };

  const isActive = email.status === "Active";

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
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {email.status}
                </span>
                {email.user_sharing_display && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <UsersIcon className="w-3 h-3" /> {email.user_sharing_display}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={openView}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
              <Eye className="w-4 h-4" />
            </motion.button>
            {/* <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={openEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
              <Edit2 className="w-4 h-4" />
            </motion.button> */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(email.id, email.email_id)}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {dialog === "edit" ? "Edit Company Email" : "Email Details"}
            </DialogTitle>
          </DialogHeader>

          {dialog === "view" && (
            <EmailView email={email} onEdit={openEdit} onClose={closeDialog} />
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

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Email() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

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
        queryClient.invalidateQueries({ queryKey: ["/company-emails"] });
      } else {
        toast.error(res.message || "Failed to delete email");
      }
    },
    onError: () => toast.error("Failed to delete email"),
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.email_id.trim()) return toast.error("Email address is required");
    createMutation.mutate(buildFormData(formData, false));
  };

  const handleDelete = (id, emailId) => {
    if (window.confirm(`Delete email "${emailId}"? This action cannot be undone.`)) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Company Emails</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your company email accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setFormData(EMPTY_FORM); setShowAddDialog(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Email
        </motion.button>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setFormData(EMPTY_FORM); } }}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
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
            onCancel={() => { setShowAddDialog(false); setFormData(EMPTY_FORM); }}
            isPending={createMutation.isPending}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* List */}
      {emails.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Mail className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No company emails configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
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
              isDeleting={deleteMutation.isPending}
              accessToken={accessToken}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}