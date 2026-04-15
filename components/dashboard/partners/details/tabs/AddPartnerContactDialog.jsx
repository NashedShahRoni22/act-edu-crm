"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/context";
import { postWithToken, fetchWithToken } from "@/helpers/api";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function AddPartnerContactDialog({ partnerId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    partner_branch_id: "",
    international_phone_code: "",
    phone_number: "",
    fax: "",
    department: "",
    position: "",
    is_primary: false,
  });

  const { data: branchesData } = useQuery({
    queryKey: [`/partners/${partnerId}/branches`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId && open,
  });

  const createMutation = useMutation({
    mutationFn: async (newContact) => {
      const fd = new FormData();
      fd.append("name", newContact.name);
      fd.append("email", newContact.email);
      fd.append("partner_branch_id", newContact.partner_branch_id);
      if (newContact.international_phone_code)
        fd.append("phone_code", newContact.international_phone_code);
      if (newContact.phone_number)
        fd.append("phone_number", newContact.phone_number);
      if (newContact.fax) fd.append("fax", newContact.fax);
      if (newContact.department) fd.append("department", newContact.department);
      if (newContact.position) fd.append("position", newContact.position);
      fd.append("is_primary", newContact.is_primary ? 1 : 0);

      return await postWithToken(
        `/partners/${partnerId}/contacts`,
        fd,
        accessToken
      );
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Contact added successfully");
        queryClient.invalidateQueries({
          queryKey: [`/partners/${partnerId}/contacts`],
        });
        setOpen(false);
        setFormData({
          name: "",
          email: "",
          partner_branch_id: "",
          international_phone_code: "",
          phone_number: "",
          fax: "",
          department: "",
          position: "",
          is_primary: false,
        });
      } else {
        toast.error(res.message || "Failed to add contact");
      }
    },
    onError: () => toast.error("Failed to add contact"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.partner_branch_id) {
      toast.error("Branch is required");
      return;
    }

    createMutation.mutate(formData);
  };

  const branches = branchesData?.data || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-white">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact person for this partner
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1"
              placeholder="e.g., John Smith"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1"
              placeholder="e.g., john@example.com"
              required
            />
          </div>

          {/* Branch */}
          <div className="w-full">
            <Label htmlFor="partner_branch_id">
              Branch <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.partner_branch_id}
              onValueChange={(value) =>
                setFormData({ ...formData, partner_branch_id: value })
              }
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* International Phone Code & Number */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="international_phone_code">Int. Phone Code</Label>
              <Input
                id="international_phone_code"
                type="text"
                value={formData.international_phone_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    international_phone_code: e.target.value,
                  })
                }
                className="mt-1"
                placeholder="+61"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="mt-1"
                placeholder="12345432"
              />
            </div>
          </div>

          {/* Fax */}
          <div>
            <Label htmlFor="fax">Fax</Label>
            <Input
              id="fax"
              type="text"
              value={formData.fax}
              onChange={(e) =>
                setFormData({ ...formData, fax: e.target.value })
              }
              className="mt-1"
              placeholder="e.g., 3423"
            />
          </div>

          {/* Department & Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="mt-1"
                placeholder="e.g., Admissions"
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="mt-1"
                placeholder="e.g., Manager"
              />
            </div>
          </div>

          {/* Primary Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) =>
                setFormData({ ...formData, is_primary: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <Label htmlFor="is_primary" className="mb-0 cursor-pointer">
              Mark as Primary Contact
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="gap-2 text-white"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {createMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
