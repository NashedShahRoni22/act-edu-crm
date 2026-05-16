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

export default function UpdateForecastModal({
  open,
  onOpenChange,
  applicationId,
  contactId,
  forecastInfo,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    forecast_client_revenue: "",
    forecast_partner_revenue: "",
    forecast_discount: "",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState({
      forecast_client_revenue: forecastInfo?.client_revenue || "",
      forecast_partner_revenue: forecastInfo?.partner_revenue || "",
      forecast_discount: forecastInfo?.discount || "",
    });
  }, [forecastInfo, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formState.forecast_client_revenue || !formState.forecast_partner_revenue || !formState.forecast_discount) {
        throw new Error("All forecast fields are required");
      }

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("forecast_client_revenue", formState.forecast_client_revenue);
      formData.append("forecast_partner_revenue", formState.forecast_partner_revenue);
      formData.append("forecast_discount", formState.forecast_discount);

      const response = await postWithToken(
        `/applications/${applicationId}/forecast`,
        formData,
        accessToken,
      );

      if (response?.status !== "success") {
        throw new Error(response?.message || "Failed to update forecast");
      }

      return response;
    },
    onSuccess: async () => {
      toast.success("Forecast updated successfully");
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
      toast.error(error?.message || "Failed to update forecast");
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
          <DialogTitle>Update Forecast</DialogTitle>
          <DialogDescription>
            Update the sales forecast values for this application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forecast_client_revenue">Client revenue</Label>
            <Input
              id="forecast_client_revenue"
              type="number"
              step="0.01"
              min="0"
              value={formState.forecast_client_revenue}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  forecast_client_revenue: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecast_partner_revenue">Partner revenue</Label>
            <Input
              id="forecast_partner_revenue"
              type="number"
              step="0.01"
              min="0"
              value={formState.forecast_partner_revenue}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  forecast_partner_revenue: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecast_discount">Discount</Label>
            <Input
              id="forecast_discount"
              type="number"
              step="0.01"
              min="0"
              value={formState.forecast_discount}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  forecast_discount: event.target.value,
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