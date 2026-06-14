"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import SectionContainer from "../SectionContainer";
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CreateGroupInvoicePage() {
  const { accessToken } = useAppContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    partner_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date().toISOString().split("T")[0],
    payment_option: "",
  });

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);

  // Fetch partners
  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: () =>
      fetchWithToken({
        queryKey: [`/partners?per_page=100`, accessToken],
      }),
    enabled: !!accessToken,
  });

  const partners = partnersData?.data?.data || (Array.isArray(partnersData?.data) ? partnersData?.data : []);

  // Fetch unpaid invoices when partner is selected
  const { data: unpaidInvoicesData, isLoading: isLoadingUnpaid } = useQuery({
    queryKey: ["/group-invoices/eligible-unpaid", formData.partner_id, accessToken],
    queryFn: () =>
      fetchWithToken({
        queryKey: [
          `/group-invoices/eligible-unpaid?partner_type=partner&partner_id=${formData.partner_id}`,
          accessToken,
        ],
      }),
    enabled: !!accessToken && !!formData.partner_id,
  });

  const unpaidInvoices = unpaidInvoicesData?.data || [];

  // Handle partner change
  const handlePartnerChange = (e) => {
    setFormData({ ...formData, partner_id: e.target.value });
    setSelectedInvoiceIds([]); // Reset selected invoices when partner changes
  };

  const handleOpenModal = () => {
    if (!formData.partner_id) {
      toast.error("Please select a partner first.");
      return;
    }
    setTempSelectedIds([...selectedInvoiceIds]);
    setIsModalOpen(true);
  };

  const handleToggleInvoice = (id, checked) => {
    if (checked) {
      setTempSelectedIds((prev) => [...prev, id]);
    } else {
      setTempSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleConfirmSelection = () => {
    setSelectedInvoiceIds(tempSelectedIds);
    setIsModalOpen(false);
  };

  const handleRemoveSelectedInvoice = (id) => {
    setSelectedInvoiceIds((prev) => prev.filter((i) => i !== id));
  };

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await postWithToken("/group-invoices", payload, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Group invoice created successfully");
        queryClient.invalidateQueries({ queryKey: ["/group-invoices"] });
        router.push("/dashboard/group-invoice");
      } else {
        toast.error(res.message || "Failed to create group invoice");
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "An error occurred");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.partner_id) return toast.error("Partner is required.");
    if (!formData.invoice_date) return toast.error("Invoice date is required.");
    if (!formData.due_date) return toast.error("Due date is required.");
    if (!formData.payment_option) return toast.error("Payment option is required.");
    if (selectedInvoiceIds.length === 0) return toast.error("Please select at least one invoice.");

    const payload = new FormData();
    payload.append("partner_type", "partner");
    payload.append("partner_id", formData.partner_id);
    payload.append("invoice_date", formData.invoice_date);
    payload.append("due_date", formData.due_date);
    payload.append("payment_option", formData.payment_option);

    selectedInvoiceIds.forEach((id) => {
      payload.append("invoice_ids[]", id);
    });

    createMutation.mutate(payload);
  };

  const getSelectedInvoicesDetails = () => {
    return unpaidInvoices.filter((inv) => selectedInvoiceIds.includes(inv.id));
  };

  return (
    <SectionContainer>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/group-invoice"
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Group Invoice</h1>
            <p className="text-gray-500 mt-1">Consolidate multiple unpaid invoices into one group.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Partner <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.partner_id}
                onChange={handlePartnerChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8] focus:bg-white transition-all"
                required
              >
                <option value="">Select a partner</option>
                {isLoadingPartners ? (
                  <option disabled>Loading partners...</option>
                ) : (
                  partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Payment Option <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.payment_option}
                onChange={(e) => setFormData({ ...formData, payment_option: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8] focus:bg-white transition-all"
                required
              >
                <option value="" disabled>Select Payment Option</option>
                <option value="ACT Saver Details">ACT Saver Details</option>
                <option value="ACT Trans Details">ACT Trans Details</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Selected Invoices</h3>
              <button
                type="button"
                onClick={handleOpenModal}
                className="px-4 py-2 bg-[#EEF2FF] text-[#3B4CB8] rounded-xl text-sm font-medium hover:bg-[#E0E7FF] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Select Unpaid Invoices
              </button>
            </div>

            {selectedInvoiceIds.length > 0 ? (
              <div className="space-y-3">
                {getSelectedInvoicesDetails().map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Amount Due: <span className="font-medium text-red-600">${invoice.amount_due}</span> • Date:{" "}
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedInvoice(invoice.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from selection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Selected Amount Due</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${getSelectedInvoicesDetails().reduce((acc, inv) => acc + Number(inv.amount_due || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">No invoices selected yet.</p>
                <p className="text-gray-400 text-xs mt-1">
                  Select a partner and click the button above to choose unpaid invoices.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2.5 bg-[#3B4CB8] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
            >
              {createMutation.isPending ? (
                "Creating..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Group Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-white">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Select Unpaid Invoices
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto flex-1 bg-gray-50/50">
            {isLoadingUnpaid ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading unpaid invoices...</p>
              </div>
            ) : unpaidInvoices.length > 0 ? (
              <div className="space-y-3">
                {unpaidInvoices.map((invoice) => {
                  const isChecked = tempSelectedIds.includes(invoice.id);
                  return (
                    <label
                      key={invoice.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        isChecked ? "border-[#3B4CB8] bg-[#EEF2FF]" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-[#3B4CB8] border-[#3B4CB8]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={(e) => handleToggleInvoice(invoice.id, e.target.checked)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-semibold ${isChecked ? "text-[#3B4CB8]" : "text-gray-900"}`}>
                            {invoice.invoice_number}
                          </p>
                          <p className="font-semibold text-red-600">${invoice.amount_due}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                          <p>Total: ${invoice.grand_total}</p>
                          <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No eligible unpaid invoices found for this partner.</p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-[#3B4CB8] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Confirm Selection ({tempSelectedIds.length})
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionContainer>
  );
}
