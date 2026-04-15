"use client";

import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { Calendar, User, Workflow, FileText } from "lucide-react";
import Link from "next/link";

function ApplicationsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusBadgeStyle(status) {
  switch (status?.toLowerCase()) {
    case "in progress":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "completed":
      return "bg-green-50 text-green-700 border border-green-200";
    case "discontinued":
      return "bg-red-50 text-red-700 border border-red-200";
    case "on hold":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PartnerApplicationsTab({ partnerId }) {
  const { accessToken } = useAppContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partners/${partnerId}/applications`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId,
  });

  if (isLoading) return <ApplicationsSkeleton />;

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-600">
        Failed to load applications.
      </div>
    );
  }

  const applications = data?.data || [];

  if (applications.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No applications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Application
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Workflow
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Current Stage
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Started
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application, idx) => (
            <tr
              key={application.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    #{application.id}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <Link
                  href={`/dashboard/contacts/${application.contact.id}`}
                  className="text-[#3B4CB8] hover:underline font-medium"
                >
                  {application.contact.first_name}{" "}
                  {application.contact.last_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {application.workflow?.name || "-"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {application.current_stage?.name || "-"}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {application.owner?.first_name}{" "}
                    {application.owner?.last_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(application.started_at)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
