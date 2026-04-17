"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import TemplateCard from "./TemplateCard";
import TemplateFormDialog from "./TemplateFormDialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import TemplatesSkeleton from "./TemplatesSkeleton";

const emptyForm = {
  title: "",
  type: "email",
  subject: "",
  body: "",
};

function stripHtml(content = "") {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

export default function Templates() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [activeType, setActiveType] = useState("email");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/email-templates", activeType, accessToken],
    queryFn: async () => {
      const response = await fetchWithToken({
        queryKey: [`/email-templates?type=${activeType}`, accessToken],
      });
      return response;
    },
    enabled: !!accessToken,
  });

  const templates = data?.data || [];

  const {
    data: placeholdersData,
    isLoading: isPlaceholdersLoading,
    error: placeholdersError,
  } = useQuery({
    queryKey: ["/email-templates/placeholders", accessToken],
    queryFn: async () => {
      const response = await fetchWithToken({
        queryKey: [`/email-templates/placeholders`, accessToken],
      });
      return response;
    },
    enabled: !!accessToken,
  });

  const placeholders = placeholdersData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/email-templates", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Template created successfully");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["/email-templates"] });
      } else {
        toast.error(res.message || "Failed to create template");
      }
    },
    onError: () => toast.error("Failed to create template"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/email-templates/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Template deleted successfully");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        queryClient.invalidateQueries({ queryKey: ["/email-templates"] });
      } else {
        toast.error(res.message || "Failed to delete template");
      }
    },
    onError: () => toast.error("Failed to delete template"),
  });

  const resetForm = () => {
    setFormData({ ...emptyForm, type: activeType });
    setShowForm(false);
  };

  const handleAdd = () => {
    setFormData({ ...emptyForm, type: activeType });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!stripHtml(formData.title)) {
      toast.error("Title is required");
      return;
    }

    if (!["email", "sms"].includes(formData.type)) {
      toast.error("Type must be email or sms");
      return;
    }

    if (formData.type === "email" && !formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!stripHtml(formData.body)) {
      toast.error("Body is required");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("type", formData.type);
    if (formData.type === "email") {
      fd.append("subject", formData.subject.trim());
    }
    fd.append("body", formData.body);

    createMutation.mutate(fd);
  };

  // Handle delete
  const handleDelete = (id, title) => {
    setItemToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?.id) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  if (isLoading) {
    return <TemplatesSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load templates</p>
        </div>
      </div>
    );
  }

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
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        itemName={itemToDelete?.title}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage reusable email and SMS templates
          </p>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </motion.button>
        )}
      </div>

      <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
        <button
          onClick={() => {
            setActiveType("email");
            setShowForm(false);
          }}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            activeType === "email"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => {
            setActiveType("sms");
            setShowForm(false);
          }}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            activeType === "sms"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          SMS
        </button>
      </div>

      {/* Add Form Dialog */}
      <TemplateFormDialog
        formData={formData}
        setFormData={setFormData}
        placeholders={placeholders}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isLoading={createMutation.isPending}
        activeType={activeType}
        isOpen={showForm}
      />

      {/* Templates Grid */}
      {templates.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          {activeType === "email" ? (
            <Mail className="w-12 h-12 text-gray-300" />
          ) : (
            <MessageSquare className="w-12 h-12 text-gray-300" />
          )}
          <p className="text-sm text-gray-500">
            No {activeType.toUpperCase()} templates created yet
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Template
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending && itemToDelete?.id === template.id}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}