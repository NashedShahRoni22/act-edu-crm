"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AppointmentDialog({ contactId, users = [], onCreated }) {
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

  const createAppointmentMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken(`/contact/${contactId}/appointments`, fd, accessToken),
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
        // Allow parent to handle additional invalidation if needed
        if (typeof onCreated === "function") onCreated(res);
        // local invalidation for safety
        queryClient.invalidateQueries({ queryKey: [`/contact/${contactId}/appointments`] });
        queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/activities`] });
      } else {
        toast.error(res.message || "Failed to create appointment");
      }
    },
    onError: () => toast.error("Failed to create appointment"),
  });

  const toggleInvitee = (userId) => {
    setSelectedInvitees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
    if (newAppointment.description.trim()) fd.append("description", newAppointment.description);
    selectedInvitees.forEach((inviteeId, idx) => fd.append(`invitees[${idx}]`, inviteeId));

    createAppointmentMutation.mutate(fd);
  };

  return (
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
          <DialogDescription>Create a new appointment for this contact.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input id="title" placeholder="e.g., Client Meeting" value={newAppointment.title} onChange={(e)=>setNewAppointment(prev=>({...prev,title:e.target.value}))} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={newAppointment.date} onChange={(e)=>setNewAppointment(prev=>({...prev,date:e.target.value}))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={newAppointment.time} onChange={(e)=>setNewAppointment(prev=>({...prev,time:e.target.value}))} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select id="timezone" value={newAppointment.timezone} onChange={(e)=>setNewAppointment(prev=>({...prev,timezone:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
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
            <Textarea id="description" placeholder="Add any additional notes or details..." value={newAppointment.description} onChange={(e)=>setNewAppointment(prev=>({...prev,description:e.target.value}))} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Invitees</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {selectedInvitees.length > 0 ? `${selectedInvitees.length} selected` : "Select invitees..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-3">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Select Invitees</p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input type="checkbox" checked={selectedInvitees.includes(user.id)} onChange={()=>toggleInvitee(user.id)} className="w-4 h-4 rounded border-gray-300 text-[#3B4CB8]" />
                          <span className="text-sm text-gray-700">{user.first_name} {user.last_name}</span>
                          {user.email && <span className="text-xs text-gray-500">({user.email})</span>}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 py-2">No users available</p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {selectedInvitees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedInvitees.map((inviteeId) => {
                  const user = users.find((u) => String(u.id) === String(inviteeId));
                  return user ? (
                    <span key={inviteeId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {user.first_name} {user.last_name}
                      <button type="button" onClick={()=>setSelectedInvitees(prev=>prev.filter((id)=>id!==inviteeId))} className="ml-1 text-blue-700 hover:text-blue-900 font-bold">×</button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white" disabled={createAppointmentMutation.isPending}>
              {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
