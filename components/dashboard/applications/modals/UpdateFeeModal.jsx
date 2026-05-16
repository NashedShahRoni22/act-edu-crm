"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const installmentTypeOptions = [
  "Full Fee",
  "Per Year",
  "Per Month",
  "Per Term",
  "Per Trimester",
  "Per Semester",
  "Per Week",
  "Installment",
];

const feeTypeOptions = [
  "Accommodation Fee",
  "Administration Fee",
  "Airline Ticket",
  "Airport Transfter Fee",
  "Application Fee",
  "Bond",
  "Exam Fee",
  "Date Change Fee",
  "Extra Fee",
  "FCE Exam Fee",
  "Health Cover",
  "i20 Fee",
  "Installment Fee",
  "Key Deposit Fee",
  "Late Payment Fee",
  "Material Deposit",
  "Material Fee",
  "Medical Exam",
  "Placement Fee",
  "Security Deposit Fee",
  "Service Fee",
  "Swipe Card Fee",
  "Training Fee",
  "Transaction Fee",
  "Translation Fee",
  "Travel Insurance",
  "Visa Process",
  "RMA Fee",
  "Registered Migration Agent Fee",
  "Enrollment Fee",
];

function buildInitialFormState(feeInfo = {}) {
  const feeDetails = feeInfo?.fee_details || feeInfo || {};

  return {
    fee_option_name: feeDetails?.fee_option_name || "",
    country_of_residency: feeDetails?.country_of_residency || "",
    installment_type: feeDetails?.installment_type || "",
    fee_type: feeDetails?.fee_type || "",
    installment_amount: feeDetails?.installment_amount || "",
    installments_count: feeDetails?.installments_count || "",
    discount_amount: feeDetails?.discount_amount || "",
    income_payable: feeDetails?.income_payable || "",
  };
}

function FeeForm({
  applicationId,
  contactId,
  accessToken,
  onOpenChange,
  queryClient,
  feeInfo,
}) {
  const [formState, setFormState] = useState(() => buildInitialFormState(feeInfo));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (
        !formState.fee_option_name ||
        !formState.country_of_residency ||
        !formState.installment_type ||
        !formState.fee_type ||
        !formState.installment_amount ||
        !formState.installments_count
      ) {
        throw new Error("All required fee fields must be filled");
      }

      const formData = new FormData();
      formData.append("fee_option_name", formState.fee_option_name);
      formData.append("country_of_residency", formState.country_of_residency);
      formData.append("installment_type", formState.installment_type);
      formData.append("fee_type", formState.fee_type);
      formData.append("installment_amount", formState.installment_amount);
      formData.append("installments_count", formState.installments_count);

      if (formState.discount_amount !== "") {
        formData.append("discount_amount", formState.discount_amount);
      }

      if (formState.income_payable !== "") {
        formData.append("income_payable", formState.income_payable);
      }

      const response = await postWithToken(
        `/applications/${applicationId}/fees`,
        formData,
        accessToken,
      );

      if (response?.status !== "success") {
        throw new Error(response?.message || "Failed to store fee information");
      }

      return response;
    },
    onSuccess: async () => {
      toast.success("Fee information stored successfully");
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
      toast.error(error?.message || "Failed to store fee information");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fee_option_name">Fee option name</Label>
        <Input
          id="fee_option_name"
          value={formState.fee_option_name}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              fee_option_name: event.target.value,
            }))
          }
          placeholder="Semester Fee"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country_of_residency">Country of residency</Label>
        <Input
          id="country_of_residency"
          value={formState.country_of_residency}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              country_of_residency: event.target.value,
            }))
          }
          placeholder="Bangladesh"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="installment_type">Installment type</Label>
          <Select
            value={formState.installment_type}
            onValueChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                installment_type: value,
              }))
            }
          >
            <SelectTrigger id="installment_type" className="w-full">
              <SelectValue placeholder="Select installment type" />
            </SelectTrigger>
            <SelectContent>
              {installmentTypeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee_type">Fee type</Label>
          <Select
            value={formState.fee_type}
            onValueChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                fee_type: value,
              }))
            }
          >
            <SelectTrigger id="fee_type" className="w-full">
              <SelectValue placeholder="Select fee type" />
            </SelectTrigger>
            <SelectContent>
              {feeTypeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="installment_amount">Installment amount</Label>
          <Input
            id="installment_amount"
            type="number"
            step="0.01"
            min="0"
            value={formState.installment_amount}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                installment_amount: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installments_count">Installments count</Label>
          <Input
            id="installments_count"
            type="number"
            step="1"
            min="1"
            value={formState.installments_count}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                installments_count: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="discount_amount">Discount amount</Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            min="0"
            value={formState.discount_amount}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                discount_amount: event.target.value,
              }))
            }
            placeholder="500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="income_payable">Income payable</Label>
          <Input
            id="income_payable"
            type="number"
            step="0.01"
            min="0"
            value={formState.income_payable}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                income_payable: event.target.value,
              }))
            }
            placeholder="15000"
          />
        </div>
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
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function UpdateFeeModal({
  open,
  onOpenChange,
  applicationId,
  contactId,
  feeInfo,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Fee Options</DialogTitle>
          <DialogDescription>
            Edit the fee options for this application.
          </DialogDescription>
        </DialogHeader>
        <FeeForm
          key={`${applicationId}-${open ? "open" : "closed"}`}
          applicationId={applicationId}
          contactId={contactId}
          accessToken={accessToken}
          onOpenChange={onOpenChange}
          queryClient={queryClient}
          feeInfo={feeInfo}
        />
      </DialogContent>
    </Dialog>
  );
}