"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, User } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";

function ActivitiesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-3/5 bg-gray-100 rounded mb-3" />
          <div className="h-3 w-1/4 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function formatContextText(contextString) {
  if (!contextString) return null;
  const lines = contextString.split("\n");
  return lines;
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
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#3B4CB8]/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#3B4CB8]" />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-gray-900">{activity.causer_name}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
            </div>
          </div>

          {activity.context && (
            <div className="mb-3 ml-12 p-3 bg-gray-50 rounded-lg border border-gray-100">
              {formatContextText(activity.context).map((line, idx) => (
                <p key={idx} className="text-sm text-gray-700">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
