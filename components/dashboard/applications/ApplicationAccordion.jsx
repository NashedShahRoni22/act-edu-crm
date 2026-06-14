"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { toast } from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ApplicationDetailTabs from "./ApplicationDetailTabs";
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Pencil,
  X,
  Check,
} from "lucide-react";
import ApplicationInformations from "./ApplicationInformations";
import { useState } from "react";

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

export default function ApplicationAccordion({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [editingAppId, setEditingAppId] = useState(null);
  const [editPartnerClientId, setEditPartnerClientId] = useState("");

  // Add this mutation alongside updateStatusMutation:
  const updatePartnerClientIdMutation = useMutation({
    mutationFn: async ({ applicationId, partnerClientId }) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("partner_client_id", partnerClientId);
      return postWithToken(
        `/applications/${applicationId}/partner-client-id`,
        fd,
        accessToken,
      );
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}/applications`],
        });
        toast.success(res.message || "Partner client ID updated");
        setEditingAppId(null);
      } else {
        toast.error(res?.message || "Failed to update partner client ID");
      }
    },
    onError: () => toast.error("Failed to update partner client ID"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("status", status);
      return postWithToken(
        `/applications/${applicationId}/status`,
        fd,
        accessToken,
      );
    },
    onSuccess: (res, variables) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}/applications`],
        });
        toast.success(
          res.message || `Application status updated to ${variables.status}`,
        );
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    },
    onError: () => toast.error("Failed to update status"),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contacts/${contactId}/applications`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!contactId,
  });

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
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white border border-gray-100 rounded-xl"
    >
      {applications.map((application) => {
        const getStatusIcon = (status) => {
          switch (status?.toLowerCase()) {
            case "completed":
              return <CheckCircle className="w-4 h-4 text-green-600" />;
            case "pending":
              return <Clock className="w-4 h-4 text-yellow-600" />;
            case "in progress":
              return <TrendingUp className="w-4 h-4 text-blue-600" />;
            case "discontinued":
              return <AlertCircle className="w-4 h-4 text-red-600" />;
            default:
              return <Clock className="w-4 h-4 text-gray-600" />;
          }
        };

        const getStatusColor = (status) => {
          switch (status?.toLowerCase()) {
            case "completed":
              return "bg-green-50 text-green-700 border border-green-200";
            case "pending":
              return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "in progress":
              return "bg-blue-50 text-blue-700 border border-blue-200";
            case "discontinued":
              return "bg-red-50 text-red-700 border border-red-200";
            default:
              return "bg-gray-50 text-gray-700 border border-gray-200";
          }
        };

        return (
          <AccordionItem
            key={application.id}
            value={`app-${application.id}`}
            className="border-b border-gray-100 last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-gray-50 transition-colors group">
              <div className="flex flex-1 flex-col gap-3 pr-4 text-left">
                {/* Header Row - Title and ID */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex gap-4 items-center">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Application ID: {application.id}
                    </h4>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingAppId === application.id ? (
                        <>
                          <input
                            type="text"
                            value={editPartnerClientId}
                            onChange={(e) =>
                              setEditPartnerClientId(e.target.value)
                            }
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-800 w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={updatePartnerClientIdMutation.isPending}
                            onClick={() =>
                              updatePartnerClientIdMutation.mutate({
                                applicationId: application.id,
                                partnerClientId: editPartnerClientId,
                              })
                            }
                            className="text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
                          >
                            {updatePartnerClientIdMutation.isPending ? (
                              <span className="w-3.5 h-3.5 animate-spin border border-current border-t-transparent rounded-full inline-block" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAppId(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-gray-900">
                            Partner's Client ID:{" "}
                            {application.partner_client_id || (
                              <span className="text-gray-400 font-normal">
                                —
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAppId(application.id);
                              setEditPartnerClientId(
                                application.partner_client_id ?? "",
                              );
                            }}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-colors hover:brightness-95 ${getStatusColor(application.status)}`}
                        >
                          {updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.applicationId ===
                            application.id ? (
                            <span className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            getStatusIcon(application.status)
                          )}
                          {application.status || "Unknown"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1" align="end">
                        {[
                          "Pending",
                          "In Progress",
                          "Completed",
                          "Discontinued",
                        ].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              if (application.status !== s) {
                                updateStatusMutation.mutate({
                                  applicationId: application.id,
                                  status: s,
                                });
                              }
                            }}
                            disabled={
                              updateStatusMutation.isPending ||
                              application.status === s
                            }
                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-between"
                          >
                            {s}
                            {application.status === s && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Details Grid Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                  {/* Workflow */}
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide text-[10px] font-medium mb-1">
                      Workflow
                    </p>
                    <p className="text-gray-700 font-medium">
                      {application.workflow?.name || "—"}
                    </p>
                  </div>

                  {/* Partner */}
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide text-[10px] font-medium mb-1">
                      Partner
                    </p>
                    <p className="text-gray-700 font-medium">
                      {application.courses?.[0]?.partner?.name || "—"}
                    </p>
                  </div>

                  {/* Product */}
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide text-[10px] font-medium mb-1">
                      Product
                    </p>
                    <p className="text-gray-700 font-medium">
                      {application.courses?.[0]?.product?.name || "—"}
                    </p>
                  </div>

                  {/* Stage */}
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide text-[10px] font-medium mb-1">
                      Stage
                    </p>
                    <p className="text-gray-700 font-medium">
                      {application?.current_stage_name || "—"}
                    </p>
                  </div>

                  {/* Started Date */}
                  <div className="flex gap-2">
                    <div className="w-4 h-4 text-blue-600 shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-[10px] font-medium mb-1">
                        Started
                      </p>
                      <p className="text-gray-700 font-medium">
                        {formatDate(application.started_at)}
                      </p>
                    </div>
                  </div>

                  {/* Updated Date */}
                  <div className="flex gap-2">
                    <div className="w-4 h-4 text-gray-600 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-[10px] font-medium mb-1">
                        Updated
                      </p>
                      <p className="text-gray-700 font-medium">
                        {formatDate(application.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pt-2 pb-4 bg-gray-50">
              <div className="flex gap-4">
                <ApplicationDetailTabs
                  applicationId={application.id}
                  application={application}
                  contactId={contactId}
                />

                <ApplicationInformations
                  application={application}
                  contactId={contactId}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
