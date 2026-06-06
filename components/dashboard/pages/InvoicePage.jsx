"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Search, ReceiptText } from "lucide-react";
import Link from "next/link";

import SectionContainer from "../../../components/dashboard/SectionContainer";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CommissionInvoice from "../invoice/CommissionInvoice";
import GeneralInvoice from "../invoice/GeneralInvoice";
import Pagination from "../shared/Pagination";

function InvoicesSkeleton() {
  return (
    <SectionContainer>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-16 bg-white border border-gray-200 rounded-xl" />
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((__, cellIdx) => (
                  <div key={cellIdx} className="h-4 bg-gray-100 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(currency, value) {
  const amount = Number(value || 0);
  return `${currency || "USD"} ${amount.toFixed(2)}`;
}

export default function InvoicePage() {
  const { accessToken } = useAppContext();
  const [filter, setFilter] = useState("unpaid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createPopoverOpen, setCreatePopoverOpen] = useState(false);
  const [createMode, setCreateMode] = useState(null); // 'commission' | 'general' | null

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set("filter", filter);
    params.set("page", String(page));
    if (search.trim()) params.set("search", search.trim());
    return `/invoices?${params.toString()}`;
  }, [filter, page, search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/invoices", filter, search.trim(), page, accessToken],
    queryFn: () => fetchWithToken({ queryKey: [endpoint, accessToken] }),
    enabled: !!accessToken,
    keepPreviousData: true,
  });

  const paginationData = data || {};
  const invoicesList = paginationData.data || [];
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const totalItems = paginationData?.total || 0;
  
  const paginationInfo = {
    currentPage,
    lastPage: totalPages,
    total: totalItems,
    from: paginationData?.from,
    to: paginationData?.to,
    hasNextPage: !!paginationData?.next_page_url,
    hasPrevPage: !!paginationData?.prev_page_url,
  };

  const onFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const onSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  if (isLoading) return <InvoicesSkeleton />;

  return (
    <SectionContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Track invoice status, due dates, and outstanding balances.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 w-fit">
              <button
                type="button"
                onClick={() => onFilterChange("unpaid")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === "unpaid"
                    ? "bg-white text-[#3B4CB8] shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Unpaid
              </button>
              <button
                type="button"
                onClick={() => onFilterChange("paid")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === "paid"
                    ? "bg-white text-[#3B4CB8] shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Paid
              </button>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
              <div className="relative w-full lg:max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={onSearchChange}
                  placeholder="Search invoice number or client"
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
                />
              </div>

              <Popover open={createPopoverOpen} onOpenChange={setCreatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3B4CB8] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2f3d93]"
                  >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-2">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePopoverOpen(false);
                        setCreateMode("commission");
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#3B4CB8]"
                    >
                      Commission Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePopoverOpen(false);
                        setCreateMode("general");
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#3B4CB8]"
                    >
                      General Invoice
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">Failed to load invoices.</div>
        ) : (
          <div>
            {createMode ? (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                {createMode === "commission" ? (
                  <CommissionInvoice key={createMode} inline onClose={() => setCreateMode(null)} />
                ) : (
                  <GeneralInvoice key={createMode} inline onClose={() => setCreateMode(null)} />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-245">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Partner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Invoice Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Grand Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount Due</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <ReceiptText className="w-8 h-8 text-gray-300" />
                              <p>No invoices found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        invoicesList.map((invoice) => {
                          const clientName = [invoice?.client?.first_name, invoice?.client?.last_name].filter(Boolean).join(" ");
                          return (
                            <tr key={invoice.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors">
                              <td className="px-4 py-3">
                                <Link href={`/dashboard/invoice/${invoice.id}`} className="text-sm font-semibold text-[#3B4CB8] hover:underline">
                                  {invoice.invoice_number || "-"}
                                </Link>
                                <p className="text-xs text-gray-500 mt-0.5">{invoice.invoice_type || "-"}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{clientName || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{invoice?.partner?.name || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(invoice.invoice_date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(invoice.due_date)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatMoney(invoice.currency, invoice.grand_total)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatMoney(invoice.currency, invoice.amount_due)}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{invoice.status || "-"}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination {...paginationInfo} onPageChange={setPage} noun="invoices" />
              </div>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
