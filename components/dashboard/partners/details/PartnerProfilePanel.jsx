"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle,
  Clock,
  Workflow,
} from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 wrap-break-word">{value || "-"}</p>
      </div>
    </div>
  );
}

function PartnerProfilePanelSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100" />
            <div className="space-y-2 w-full">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnerProfilePanel({ partnerId }) {
  const { accessToken } = useAppContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partners/${partnerId}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  if (isLoading) return <PartnerProfilePanelSkeleton />;

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-6 text-sm text-red-600">
        Failed to load partner details.
      </div>
    );
  }

  const partner = data?.data;

  if (!partner) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500">
        Partner details are not available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#3B4CB8] flex items-center justify-center shrink-0">
          {partner.logo ? (
            <img
              src={partner.logo}
              alt={partner.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-white text-2xl font-bold">
              {partner.name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {partner.name}
          </h2>
          {partner.master_category?.name && (
            <p className="text-sm text-gray-500 mt-1">
              {partner.master_category.name}
            </p>
          )}
          {partner.partner_type?.name && (
            <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
              {partner.partner_type.name}
            </span>
          )}
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#3B4CB8]" />
          Basic Information
        </h3>
        {partner.currency && (
          <DetailRow icon={Globe} label="Currency" value={partner.currency} />
        )}
        {partner.business_registration_number && (
          <DetailRow
            icon={FileText}
            label="Registration Number"
            value={partner.business_registration_number}
          />
        )}
        <DetailRow
          icon={CheckCircle}
          label="Show on Invoice"
          value={partner.show_on_invoice ? "Yes" : "No"}
        />
        {partner.is_editable && (
          <DetailRow
            icon={CheckCircle}
            label="Editable"
            value={partner.is_editable ? "Yes" : "No"}
          />
        )}
      </div>

      {/* Contact Information Section */}
      {(partner.email || partner.phone || partner.website || partner.fax) && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#3B4CB8]" />
            Contact Information
          </h3>
          {partner.email && (
            <DetailRow icon={Mail} label="Email" value={partner.email} />
          )}
          {partner.phone && (
            <DetailRow icon={Phone} label="Phone" value={partner.phone} />
          )}
          {partner.fax && (
            <DetailRow icon={Phone} label="Fax" value={partner.fax} />
          )}
          {partner.website && (
            <DetailRow icon={Globe} label="Website" value={partner.website} />
          )}
        </div>
      )}

      {/* Address Section */}
      {(partner.street ||
        partner.city ||
        partner.state ||
        partner.zip_code ||
        partner.country) && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#3B4CB8]" />
            Address
          </h3>
          {partner.street && (
            <DetailRow icon={MapPin} label="Street" value={partner.street} />
          )}
          {partner.city && (
            <DetailRow icon={MapPin} label="City" value={partner.city} />
          )}
          {partner.state && (
            <DetailRow icon={MapPin} label="State" value={partner.state} />
          )}
          {partner.zip_code && (
            <DetailRow icon={MapPin} label="Zip Code" value={partner.zip_code} />
          )}
          {partner.country && (
            <DetailRow icon={Globe} label="Country" value={partner.country} />
          )}
        </div>
      )}

      {/* Workflows Section */}
      {partner.workflow_display && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#3B4CB8]" />
            Workflows
          </h3>
          <DetailRow
            icon={Workflow}
            label="Associated Workflows"
            value={partner.workflow_display}
          />
        </div>
      )}

      {/* Branches Section */}
      {partner.branches && partner.branches.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#3B4CB8]" />
            Branches ({partner.branches.length})
          </h3>
          <div className="space-y-3">
            {partner.branches.map((branch, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                {branch.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email: {branch.email}
                  </p>
                )}
                {(branch.city || branch.country) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[branch.city, branch.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {(partner.products_count !== undefined ||
        partner.enrolled_count !== undefined ||
        partner.in_progress_count !== undefined) && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Statistics</h3>
          <div className="grid grid-cols-3 gap-2">
            {partner.products_count !== undefined && (
              <div className="bg-[#EEF2FF] rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {partner.products_count}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Products</p>
              </div>
            )}
            {partner.enrolled_count !== undefined && (
              <div className="bg-[#ECFDF5] rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {partner.enrolled_count}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Enrolled</p>
              </div>
            )}
            {partner.in_progress_count !== undefined && (
              <div className="bg-[#FFFBEB] rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {partner.in_progress_count}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
