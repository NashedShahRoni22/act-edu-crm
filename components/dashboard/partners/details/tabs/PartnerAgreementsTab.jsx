"use client";

import { useAppContext } from "@/context/context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { FileText, Percent, Globe, Users, Calendar, Edit2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AgreementSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="border border-gray-100 rounded-xl p-6">
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-100 rounded" />
        </div>
      </div>
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

export default function PartnerAgreementsTab({ partnerId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    contract_expiry_date: "",
    representing_regions: "",
    default_super_agent_id: "",
    commission_percentage: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partners/${partnerId}/agreement`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId,
  });

  const agreement = data?.data;

  // Initialize form when agreement data loads
  const handleEditClick = () => {
    if (agreement) {
      setFormData({
        contract_expiry_date: agreement.contract_expiry_date
          ? agreement.contract_expiry_date.split("T")[0]
          : "",
        representing_regions: agreement.representing_regions?.[0] || "",
        default_super_agent_id: agreement.default_super_agent_id || "",
        commission_percentage: agreement.commission_percentage || "",
      });
    }
    setEditDialogOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      if (updatedData.contract_expiry_date)
        fd.append("contract_expiry_date", updatedData.contract_expiry_date);
      if (updatedData.representing_regions)
        fd.append("representing_regions[0]", updatedData.representing_regions);
      if (updatedData.default_super_agent_id)
        fd.append("default_super_agent_id", updatedData.default_super_agent_id);
      if (updatedData.commission_percentage)
        fd.append("commission_percentage", updatedData.commission_percentage);

      return await postWithToken(
        `/partners/${partnerId}/agreement`,
        fd,
        accessToken
      );
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Agreement updated successfully");
        queryClient.invalidateQueries({
          queryKey: [`/partners/${partnerId}/agreement`],
        });
        setEditDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to update agreement");
      }
    },
    onError: () => toast.error("Failed to update agreement"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <AgreementSkeleton />;

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-600">
        Failed to load agreement.
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">No agreement found</p>
        <button
          onClick={handleEditClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Create Agreement
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3B4CB8]" />
              Partner Agreement
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Agreement ID: {agreement.id}
            </p>
          </div>
          <button
            onClick={handleEditClick}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#3B4CB8] text-[#3B4CB8] rounded-lg text-sm font-medium hover:bg-[#3B4CB8]/5 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Contract Expiry Date */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-xs font-semibold text-gray-700">
                Contract Expiry Date
              </label>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {agreement.contract_expiry_date
                ? formatDate(agreement.contract_expiry_date)
                : "-"}
            </p>
          </div>

          {/* Commission Percentage */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <label className="text-xs font-semibold text-gray-700">
                Commission Percentage
              </label>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {agreement.commission_percentage
                ? `${agreement.commission_percentage}%`
                : "-"}
            </p>
          </div>

          {/* Representing Regions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <label className="text-xs font-semibold text-gray-700">
                Representing Regions
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {agreement.representing_regions &&
              agreement.representing_regions.length > 0 ? (
                agreement.representing_regions.map((region, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                  >
                    {region}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </div>
          </div>

          {/* Default Super Agent ID */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-400" />
              <label className="text-xs font-semibold text-gray-700">
                Default Super Agent ID
              </label>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {agreement.default_super_agent_id || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Agreement</DialogTitle>
            <DialogDescription>
              Update the partner agreement details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contract Expiry Date */}
            <div>
              <Label htmlFor="contract_expiry_date">Contract Expiry Date</Label>
              <Input
                id="contract_expiry_date"
                type="date"
                value={formData.contract_expiry_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contract_expiry_date: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            {/* Commission Percentage */}
            <div>
              <Label htmlFor="commission_percentage">
                Commission Percentage (%)
              </Label>
              <Input
                id="commission_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_percentage: e.target.value,
                  })
                }
                className="mt-1"
                placeholder="e.g., 20"
              />
            </div>

            {/* Representing Regions */}
            <div>
              <Label htmlFor="representing_regions">Representing Regions</Label>
              <Input
                id="representing_regions"
                type="text"
                value={formData.representing_regions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    representing_regions: e.target.value,
                  })
                }
                className="mt-1"
                placeholder="e.g., Asia"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a single region. Multiple regions can be managed separately.
              </p>
            </div>

            {/* Default Super Agent ID */}
            <div>
              <Label htmlFor="default_super_agent_id">
                Default Super Agent ID
              </Label>
              <Input
                id="default_super_agent_id"
                type="number"
                value={formData.default_super_agent_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_super_agent_id: e.target.value,
                  })
                }
                className="mt-1"
                placeholder="e.g., 1"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setEditDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {updateMutation.isPending ? "Updating..." : "Update Agreement"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
