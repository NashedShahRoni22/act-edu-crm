"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import RichTextEditor from "@/components/dashboard/settings/templates/RichTextEditor";

function NotesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
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

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ContactNotesTab({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contact/${contactId}/notes`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(`/contact/${contactId}/notes`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Note created successfully");
        setDialogOpen(false);
        setNewNote({
          title: "",
          description: "",
        });
        queryClient.invalidateQueries({
          queryKey: [`/contact/${contactId}/notes`, accessToken],
        });
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}/activities`, accessToken],
        });
      } else {
        toast.error(res.message || "Failed to create note");
      }
    },
    onError: () => toast.error("Failed to create note"),
  });

  const handleCreateNote = (e) => {
    e.preventDefault();

    if (!newNote.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!newNote.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const fd = new FormData();
    fd.append("title", newNote.title);
    fd.append("description", newNote.description);

    createNoteMutation.mutate(fd);
  };

  if (isLoading) return <NotesSkeleton />;

  if (isError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
        Failed to load notes.
      </div>
    );
  }

  const notes = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Notes</h3>
          <p className="text-sm text-gray-500">
            {notes.length} note{notes.length === 1 ? "" : "s"}
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setNewNote({
                title: "",
                description: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white">
              <Plus className="w-4 h-4" />
              Add Note
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add a new note for this contact.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={newNote.description}
                    onChange={(html) =>
                      setNewNote((prev) => ({
                        ...prev,
                        description: html,
                      }))
                    }
                    placeholder="Write your note details..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white"
                  disabled={createNoteMutation.isPending}
                >
                  {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!notes.length ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No notes found for this contact.
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">
                    {note.title}
                  </h4>
                  {note.added_by && (
                    <p className="text-xs text-gray-500 mt-2">
                      By {note.added_by.first_name} {note.added_by.last_name} •{" "}
                      {formatDate(note.created_at)}
                    </p>
                  )}
                </div>
              </div>

              {note.description && (
                <div className="text-gray-700 bg-gray-50 rounded-lg p-4 mb-3 text-sm leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{ __html: note.description }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
