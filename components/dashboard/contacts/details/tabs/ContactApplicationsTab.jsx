"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, BriefcaseBusiness } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

function ApplicationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="h-4 w-1/4 bg-gray-200 rounded mb-3" />
          <div className="h-3 w-2/5 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-3/5 bg-gray-100 rounded" />
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

export default function ContactApplicationsTab({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newApplication, setNewApplication] = useState({
    workflow_id: "",
    partner_id: "",
    partner_branch_id: "",
    product_id: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contacts/${contactId}/applications`, accessToken],
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
      newApplication.partner_id
        ? `/partners/${newApplication.partner_id}/branches`
        : "/partners/0/branches",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!newApplication.partner_id,
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(`/contacts/${contactId}/applications`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Application created successfully");
        setDialogOpen(false);
        setNewApplication({
          workflow_id: "",
          partner_id: "",
          partner_branch_id: "",
          product_id: "",
        });
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}/applications`, accessToken],
        });
      } else {
        toast.error(res.message || "Failed to create application");
      }
    },
    onError: () => toast.error("Failed to create application"),
  });

  const workflows = workflowsData?.data || [];
  const partners = partnersData?.data || [];
  const allProducts = productsData?.data || [];
  const branches = branchesData?.data || [];
  const products = newApplication.partner_id
    ? allProducts.filter(
        (product) =>
          String(product.partner_id) === String(newApplication.partner_id),
      )
    : [];

  const handleCreateApplication = (event) => {
    event.preventDefault();

    if (!newApplication.workflow_id) {
      toast.error("Workflow is required");
      return;
    }
    if (!newApplication.partner_branch_id) {
      toast.error("Partner branch is required");
      return;
    }
    if (!newApplication.product_id) {
      toast.error("Product is required");
      return;
    }

    const fd = new FormData();
    fd.append("workflow_id", newApplication.workflow_id);
    fd.append("partner_branch_id", newApplication.partner_branch_id);
    fd.append("product_id", newApplication.product_id);

    createApplicationMutation.mutate(fd);
  };

  if (isLoading) return <ApplicationsSkeleton />;

  if (isError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
        Failed to load applications.
      </div>
    );
  }

  const applications = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Applications</h3>
          <p className="text-sm text-gray-500">
            {applications.length} record{applications.length === 1 ? "" : "s"} found
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setNewApplication({
                workflow_id: "",
                partner_id: "",
                partner_branch_id: "",
                product_id: "",
              });
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
              <DialogDescription>
                Create a new application for this contact.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow_id">Workflow</Label>
                <select
                  id="workflow_id"
                  value={newApplication.workflow_id}
                  onChange={(event) =>
                    setNewApplication((prev) => ({
                      ...prev,
                      workflow_id: event.target.value,
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

              <div className="space-y-2">
                <Label htmlFor="partner_id">Partner</Label>
                <select
                  id="partner_id"
                  value={newApplication.partner_id}
                  onChange={(event) =>
                    setNewApplication((prev) => ({
                      ...prev,
                      partner_id: event.target.value,
                      partner_branch_id: "",
                      product_id: "",
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8]"
                  required
                >
                  <option value="">Select partner</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_branch_id">Partner Branch</Label>
                <select
                  id="partner_branch_id"
                  value={newApplication.partner_branch_id}
                  onChange={(event) =>
                    setNewApplication((prev) => ({
                      ...prev,
                      partner_branch_id: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={!newApplication.partner_id || isBranchesLoading}
                  required
                >
                  <option value="">
                    {!newApplication.partner_id
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
                  value={newApplication.product_id}
                  onChange={(event) =>
                    setNewApplication((prev) => ({
                      ...prev,
                      product_id: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={!newApplication.partner_id}
                  required
                >
                  <option value="">
                    {!newApplication.partner_id
                      ? "Select partner first"
                      : "Select product"}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white"
                  disabled={createApplicationMutation.isPending}
                >
                  {createApplicationMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!applications.length ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No applications found for this contact.
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full border border-gray-100 rounded-xl px-4">
          {applications.map((application) => (
            <AccordionItem key={application.id} value={`app-${application.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-2">
                  <div>
                    <p className="text-sm text-gray-500">Application #{application.id}</p>
                    <h4 className="text-base font-semibold text-gray-900">
                      {application.workflow?.name || "Workflow not assigned"}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {application.status || "-"}
                    </span>
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {application.courses?.length || 0} Course
                      {(application.courses?.length || 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Started At</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(application.started_at)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Owner ID</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {application.owner_id || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Current Stage ID</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {application.current_stage_id || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(application.created_at)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(application.updated_at)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Workflow Access</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {application.workflow?.access_type || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Workflow
                    </p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <BriefcaseBusiness className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium">
                        {application.workflow?.name || "No workflow linked"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Courses
                    </p>

                    {application.courses?.length ? (
                      <div className="space-y-3">
                        {application.courses.map((course) => (
                          <div
                            key={course.id}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {course.product?.name || "Unknown Product"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Type: {course.product?.product_type || "-"}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700">
                                Sequence #{course.sequence_order || "-"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <p className="text-gray-600">
                                <span className="text-gray-500">Partner: </span>
                                <span className="font-medium text-gray-900">
                                  {course.partner?.name || "-"}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                <span className="text-gray-500">Duration: </span>
                                <span className="font-medium text-gray-900">
                                  {course.product?.duration || "-"}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                <span className="text-gray-500">Revenue Type: </span>
                                <span className="font-medium text-gray-900">
                                  {course.product?.revenue_type || "-"}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                <span className="text-gray-500">Intake Months: </span>
                                <span className="font-medium text-gray-900">
                                  {course.product?.intake_months?.length
                                    ? course.product.intake_months.join(", ")
                                    : "-"}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No course records found.</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
