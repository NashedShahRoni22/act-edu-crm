"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Globe,
  FileText,
  Loader2,
  Edit2,
  Workflow,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PartnerViewDialog({ open, onOpenChange, partner, onEdit }) {
  const { accessToken } = useAppContext();

  // Fetch full partner details
  const { data, isLoading } = useQuery({
    queryKey: [`/partners/${partner?.id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partner?.id && open,
  });

  const partnerData = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {partnerData?.logo ? (
              <img
                src={partnerData.logo}
                alt={partnerData.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#3B4CB8] flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {partnerData?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="text-lg font-semibold">{partnerData?.name}</div>
              {partnerData?.master_category?.name && (
                <span className="text-xs text-gray-500">
                  {partnerData.master_category.name}
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>Partner details and information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : partnerData ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3B4CB8]" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                {partnerData.partner_type?.name && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Partner Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {partnerData.partner_type.name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Currency</p>
                  <p className="text-sm font-medium text-gray-900">
                    {partnerData.currency}
                  </p>
                </div>
                {partnerData.business_registration_number && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Registration Number
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {partnerData.business_registration_number}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Show on Invoice</p>
                  <p className="text-sm font-medium text-gray-900">
                    {partnerData.show_on_invoice ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {(partnerData.email ||
              partnerData.phone ||
              partnerData.website ||
              partnerData.fax) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-[#3B4CB8]" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {partnerData.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {partnerData.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {partnerData.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {partnerData.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {partnerData.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Website</p>
                        <a
                          href={partnerData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#3B4CB8] hover:underline"
                        >
                          {partnerData.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {partnerData.fax && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Fax</p>
                        <p className="text-sm font-medium text-gray-900">
                          {partnerData.fax}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address */}
            {(partnerData.street ||
              partnerData.city ||
              partnerData.state ||
              partnerData.country) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3B4CB8]" />
                  Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {partnerData.street && (
                    <p className="text-sm text-gray-900">{partnerData.street}</p>
                  )}
                  <p className="text-sm text-gray-900">
                    {[
                      partnerData.city,
                      partnerData.state,
                      partnerData.zip_code,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {partnerData.country && (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {partnerData.country}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Workflows */}
            {partnerData.workflow_display && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#3B4CB8]" />
                  Workflows
                </h3>
                <div className="flex flex-wrap gap-2">
                  {partnerData.workflow_display.split(", ").map((workflow, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#3B4CB8]/10 text-[#3B4CB8] rounded-full text-xs font-medium"
                    >
                      {workflow}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Branches */}
            {partnerData.branches && partnerData.branches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3B4CB8]" />
                  Branches
                </h3>
                <div className="space-y-3">
                  {partnerData.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {branch.name}
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {branch.email && <p>Email: {branch.email}</p>}
                        {branch.city && branch.country && (
                          <p>
                            Location: {branch.city}, {branch.country}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#EEF2FF] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {partnerData.products_count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Products</p>
                </div>
                <div className="bg-[#ECFDF5] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {partnerData.enrolled_count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Enrolled</p>
                </div>
                <div className="bg-[#FFFBEB] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {partnerData.in_progress_count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            No partner data available
          </div>
        )}

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {partnerData?.is_editable && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onOpenChange(false);
                onEdit(partnerData);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Partner
            </motion.button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}