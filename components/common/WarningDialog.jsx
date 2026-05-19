"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TriangleAlert } from "lucide-react";

export default function WarningDialog({
  open,
  onOpenChange,
  title = "Warning",
  description = "Are you sure you want to continue?",
  itemName,
  onConfirm,
  isLoading = false,
  confirmLabel = "Continue",
  confirmingLabel = "Processing...",
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-amber-200 bg-linear-to-b from-amber-50 to-white shadow-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-full bg-amber-100 p-2 ring-4 ring-amber-50">
              <TriangleAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-gray-900">{title}</DialogTitle>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">
                Warning
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <DialogDescription className="text-base text-gray-700 leading-6">
            {description}
            {itemName && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm font-semibold">{itemName}</p>
                </div>
              </div>
            )}
          </DialogDescription>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-amber-200 text-gray-700 hover:bg-amber-50 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
          >
            {isLoading ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}