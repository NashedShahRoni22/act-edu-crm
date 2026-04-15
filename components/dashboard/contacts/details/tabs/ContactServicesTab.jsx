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

function ServicesSkeleton() {
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

export default function ContactServicesTab({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    workflow_id: "",
    partner_id: "",
    product_id: "",
    partner_branch_id: "",
    expected_start_date: "",
    expected_win_date: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contacts/${contactId}/interested-services`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: workflowsData } = useQuery({
    queryKey: ["/workflows", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: partnersData } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: productsData } = useQuery({
    queryKey: ["/products", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    queryKey: [
      newService.partner_id
        ? `/partners/${newService.partner_id}/branches`
        : "/partners/0/branches",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!newService.partner_id,
  });

  const createServiceMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(
        `/contacts/${contactId}/interested-services`,
        fd,
        accessToken,
      ),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Service added successfully");
        setDialogOpen(false);
        setNewService({
          workflow_id: "",
          partner_id: "",
          product_id: "",
          partner_branch_id: "",
          expected_start_date: "",
          expected_win_date: "",
        });
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}/interested-services`, accessToken],
        });
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}/activities`, accessToken],
        });
      } else {
        toast.error(res.message || "Failed to add service");
      }
    },
    onError: () => toast.error("Failed to add service"),
  });

  const workflows = workflowsData?.data || [];
  const partners = partnersData?.data || [];
  const allProducts = productsData?.data || [];
  const branches = branchesData?.data || [];
  const products = newService.partner_id
    ? allProducts.filter(
        (product) =>
          String(product.partner_id) === String(newService.partner_id),
      )
    : [];

  const handleCreateService = (e) => {
    e.preventDefault();

    if (!newService.workflow_id) {
      toast.error("Workflow is required");
      return;
    }

    const fd = new FormData();
    fd.append("workflow_id", newService.workflow_id);
    if (newService.partner_id) fd.append("partner_id", newService.partner_id);
    if (newService.product_id) fd.append("product_id", newService.product_id);
    if (newService.partner_branch_id)
      fd.append("partner_branch_id", newService.partner_branch_id);
    if (newService.expected_start_date)
      fd.append("expected_start_date", newService.expected_start_date);
    if (newService.expected_win_date)
      fd.append("expected_win_date", newService.expected_win_date);

    createServiceMutation.mutate(fd);
  };

  if (isLoading) return <ServicesSkeleton />;

  if (isError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
        Failed to load interested services.
      </div>
    );
  }

  const services = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Services</h3>
          <p className="text-sm text-gray-500">
            {services.length} record{services.length === 1 ? "" : "s"} found
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setNewService({
                workflow_id: "",
                partner_id: "",
                product_id: "",
                partner_branch_id: "",
                expected_start_date: "",
                expected_win_date: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white">
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Interested Service</DialogTitle>
              <DialogDescription>
                Create a new interested service for this contact.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow_id">Workflow*</Label>
                <select
                  id="workflow_id"
                  value={newService.workflow_id}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      workflow_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8]"
                  required
                >
                  <option value="">Select workflow</option>
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partner_id">Partner</Label>
                  <select
                    id="partner_id"
                    value={newService.partner_id}
                    onChange={(e) =>
                      setNewService((prev) => ({
                        ...prev,
                        partner_id: e.target.value,
                        product_id: "",
                        partner_branch_id: "",
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8]"
                  >
                    <option value="">Select partner (optional)</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_id">Product</Label>
                  <select
                    id="product_id"
                    value={newService.product_id}
                    onChange={(e) =>
                      setNewService((prev) => ({
                        ...prev,
                        product_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] disabled:bg-gray-50 disabled:text-gray-400"
                    disabled={!newService.partner_id}
                  >
                    <option value="">
                      {!newService.partner_id
                        ? "Select partner first"
                        : "Select product (optional)"}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_branch_id">Partner Branch</Label>
                <select
                  id="partner_branch_id"
                  value={newService.partner_branch_id}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      partner_branch_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={!newService.partner_id || isBranchesLoading}
                >
                  <option value="">
                    {!newService.partner_id
                      ? "Select partner first"
                      : isBranchesLoading
                        ? "Loading branches..."
                        : "Select branch (optional)"}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name || `Branch #${branch.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expected_start_date">Expected Start Date</Label>
                  <Input
                    id="expected_start_date"
                    type="date"
                    value={newService.expected_start_date}
                    onChange={(e) =>
                      setNewService((prev) => ({
                        ...prev,
                        expected_start_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_win_date">Expected Win Date</Label>
                  <Input
                    id="expected_win_date"
                    type="date"
                    value={newService.expected_win_date}
                    onChange={(e) =>
                      setNewService((prev) => ({
                        ...prev,
                        expected_win_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white"
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!services.length ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No interested services found for this contact.
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Service #{service.id}</p>
                  <h4 className="text-base font-semibold text-gray-900">
                    {service.workflow?.name || "Workflow not assigned"}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                    {service.status || "-"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {service.product?.name || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Partner</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {service.partner?.name || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {service.partner_branch?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Expected Start</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(service.expected_start_date)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Expected Win</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(service.expected_win_date)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Added By</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {service.added_by
                      ? `${service.added_by.first_name} ${service.added_by.last_name}`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
