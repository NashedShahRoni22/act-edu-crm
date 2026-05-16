"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAppContext } from "@/context/context";
import { postWithToken } from "@/helpers/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

export default function UpdateIntakeModal({
  open,
  onOpenChange,
  applicationId,
  contactId,
  intakeInfo,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    applied_intake_date: "",
    intake_start_date: "",
    intake_end_date: "",
    expected_win_date: "",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState({
      applied_intake_date: toDateInputValue(intakeInfo?.applied_intake_date),
      intake_start_date: toDateInputValue(intakeInfo?.start_date),
      intake_end_date: toDateInputValue(intakeInfo?.end_date),
      expected_win_date: toDateInputValue(intakeInfo?.expected_win_date),
    });
  }, [intakeInfo, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("_method", "PUT");

      if (formState.applied_intake_date) {
        formData.append("applied_intake_date", formState.applied_intake_date);
      }

      if (formState.intake_start_date) {
        formData.append("intake_start_date", formState.intake_start_date);
      }

      if (formState.intake_end_date) {
        formData.append("intake_end_date", formState.intake_end_date);
      }

      if (formState.expected_win_date) {
        formData.append("expected_win_date", formState.expected_win_date);
      }

      const response = await postWithToken(
        `/applications/${applicationId}/intake`,
        formData,
        accessToken,
      );

      if (response?.status !== "success") {
        throw new Error(response?.message || "Failed to update intake");
      }

      return response;
    },
    onSuccess: async () => {
      toast.success("Intake updated successfully");
      onOpenChange(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["/applications", accessToken],
        }),
        contactId
          ? queryClient.invalidateQueries({
              queryKey: [`/contacts/${contactId}/applications`, accessToken],
            })
          : Promise.resolve(),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update intake");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Intake</DialogTitle>
          <DialogDescription>
            Update the application intake dates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applied_intake_date">Applied intake date</Label>
            <Input
              id="applied_intake_date"
              type="date"
              value={formState.applied_intake_date}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  applied_intake_date: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="intake_start_date">Intake start date</Label>
              <Input
                id="intake_start_date"
                type="date"
                value={formState.intake_start_date}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    intake_start_date: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intake_end_date">Intake end date</Label>
              <Input
                id="intake_end_date"
                type="date"
                value={formState.intake_end_date}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    intake_end_date: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_win_date">Expected win date</Label>
            <Input
              id="expected_win_date"
              type="date"
              value={formState.expected_win_date}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  expected_win_date: event.target.value,
                }))
              }
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}