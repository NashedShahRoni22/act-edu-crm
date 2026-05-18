"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Workflow,
  Building2,
  CheckCircle,
  Tag,
} from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { Badge } from "@/components/ui/badge";

function initials(name) {
  if (!name) return "";
  return name.slice(0, 2).toUpperCase();
}

function Skeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse shadow-sm">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="hidden md:flex gap-2">
          <div className="w-16 h-16 rounded-xl bg-gray-100" />
          <div className="w-16 h-16 rounded-xl bg-gray-100" />
        </div>
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

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-600 shadow-sm">
        Failed to load partner details.
      </div>
    );
  }

  const partner = data?.data;
  if (!partner) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500 shadow-sm">
        Partner details are not available.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          {/* Avatar + Identity */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-[#3B4CB8] flex items-center justify-center shrink-0 shadow-md">
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {initials(partner.name)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {partner.name}
                </h1>
                {partner.partner_type?.name && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                    {partner.partner_type.name}
                  </span>
                )}
                {partner.is_editable && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> Editable
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-1.5">
                {partner.email && (
                  <span className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </span>
                )}
                {partner.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {partner.phone}
                  </span>
                )}
                {partner.website && (
                  <a
                    href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    Website
                  </a>
                )}
              </div>

              {partner.master_category?.name && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="flex items-center gap-1 h-5 px-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    <Tag className="w-2.5 h-2.5" />
                    {partner.master_category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Statistics */}
          {(partner.products_count !== undefined || partner.enrolled_count !== undefined || partner.in_progress_count !== undefined) && (
            <div className="flex gap-2 shrink-0">
              {partner.products_count !== undefined && (
                <div className="bg-[#EEF2FF] rounded-xl px-4 py-2 text-center border border-[#E0E7FF] flex flex-col justify-center min-w-20">
                  <p className="text-xl font-bold text-[#3B4CB8] leading-none mb-1">{partner.products_count}</p>
                  <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">Products</p>
                </div>
              )}
              {partner.enrolled_count !== undefined && (
                <div className="bg-[#ECFDF5] rounded-xl px-4 py-2 text-center border border-[#D1FAE5] flex flex-col justify-center min-w-20">
                  <p className="text-xl font-bold text-emerald-600 leading-none mb-1">{partner.enrolled_count}</p>
                  <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Enrolled</p>
                </div>
              )}
              {partner.in_progress_count !== undefined && (
                <div className="bg-[#FFFBEB] rounded-xl px-4 py-2 text-center border border-[#FEF3C7] flex flex-col justify-center min-w-20">
                  <p className="text-xl font-bold text-amber-600 leading-none mb-1">{partner.in_progress_count}</p>
                  <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">In Progress</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer meta strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
          {(partner.city || partner.country) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {[partner.city, partner.country].filter(Boolean).join(", ")}
            </span>
          )}
          {partner.business_registration_number && (
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Reg: <span className="font-mono text-gray-600">{partner.business_registration_number}</span>
            </span>
          )}
          {partner.workflow_display && (
            <span className="flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-gray-400" />
              Workflow: <span className="font-medium text-gray-600">{partner.workflow_display}</span>
            </span>
          )}
          {partner.branches && partner.branches.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium text-gray-600">{partner.branches.length}</span> Branches
            </span>
          )}
          {partner.currency && (
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400">¤</span>
              Currency: <span className="font-medium text-gray-600">{partner.currency}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
