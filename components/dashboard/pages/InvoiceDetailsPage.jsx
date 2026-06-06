"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ReceiptText, Calendar, Building2, User, CreditCard, Banknote, Download } from "lucide-react";
import SectionContainer from "../SectionContainer";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";

function formatMoney(currency, value) {
  const amount = Number(value || 0);
  return `${currency || "USD"} ${amount.toFixed(2)}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-700",
  Sent: "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accessToken } = useAppContext();

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: [`/invoices/${id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!id,
  });

  const invoice = responseData?.data;

  if (isLoading) {
    return (
      <SectionContainer>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </SectionContainer>
    );
  }

  if (isError || !invoice) {
    return (
      <SectionContainer>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load invoice details or invoice not found.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </SectionContainer>
    );
  }

  const clientName = [invoice.client?.first_name, invoice.client?.last_name].filter(Boolean).join(" ") || "-";

  return (
    <SectionContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {invoice.invoice_number || "Invoice Details"}
                </h1>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[invoice.status] || "bg-gray-100 text-gray-700"}`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {invoice.invoice_type ? invoice.invoice_type.replace(/_/g, " ") : "General"} Invoice
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <h3 className="text-sm font-medium">Invoice Date</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.invoice_date)}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Calendar className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-medium text-orange-700">Due Date</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.due_date)}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Banknote className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-medium">Grand Total</h3>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatMoney(invoice.currency, invoice.financials?.grand_total)}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium">Amount Due</h3>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatMoney(invoice.currency, invoice.financials?.amount_due)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Invoice Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tax</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <tr key={item.id || index} className="border-b border-gray-100 last:border-0">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{item.description}</p>
                            {item.income_type && <p className="text-xs text-gray-500">{item.income_type}</p>}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-600">
                            {formatMoney(invoice.currency, item.total_fee || item.amount)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-600">
                            <p>{formatMoney(invoice.currency, item.tax_amount)}</p>
                            {item.tax_name && <p className="text-xs text-gray-400">{item.tax_name} ({item.tax_rate}%)</p>}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            {formatMoney(invoice.currency, item.total_amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                          No items found on this invoice.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application Info (If present) */}
            {invoice.application && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Related Application</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Workflow</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{invoice.application.workflow?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{invoice.application.status || "-"}</p>
                    </div>
                  </div>
                  
                  {invoice.application.courses && invoice.application.courses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Courses</p>
                      <ul className="space-y-2">
                        {invoice.application.courses.map(course => (
                          <li key={course.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {course.product?.name || "Unknown Course"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Right column) */}
          <div className="space-y-6">
            
            {/* Financial Summary */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Summary</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sub Total</span>
                  <span className="font-medium text-gray-900">{formatMoney(invoice.currency, invoice.financials?.sub_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium text-gray-900">{formatMoney(invoice.currency, invoice.financials?.tax_total)}</span>
                </div>
                {invoice.commission_details?.discount_given > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatMoney(invoice.currency, invoice.commission_details?.discount_given)}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Grand Total</span>
                    <span className="font-semibold text-gray-900">{formatMoney(invoice.currency, invoice.financials?.grand_total)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-medium text-green-600">{formatMoney(invoice.currency, invoice.financials?.total_paid)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium mt-2 p-2 bg-blue-50 rounded-lg">
                  <span className="text-blue-800">Amount Due</span>
                  <span className="text-blue-800">{formatMoney(invoice.currency, invoice.financials?.amount_due)}</span>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Billed To</h3>
              </div>
              <div className="p-5">
                <p className="font-medium text-gray-900">{clientName}</p>
                {invoice.client?.email && <p className="text-sm text-gray-500 mt-1">{invoice.client.email}</p>}
                {invoice.client?.phone && <p className="text-sm text-gray-500 mt-1">{invoice.client.phone}</p>}
                {(invoice.client?.city || invoice.client?.country) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {[invoice.client?.city, invoice.client?.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Partner Info */}
            {invoice.partner && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Partner</h3>
                </div>
                <div className="p-5">
                  <p className="font-medium text-gray-900">{invoice.partner.name}</p>
                </div>
              </div>
            )}

            {/* Creator Info */}
            {invoice.creator && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Created By</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.creator.first_name} {invoice.creator.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{invoice.creator.email}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    On {formatDate(invoice.created_at)}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
