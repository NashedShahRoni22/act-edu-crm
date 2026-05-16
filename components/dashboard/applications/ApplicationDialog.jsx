"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";

export default function ApplicationDialog({
  contactId,
  workflows = [],
  partners = [],
  open,
  onOpenChange,
  onCreated,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(false);
  const [form, setForm] = useState({ workflow_id: "", partner_id: "", partner_branch_id: "", product_id: "" });

  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    queryKey: [
      form.partner_id ? `/partners/${form.partner_id}/branches` : "/partners/0/branches",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!form.partner_id && dialogOpen,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: [
      form.partner_id ? `/partners/${form.partner_id}/products` : "/partners/0/products",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!form.partner_id && dialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken(`/contacts/${contactId}/applications`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Application created");
        setDialogOpen?.(false);
        setForm({ workflow_id: "", partner_id: "", partner_branch_id: "", product_id: "" });
        if (typeof onCreated === "function") onCreated(res);
        queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/applications`, accessToken] });
      } else {
        toast.error(res.message || "Failed to create application");
      }
    },
    onError: () => toast.error("Failed to create application"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.workflow_id || !form.partner_branch_id || !form.product_id) {
      toast.error("Please complete the form");
      return;
    }
    const fd = new FormData();
    fd.append("workflow_id", form.workflow_id);
    fd.append("partner_branch_id", form.partner_branch_id);
    fd.append("product_id", form.product_id);
    createMutation.mutate(fd);
  };

  const branches = branchesData?.data || [];
  const products = productsData?.data || [];

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(nextOpen) => {
        setDialogOpen?.(nextOpen);
        if (!nextOpen) {
          setForm({ workflow_id: "", partner_id: "", partner_branch_id: "", product_id: "" });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white">
          <Plus className="w-4 h-4" />
          Add Application
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>Create a new application for this contact.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow_id">Workflow</Label>
            <select id="workflow_id" value={form.workflow_id} onChange={(e)=>setForm(prev=>({...prev,workflow_id:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Select workflow</option>
              {workflows.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner_id">Partner</Label>
            <select id="partner_id" value={form.partner_id} onChange={(e)=>setForm(prev=>({...prev,partner_id:e.target.value, partner_branch_id: '', product_id: ''}))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Select partner</option>
              {partners.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner_branch_id">Partner Branch</Label>
            <select
              id="partner_branch_id"
              value={form.partner_branch_id}
              onChange={(e)=>setForm(prev=>({...prev,partner_branch_id:e.target.value}))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!form.partner_id || isBranchesLoading}
            >
              <option value="">
                {!form.partner_id
                  ? "Select partner first"
                  : isBranchesLoading
                    ? "Loading branches..."
                    : "Select branch"}
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name || `Branch #${branch.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_id">Product</Label>
            <select
              id="product_id"
              value={form.product_id}
              onChange={(e)=>setForm(prev=>({...prev,product_id:e.target.value}))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!form.partner_id || isProductsLoading}
            >
              <option value="">
                {!form.partner_id
                  ? "Select partner first"
                  : isProductsLoading
                    ? "Loading products..."
                    : "Select product"}
              </option>
              {products.map((p)=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
