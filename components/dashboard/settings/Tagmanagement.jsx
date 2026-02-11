"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Tag as TagIcon,
  Search,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function TagManagement() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch tags
  const { data, isLoading, error } = useQuery({
    queryKey: ["/tags", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const tags = data?.data || [];

  // Filter tags based on search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (formData) => {
      return await postWithToken("/tags", formData, accessToken);
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message || "Tag created successfully");
        setNewTagName("");
        setShowAddForm(false);
        queryClient.invalidateQueries({ queryKey: ["/tags"] });
      } else {
        toast.error(data.message || "Failed to create tag");
      }
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: async ({ tagId, formData }) => {
      return await postWithToken(`/tags/${tagId}`, formData, accessToken);
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message || "Tag updated successfully");
        setEditingTagId(null);
        setEditingTagName("");
        queryClient.invalidateQueries({ queryKey: ["/tags"] });
      } else {
        toast.error(data.message || "Failed to update tag");
      }
    },
    onError: () => {
      toast.error("Failed to update tag");
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId) => {
      const formData = new FormData();
      formData.append("_method", "DELETE");
      return await postWithToken(`/tags/${tagId}`, formData, accessToken);
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message || "Tag deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/tags"] });
      } else {
        toast.error(data.message || "Failed to delete tag");
      }
    },
    onError: () => {
      toast.error("Failed to delete tag");
    },
  });

  // Handle create tag
  const handleCreateTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", newTagName.trim());
    createTagMutation.mutate(formData);
  };

  // Handle start editing
  const handleStartEdit = (tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName("");
  };

  // Handle update tag
  const handleUpdateTag = (tagId) => {
    if (!editingTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", editingTagName.trim());
    formData.append("_method", "PUT");

    updateTagMutation.mutate({ tagId, formData });
  };

  // Handle delete tag
  const handleDeleteTag = (tagId, tagName) => {
    if (window.confirm(`Are you sure you want to delete "${tagName}"?`)) {
      deleteTagMutation.mutate(tagId);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <p className="text-sm text-red-800">Failed to load tags</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Add Tag Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Tag
          </motion.button>
        </div>

        {/* Add Tag Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateTag}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createTagMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createTagMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTagName("");
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">{tags.length}</span> Total Tags
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{filteredTags.length}</span> Showing
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tag Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Usage Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <TagIcon className="w-12 h-12 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      {searchQuery ? "No tags found" : "No tags yet"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTags.map((tag) => (
                <motion.tr
                  key={tag.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Tag Name */}
                  <td className="px-6 py-4">
                    {editingTagId === tag.id ? (
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateTag(tag.id);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TagIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {tag.name}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Usage Count */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {tag.usage_count}
                      </span>
                    </div>
                  </td>

                  {/* Created By */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tag.created_by.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tag.created_by.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(tag.created_at)}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingTagId === tag.id ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUpdateTag(tag.id)}
                            disabled={updateTagMutation.isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {updateTagMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleStartEdit(tag)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                            disabled={deleteTagMutation.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteTagMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredTags.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredTags.length}</span> of{" "}
            <span className="font-medium">{tags.length}</span> tags
          </p>
        </div>
      )}
    </motion.div>
  );
}