"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, User, ArrowRight, RotateCcw } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";

function ActivitiesSkeleton() {
  return (
    <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gray-100">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="relative flex items-start gap-4 animate-pulse"
        >
          <div className="relative z-10 w-8 h-8 rounded-full bg-gray-200 border-2 border-white shrink-0" />
          <div className="flex-1 min-w-0 pt-1.5 space-y-2">
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatContextText(contextString) {
  if (!contextString) return [];
  return contextString.split("\n");
}

function ChangesBlock({ changes }) {
  if (!changes) return null;

  const isRevert = changes.transition_type === "revert";

  return (
    <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2.5">
      {/* Stage transition */}
      {(changes.from_stage || changes.to_stage) && (
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {changes.from_stage && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
              {changes.from_stage}
            </span>
          )}
          {changes.from_stage &&
            changes.to_stage &&
            (isRevert ? (
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            ))}
          {changes.to_stage && (
            <span className="px-2 py-0.5 rounded-md bg-[#3B4CB8]/10 text-[#3B4CB8] text-xs font-medium">
              {changes.to_stage}
            </span>
          )}
          {changes.transition_type && (
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                isRevert
                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                  : "bg-green-50 text-green-600 border border-green-100"
              }`}
            >
              {changes.transition_type}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {changes.notes && (
        <p className="text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span className="font-medium text-gray-600">Note: </span>
          {changes.notes}
        </p>
      )}
    </div>
  );
}

export default function ContactActivitiesTab({ contactId }) {
  const { accessToken } = useAppContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contacts/${contactId}/activities`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  if (isLoading) return <ActivitiesSkeleton />;

  if (isError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
        Failed to load activity logs.
      </div>
    );
  }

  const activities = data?.data || [];

  if (!activities.length) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
        No activity logs found for this contact.
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gray-100">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="relative flex items-start gap-4 group"
        >
          <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#3B4CB8]/30 transition-colors">
            <User className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3B4CB8] transition-colors" />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1.5">
              <span className="font-medium text-sm text-gray-900">
                {activity.causer_name}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{activity.date}</span>
              </div>
            </div>

            {/* Context lines */}
            {activity.context && (
              <div className="text-sm text-gray-600">
                {formatContextText(activity.context).map((line, idx) => (
                  <p
                    key={idx}
                    className={idx !== 0 ? "mt-0.5 text-xs text-gray-400" : ""}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Changes block */}
            <ChangesBlock changes={activity.changes} />
          </div>
        </div>
      ))}
    </div>
  );
}
