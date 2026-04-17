"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, MessageSquare, Check } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded animate-pulse" />,
});

export default function TemplateFormDialog({
  formData,
  setFormData,
  placeholders = [],
  onSubmit,
  onCancel,
  isLoading = false,
  activeType = "email",
  isOpen = false,
}) {
  const formContent = (
    <form onSubmit={onSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Template Title <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={formData.title}
            onChange={(content) =>
              setFormData((p) => ({ ...p, title: content }))
            }
            placeholder={
              formData.type === "email"
                ? "e.g. Welcome Email"
                : "e.g. Reminder SMS"
            }
            placeholders={placeholders}
            editorMinHeightClass="min-h-28"
            proseMinHeightClass="min-h-24"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((p) => ({ ...p, type: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        {/* Email Subject */}
        {formData.type === "email" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData((p) => ({ ...p, subject: e.target.value }))
              }
              placeholder="e.g. Welcome to our platform"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        )}

        {/* Body with Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {formData.type === "email" ? "Email Body" : "SMS Body"}{" "}
            <span className="text-red-500">*</span>
          </label>

          {/* Rich Text Editor for Email, Textarea for SMS */}
          {formData.type === "email" ? (
            <RichTextEditor
              value={formData.body}
              onChange={(content) =>
                setFormData((p) => ({ ...p, body: content }))
              }
              placeholder="Enter the email body content..."
              placeholders={placeholders}
            />
          ) : (
            <RichTextEditor
              value={formData.body}
              onChange={(content) =>
                setFormData((p) => ({ ...p, body: content }))
              }
              placeholder="Enter the SMS message content..."
              placeholders={placeholders}
            />
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Template
              </>
            )}
          </motion.button>
        </div>
      </form>
    );

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.type === "email" ? (
              <Mail className="w-5 h-5 text-primary" />
            ) : (
              <MessageSquare className="w-5 h-5 text-primary" />
            )}
            Add Template
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
