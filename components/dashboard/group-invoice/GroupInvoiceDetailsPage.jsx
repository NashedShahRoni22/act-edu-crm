"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import SectionContainer from "../SectionContainer";
import { ArrowLeft, Trash2, Building, Calendar, DollarSign, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GroupInvoiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["/group-invoices", id, accessToken],
    queryFn: () => fetchWithToken({ queryKey: [`/group-invoices/${id}`, accessToken] }),
    enabled: !!accessToken && !!id,
  });

  const invoice = invoiceData?.data;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/group-invoices/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success" || res.status === 200 || res.status === 204) {
        toast.success(res.message || "Group invoice deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/group-invoices"] });
        router.push("/dashboard/group-invoice");
      } else {
        toast.error(res.message || "Failed to delete group invoice");
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "An error occurred");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this group invoice? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SectionContainer>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse">Loading invoice details...</p>
        </div>
      </SectionContainer>
    );
  }

  if (!invoice) {
    return (
      <SectionContainer>
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-gray-500 mb-4">Invoice not found or deleted.</p>
          <Link href="/dashboard/group-invoice" className="text-[#3B4CB8] hover:underline font-medium">
            &larr; Back to Invoices
          </Link>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/group-invoice"
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.group_invoice_number}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === "Paid" || invoice.status?.toLowerCase() === "paid"
                    ? "bg-green-100 text-green-700"
                    : invoice.status === "Partial" || invoice.status?.toLowerCase() === "partial"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {invoice.status || "Unpaid"}
              </span>
            </div>
            <p className="text-gray-500 mt-1 text-sm">Created on {formatDate(invoice.created_at)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full md:w-auto px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? "Deleting..." : "Delete Invoice"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Partner Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#3B4CB8]">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Partner Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-base font-semibold text-gray-900">{invoice.partner?.name}</p>
              {invoice.partner?.email && (
                <p className="text-sm text-gray-500 mt-0.5">{invoice.partner.email}</p>
              )}
              {invoice.partner?.phone && (
                <p className="text-sm text-gray-500 mt-0.5">{invoice.partner.phone}</p>
              )}
            </div>
            {invoice.partner?.street && (
              <p className="text-sm text-gray-500 pt-3 border-t border-gray-100">
                {invoice.partner.street}<br />
                {invoice.partner.city}, {invoice.partner.country}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#3B4CB8]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Dates & Payment</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Invoice Date</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(invoice.invoice_date)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Due Date</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(invoice.due_date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-gray-400"/> Option</span>
              <span className="text-sm font-medium text-gray-900">{invoice.payment_option || "-"}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#3B4CB8] rounded-xl border border-[#3B4CB8] p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="text-sm text-blue-100">Grand Total</span>
              <span className="text-base font-medium">${Number(invoice.grand_total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="text-sm text-blue-100">Total Paid</span>
              <span className="text-base font-medium">${Number(invoice.total_paid || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">Amount Due</span>
              <span className="text-2xl font-bold text-white">${Number(invoice.amount_due || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Included Invoices</h3>
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
            {invoice.invoices?.length || 0} Invoices
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-200 hover:bg-gray-50/50">
                <TableHead className="py-3 px-6 font-semibold text-gray-600">Invoice No.</TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600">Client</TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600">Course</TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">Status</TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">Total</TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.invoices && invoice.invoices.length > 0 ? (
                invoice.invoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-6 py-4 font-medium text-gray-900">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {inv.client ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {inv.client.first_name} {inv.client.last_name}
                          </p>
                          {inv.client.email && <p className="text-xs text-gray-500 mt-0.5">{inv.client.email}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {inv.application?.courses?.[0]?.product?.name ? (
                        <span className="text-sm text-gray-700 font-medium">
                          {inv.application.courses[0].product.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        {inv.status || "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-medium text-gray-900">
                      ${Number(inv.grand_total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-medium text-red-600">
                      ${Number(inv.amount_due || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm">No invoices included in this group.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </SectionContainer>
  );
}
