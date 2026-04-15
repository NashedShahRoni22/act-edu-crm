"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/dashboard/settings/templates/RichTextEditor";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NotesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-lg p-4">
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerNotesTab({ partnerId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Fetch notes
  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partner/${partnerId}/notes`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append("title", data.title);
      fd.append("description", data.description);
      return postWithToken(`/partner/${partnerId}/notes`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Note created successfully");
        setFormData({ title: "", description: "" });
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: [`/partner/${partnerId}/notes`, accessToken],
        });
      } else {
        toast.error(res.message || "Failed to create note");
      }
    },
    onError: () => toast.error("Failed to create note"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    createMutation.mutate(formData);
  };

  const notes = data?.data || [];

  if (isLoading) {
    return <NotesSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-white">
              <Plus className="w-4 h-4" />
              Add Note
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>
                Create a new note for this partner
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., Partnership Discussion"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1 border rounded-md">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                    placeholder="Enter note details..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Note"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-600">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    By {note.added_by?.first_name} {note.added_by?.last_name} • {formatDate(note.created_at)}
                  </p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: note.description }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
