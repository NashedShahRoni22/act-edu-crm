"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function UserMultiSelect({ users, selectedIds, onChange }) {
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
            "w-full min-h-10.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex flex-wrap gap-1.5 items-center bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(u.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      toggle(u.id);
                    }
                  }}
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
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      isSel ? "bg-primary border-primary" : "border-gray-300"
                    )}
                  >
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
