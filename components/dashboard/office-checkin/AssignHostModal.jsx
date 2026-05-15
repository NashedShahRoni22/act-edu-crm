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
import { Label } from "@/components/ui/label";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";

export default function AssignHostModal({ isOpen, onClose, checkInId }) {
  const queryClient = useQueryClient();
  const { accessToken } = useAppContext();
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!isOpen && !!accessToken,
  });

  const users = usersData?.data || [];

  const assignMutation = useMutation({
    mutationFn: (assigneeId) => {
      const fd = new FormData();
      fd.append("assignee_id", assigneeId);
      fd.append("_method", "PUT");
      return postWithToken(`/check-ins/${checkInId}/assign`, fd, accessToken);
    },
    onSuccess: () => {
      toast.success("Host assigned successfully");
      queryClient.invalidateQueries(["check-ins"]);
      onClose();
      setSelectedAssignee("");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to assign host");
    },
  });

  const handleAssign = () => {
    if (!selectedAssignee) {
      toast.error("Please select a host");
      return;
    }
    assignMutation.mutate(selectedAssignee);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Host</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">Select Host</Label>
            <select
              id="assignee"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              disabled={usersLoading || assignMutation.isPending}
            >
              <option value="">Choose a host...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={assignMutation.isPending || !selectedAssignee}
              className="text-white"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Host"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}