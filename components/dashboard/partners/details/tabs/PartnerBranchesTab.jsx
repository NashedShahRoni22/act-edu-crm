"use client";

import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { Building2, Mail, MapPin } from "lucide-react";

function BranchesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerBranchesTab({ partnerId }) {
  const { accessToken } = useAppContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partners/${partnerId}/branches`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId,
  });

  if (isLoading) return <BranchesSkeleton />;

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-600">
        Failed to load branches.
      </div>
    );
  }

  const branches = data?.data || [];

  if (branches.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No branches found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {branches.map((branch) => (
        <div
          key={branch.id}
          className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
        >
          {/* Branch Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#3B4CB8] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {branch.name}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Branch ID: {branch.id}
              </p>
            </div>
          </div>

          {/* Branch Details */}
          <div className="space-y-2">
            {/* Email */}
            {branch.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a
                  href={`mailto:${branch.email}`}
                  className="text-sm text-[#3B4CB8] hover:underline truncate"
                >
                  {branch.email}
                </a>
              </div>
            )}

            {/* Location */}
            {(branch.city || branch.country) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">
                  {[branch.city, branch.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
