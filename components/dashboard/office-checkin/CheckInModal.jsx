"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";

export default function CheckInModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { accessToken } = useAppContext();

  const [formData, setFormData] = useState({
    // agency_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    visit_purpose: "",
    additional_info: "",
  });

  // const { data: officesData } = useQuery({
  //   queryKey: ["/offices", accessToken],
  //   queryFn: fetchWithToken,
  //   enabled: !!isOpen && !!accessToken,
  // });

  // const offices = officesData?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        fd.append(key, value);
      });
      return postWithToken("/kiosk/check-in", fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        toast.success(res.message || "Check-in successful!");
        queryClient.invalidateQueries(["check-ins"]);
        onClose();
        setFormData({
          // agency_id: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          visit_purpose: "",
          additional_info: "",
        });
      } else {
        toast.error(res?.message || "Check-in failed");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "An error occurred");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kiosk Check-In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="agency_id">Office (Agency) </Label>
            <select
              id="agency_id"
              name="agency_id"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.agency_id}
              onChange={handleChange}
            >
              <option value="" disabled>Select Office</option>
              {offices.map((office) => (
                <option
                 key={office.id} 
                 value={office.id}
                 >
                  {office.name || office.title || `Office ${office.id}`}
                </option>
              ))}
            </select>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit_purpose">Purpose of Visit</Label>
            <Input
              id="visit_purpose"
              name="visit_purpose"
              value={formData.visit_purpose}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_info">Additional Info</Label>
            <Textarea
              id="additional_info"
              name="additional_info"
              value={formData.additional_info}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="text-white"
            >
              {mutation.isPending ? "Checking In..." : "Check In"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
