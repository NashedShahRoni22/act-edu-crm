"use client";

import { Loader2, Check } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import UserMultiSelect from "./UserMultiSelect";

export default function EmailForm({
  formData,
  setFormData,
  users,
  onSubmit,
  onCancel,
  isPending,
  isEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 py-2">
      <div className="space-y-1.5">
        <Label>
          Email Address <span className="text-red-500">*</span>
        </Label>
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

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>
            Incoming Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.incoming_type}
            onValueChange={(v) => setFormData((p) => ({ ...p, incoming_type: v }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
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
            {formData.shared_users.length} user
            {formData.shared_users.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-deep text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isEdit ? "Saving..." : "Adding..."}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {isEdit ? "Save Changes" : "Add Email"}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
