"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, User, MapPin } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import AppointmentDialog from "./AppointmentDialog";

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDateTime(dateString, timeString) {
  if (!dateString || !timeString) return "-";
  const date = new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  // Convert 24-hour format to 12-hour format if needed
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayTime = `${String(displayHour).padStart(2, "0")}:${minutes} ${ampm}`;
  return `${date} @ ${displayTime}`;
}

function formatScheduledDateTime(isoDateTime) {
  if (!isoDateTime) return "-";
  const date = new Date(isoDateTime);
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr} @ ${timeStr}`;
}

export default function ContactAppointmentsTab({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contact/${contactId}/appointments`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: usersData } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const users = usersData?.data || [];
  const appointments = data?.data || [];

  const getUserById = (userId) => users.find((user) => String(user.id) === String(userId));

  if (isLoading) return <AppointmentsSkeleton />;

  if (isError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
        Failed to load appointments.
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Appointments</h3>
          <p className="text-sm text-gray-500">
            {appointments.length} appointment{appointments.length === 1 ? "" : "s"}
          </p>
        </div>
        <AppointmentDialog
          contactId={contactId}
          users={users}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: [`/contact/${contactId}/appointments`, accessToken] });
            queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/activities`, accessToken] });
          }}
        />
      </div>

      {!appointments.length ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No appointments scheduled for this contact yet.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold text-gray-900">
                      {appointment.title}
                    </h4>
                    {appointment.status && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === "Scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : appointment.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : appointment.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    )}
                  </div>
                  {appointment.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {appointment.description}
                    </p>
                  )}
                  {appointment.added_by && (
                    <p className="text-xs text-gray-500 mt-2">
                      Created by {appointment.added_by.first_name}{" "}
                      {appointment.added_by.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{formatScheduledDateTime(appointment.scheduled_at)}</span>
                </div>

                {appointment.duration_minutes && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{appointment.duration_minutes} mins</span>
                  </div>
                )}

                {appointment.timezone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{appointment.timezone}</span>
                  </div>
                )}
              </div>

              {appointment.invitees && appointment.invitees.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Invitees</p>
                  <div className="flex flex-wrap gap-2">
                    {appointment.invitees.map((inviteeId) => {
                      const user = getUserById(inviteeId);
                      return user ? (
                        <span
                          key={inviteeId}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          <User className="w-3 h-3" />
                          {user.first_name} {user.last_name}
                        </span>
                      ) : (
                        <span
                          key={inviteeId}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700"
                        >
                          <User className="w-3 h-3" />
                          User #{inviteeId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
