"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, User, MapPin } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

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

export default function PartnerAppointmentsTab({ partnerId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    timezone: "Asia/Dhaka",
    date: "",
    time: "",
    title: "",
    description: "",
    invitees: [],
  });
  const [selectedInvitees, setSelectedInvitees] = useState([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partner/${partnerId}/appointments`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: usersData } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(
        `/partner/${partnerId}/appointments`,
        fd,
        accessToken,
      ),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Appointment created successfully");
        setDialogOpen(false);
        setNewAppointment({
          timezone: "Asia/Dhaka",
          date: "",
          time: "",
          title: "",
          description: "",
          invitees: [],
        });
        setSelectedInvitees([]);
        queryClient.invalidateQueries({
          queryKey: [`/partner/${partnerId}/appointments`, accessToken],
        });
      } else {
        toast.error(res.message || "Failed to create appointment");
      }
    },
    onError: () => toast.error("Failed to create appointment"),
  });

  const users = usersData?.data || [];
  const appointments = data?.data || [];

  const getUserById = (userId) => {
    return users.find((user) => String(user.id) === String(userId));
  };

  const toggleInvitee = (userId) => {
    setSelectedInvitees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();

    if (!newAppointment.date) {
      toast.error("Date is required");
      return;
    }
    if (!newAppointment.time) {
      toast.error("Time is required");
      return;
    }
    if (!newAppointment.title.trim()) {
      toast.error("Title is required");
      return;
    }

    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = newAppointment.time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const formattedTime = `${String(displayHour).padStart(2, "0")}:${minutes} ${ampm}`;

    const fd = new FormData();
    fd.append("timezone", newAppointment.timezone);
    fd.append("date", newAppointment.date);
    fd.append("time", formattedTime);
    fd.append("title", newAppointment.title);

    if (newAppointment.description.trim()) {
      fd.append("description", newAppointment.description);
    }

    selectedInvitees.forEach((inviteeId, idx) => {
      fd.append(`invitees[${idx}]`, inviteeId);
    });

    createAppointmentMutation.mutate(fd);
  };

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

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setNewAppointment({
                timezone: "Asia/Dhaka",
                date: "",
                time: "",
                title: "",
                description: "",
                invitees: [],
              });
              setSelectedInvitees([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white">
              <Plus className="w-4 h-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment for this partner.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Client Meeting"
                  value={newAppointment.title}
                  onChange={(e) =>
                    setNewAppointment((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">
                  Timezone <span className="text-red-500">*</span>
                </Label>
                <select
                  id="timezone"
                  value={newAppointment.timezone}
                  onChange={(e) =>
                    setNewAppointment((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8]"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Dhaka">Asia/Dhaka</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional notes or details..."
                  value={newAppointment.description}
                  onChange={(e) =>
                    setNewAppointment((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Invitees</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedInvitees.length > 0
                        ? `${selectedInvitees.length} selected`
                        : "Select invitees..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-3">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Select Invitees
                      </p>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {users.length > 0 ? (
                          users.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedInvitees.includes(user.id)}
                                onChange={() => toggleInvitee(user.id)}
                                className="w-4 h-4 rounded border-gray-300 text-[#3B4CB8]"
                              />
                              <span className="text-sm text-gray-700">
                                {user.first_name} {user.last_name}
                              </span>
                              {user.email && (
                                <span className="text-xs text-gray-500">
                                  ({user.email})
                                </span>
                              )}
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 py-2">
                            No users available
                          </p>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedInvitees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedInvitees.map((inviteeId) => {
                      const user = getUserById(inviteeId);
                      return user ? (
                        <span
                          key={inviteeId}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {user.first_name} {user.last_name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedInvitees((prev) =>
                                prev.filter((id) => id !== inviteeId),
                              )
                            }
                            className="ml-1 text-blue-700 hover:text-blue-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white"
                  disabled={createAppointmentMutation.isPending}
                >
                  {createAppointmentMutation.isPending
                    ? "Scheduling..."
                    : "Schedule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!appointments.length ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No appointments scheduled for this partner yet.
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
                  <h4 className="text-base font-semibold text-gray-900">
                    {appointment.title}
                  </h4>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    {formatDateTime(appointment.date, appointment.time)}
                  </span>
                </div>

                {appointment.timezone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
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
