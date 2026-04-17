"use client";

import { useState } from "react";
import { Eye, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function TemplateActionsPopover({
  onView,
  onDelete,
  isDeleting = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Template actions"
          aria-label="Template actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onView();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          disabled={isDeleting}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}
