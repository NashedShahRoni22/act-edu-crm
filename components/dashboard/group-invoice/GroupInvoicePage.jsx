"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, Plus, Filter } from "lucide-react";
import SectionContainer from "../SectionContainer";
import Pagination from "../shared/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GroupInvoicePage() {
  const { accessToken } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all"); // 'all', 'paid', 'unpaid'

  // Fetch group invoices list
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["/group-invoices", currentPage, filter, accessToken],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      if (filter !== "all") params.append("filter", filter);

      return fetchWithToken({
        queryKey: [`/group-invoices?${params.toString()}`, accessToken],
      });
    },
    enabled: !!accessToken,
  });

  const invoices = invoicesData?.data || [];

  const paginationData = useMemo(() => {
    if (!invoicesData?.current_page) return null;
    return {
      current_page: invoicesData.current_page,
      last_page: invoicesData.last_page,
      total: invoicesData.total,
      per_page: invoicesData.per_page,
    };
  }, [invoicesData]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SectionContainer>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Group Invoices</h1>
            <p className="text-gray-500 mt-1">
              Manage your group invoices and payments
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8] appearance-none"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <Link
              href="/dashboard/create-group-invoice"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#3B4CB8] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Group Invoice
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                <TableHead className="py-3 px-6 font-semibold text-gray-600">
                  Invoice No.
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600">
                  Partner
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600">
                  Invoice Date
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600">
                  Due Date
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">
                  Amount
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">
                  Due
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                  Status
                </TableHead>
                <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 rounded-full mx-auto" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-lg ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : invoices?.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 font-medium text-gray-900">
                      {invoice.group_invoice_number}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-700 font-medium">
                      {invoice.partner?.name || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">
                      {formatDate(invoice.invoice_date)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">
                      {formatDate(invoice.due_date)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-medium text-gray-900">
                      ${Number(invoice.grand_total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-medium text-red-600">
                      ${Number(invoice.amount_due || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "Paid" ||
                          invoice.status?.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "Partial" ||
                                invoice.status?.toLowerCase() === "partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invoice.status || "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/group-invoice/${invoice.id}`}
                          className="p-2 text-gray-400 hover:text-[#3B4CB8] hover:bg-[#3B4CB8]/10 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No Invoices Found
                      </h3>
                      <p className="text-sm">
                        We couldn't find any invoices matching your criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {paginationData && paginationData.last_page > 1 && (
          <div className="mt-2 flex justify-center">
            <Pagination
              currentPage={paginationData.current_page}
              lastPage={paginationData.last_page}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
