"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
// Dialog removed — component now always renders inline
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const APP_BLUE = "#3B4CB8";
const currencyOptions = ["AUD", "USD", "GBP", "CAD", "EUR"];
const paymentMethodOptions = [
  "Cheque",
  "Bank Transfer",
  "Cash",
  "Credit Card",
  "Other",
];
const taxOptions = ["GST (10%)", "GST (0%)", "No Tax"];

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateDefault() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function blankItem() {
  return {
    id: Date.now(),
    description: "",
    total_fee: "",
    commission_percent: "",
    commission_amount: "",
    tax: "GST (10%)",
    tax_amount: "",
    net_amount: "",
  };
}

function blankPayment() {
  return {
    id: Date.now(),
    amount: "",
    payment_date: todayValue(),
    payment_method: "Cheque",
  };
}

function toCurrencyNumber(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-sm font-semibold mb-3" style={{ color: APP_BLUE }}>
      {children}
    </p>
  );
}

// ── Detail card (Partner / Client) ───────────────────────────────────────────
function DetailCard({ title, rows }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex-1">
      <p className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-3 text-sm">
            <span className="font-medium text-gray-600 w-28 shrink-0">
              {label}:
            </span>
            <span className="text-gray-800">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Summary row ──────────────────────────────────────────────────────────────
function SummaryRow({ label, value, currency, bold }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 ${bold ? "font-semibold" : ""}`}
    >
      <span className={`text-sm ${bold ? "text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm tabular-nums ${bold ? "text-gray-900" : "text-gray-700"}`}
        >
          {toCurrencyNumber(value).toFixed(2)}
        </span>
        <span className="text-xs text-gray-400 w-8">{currency}</span>
      </div>
    </div>
  );
}

export default function CommissionInvoice({
  open,
  onOpenChange,
  inline = false,
  onClose,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  // ── Header state ────────────────────────────────────────────────────────────
  const [invoiceTypes, setInvoiceTypes] = useState({
    commission_net: true,
    commission_gross: false,
  });
  const [currency, setCurrency] = useState("AUD");
  const [clientId, setClientId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayValue());
  const [dueDate, setDueDate] = useState(dueDateDefault());
  const [discountGiven, setDiscountGiven] = useState("0");
  const [discountDate, setDiscountDate] = useState(todayValue());
  const [paymentOption, setPaymentOption] = useState("ACT Trans Details");

  // ── Items ───────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([blankItem()]);
  const [payments, setPayments] = useState([]);

  // (notes, attachments, income sharing removed; payload uses minimal fields)

  // ── Contacts & applications ─────────────────────────────────────────────────
  const isVisible = inline || open;

  const { data: contactsData, isLoading: isContactsLoading } = useQuery({
    queryKey: ["/contacts", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && isVisible,
  });
  const contacts = contactsData?.data || [];
  const clientContacts = contacts.filter((c) => c.status === "Client");

  const { data: applicationsData, isLoading: isApplicationsLoading } = useQuery(
    {
      queryKey: [`/contacts/${clientId}/applications`, accessToken],
      queryFn: fetchWithToken,
      enabled: !!accessToken && !!clientId && isVisible,
    },
  );
  const applications = useMemo(
    () => applicationsData?.data || [],
    [applicationsData?.data],
  );

  const selectedApplication = useMemo(
    () => applications.find((a) => String(a.id) === String(applicationId)),
    [applications, applicationId],
  );
  const selectedPartner = selectedApplication?.courses?.[0]?.partner || null;
  const selectedClient =
    clientContacts.find((c) => String(c.id) === String(clientId)) || null;
  const course = selectedApplication?.courses?.[0] || null;

  // ── Computed totals ─────────────────────────────────────────────────────────
  const baseTotalFee = items.reduce(
    (s, i) => s + toCurrencyNumber(i.total_fee),
    0,
  );
  const commissionClaimed = items.reduce(
    (s, i) => s + toCurrencyNumber(i.commission_amount),
    0,
  );
  const taxTotal = items.reduce(
    (s, i) => s + toCurrencyNumber(i.tax_amount),
    0,
  );
  const discount = toCurrencyNumber(discountGiven);

  const totalFee = baseTotalFee;
  const netFeePaidToPartner = baseTotalFee - commissionClaimed - taxTotal; // discount excluded
  const netFeeReceived = baseTotalFee - discount; // discount deducted
  const netIncome = commissionClaimed - discount; // discount deducted

  const totalPaid = payments.reduce((s, p) => s + toCurrencyNumber(p.amount), 0);
  const amountDue = netFeePaidToPartner - totalPaid;

  // ── Item helpers ─────────────────────────────────────────────────────────────
  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        // auto-calc commission amount from percent
        if (field === "commission_percent" || field === "total_fee") {
          const fee = toCurrencyNumber(
            field === "total_fee" ? value : updated.total_fee,
          );
          const pct = toCurrencyNumber(
            field === "commission_percent" ? value : updated.commission_percent,
          );
          updated.commission_amount = ((fee * pct) / 100).toFixed(2);
        }

        // tax is calculated on commission amount (GST 10% on commission, 0% for others)
        const commAmt = toCurrencyNumber(
          field === "commission_amount" ? value : updated.commission_amount,
        );
        const taxRate = updated.tax === "GST (10%)" ? 10 : 0;
        updated.tax_amount = ((commAmt * taxRate) / 100).toFixed(2);

        // net_amount = total_fee - commission_amount - tax_amount
        updated.net_amount = (
          toCurrencyNumber(updated.total_fee) -
          toCurrencyNumber(updated.commission_amount) -
          toCurrencyNumber(updated.tax_amount)
        ).toFixed(2);

        return updated;
      }),
    );
  };

  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  // ── Payment helpers ──────────────────────────────────────────────────────────
  const addPayment = () => setPayments((p) => [...p, blankPayment()]);
  const removePayment = (id) =>
    setPayments((p) => p.filter((x) => x.id !== id));
  const updatePayment = (id, field, value) =>
    setPayments((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: value } : x)),
    );

  // (income-share helper functions removed)

  // ── Submit ───────────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPartner?.id)
        throw new Error("Select an application with a partner before saving");
      if (!clientId) throw new Error("Please select a client");
      if (!applicationId) throw new Error("Please select an application");

      const invoiceType = invoiceTypes.commission_gross
        ? "commission_gross"
        : "commission_net";
      const payload = {
        invoice_type: invoiceType,
        partner_id: selectedPartner.id,
        client_id: Number(clientId),
        application_id: Number(applicationId),
        invoice_date: invoiceDate,
        due_date: dueDate,
        currency,
        sub_total: baseTotalFee,
        tax_total: taxTotal,
        grand_total: baseTotalFee,
        total_paid: totalPaid,
        amount_due: amountDue,
        discount_given: toCurrencyNumber(discountGiven),
        discount_date: discountDate,
        net_fee_received: netFeeReceived,
        net_income: netIncome,
        items: items.map((i) => ({
          description: i.description,
          total_fee: toCurrencyNumber(i.total_fee),
          commission_percent: toCurrencyNumber(i.commission_percent),
          commission_amount: toCurrencyNumber(i.commission_amount),
          tax_name: i.tax,
          tax_rate: 10,
          tax_amount: toCurrencyNumber(i.tax_amount),
          total_amount: toCurrencyNumber(i.net_amount),
        })),
        payments: payments.map((p) => ({
          amount: toCurrencyNumber(p.amount),
          payment_date: p.payment_date,
          payment_method: p.payment_method,
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok || data?.status !== "success")
        throw new Error(data?.message || "Failed to create invoice");
      return data;
    },
    onSuccess: async () => {
      toast.success("Invoice created successfully");
      if (typeof onOpenChange === "function") onOpenChange(false);
      if (typeof onClose === "function") onClose();
      await queryClient.invalidateQueries({ queryKey: ["/invoices"] });
    },
    onError: (error) =>
      toast.error(error?.message || "Failed to create invoice"),
  });

  const inner = (
    <div className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto p-0">
      {/* ── Header bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="text-base font-semibold text-gray-900">
          Create Commission Invoice
        </div>

        {/* Invoice type checkboxes + currency + dates */}
        <div className="flex items-center gap-6">
          {/* Invoice type toggles */}
          <div className="flex items-center gap-4">
            {[
              { key: "commission_net", label: "Commission Net" },
              { key: "commission_gross", label: "Commission Gross" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-1.5 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="invoice_type"
                  checked={invoiceTypes[key]}
                  onChange={() =>
                    setInvoiceTypes(
                      key === "commission_net"
                        ? { commission_net: true, commission_gross: false }
                        : { commission_net: false, commission_gross: true },
                    )
                  }
                  className="w-3.5 h-3.5 accent-[#3B4CB8]"
                />
                <span className="text-xs text-gray-600">{label}</span>
              </label>
            ))}
          </div>

          {/* Currency */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Currency</span>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Invoice Date
              </span>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Due Date
              </span>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* ── Client + Application selectors ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Client</Label>
            <Select
              value={clientId}
              onValueChange={(v) => {
                setClientId(v);
                setApplicationId("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isContactsLoading ? "Loading..." : "Select client"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clientContacts.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Application</Label>
            <Select
              value={applicationId}
              onValueChange={setApplicationId}
              disabled={!clientId || isApplicationsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !clientId
                      ? "Select a client first"
                      : isApplicationsLoading
                        ? "Loading..."
                        : "Select application"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {applications.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.courses?.[0]?.product?.name || "Application"} #{a.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Partner + Client detail cards ── */}
        {selectedApplication || selectedClient ? (
          <div className="flex gap-4">
            <DetailCard
              title="Partner Details"
              rows={[
                { label: "Name", value: selectedPartner?.name },
                { label: "Address", value: selectedPartner?.address },
                { label: "Contact", value: selectedPartner?.phone },
                { label: "Service", value: course?.workflow?.name },
              ]}
            />
            <DetailCard
              title="Client Details"
              rows={[
                {
                  label: "Name",
                  value: selectedClient
                    ? `${selectedClient.first_name} ${selectedClient.last_name}`
                    : null,
                },
                { label: "DOB", value: selectedClient?.dob },
                {
                  label: "Partner Client Id",
                  value: selectedClient?.partner_client_id,
                },
                { label: "Partner", value: selectedPartner?.name },
                { label: "Product", value: course?.product?.name },
                { label: "Branch", value: course?.branch?.name },
                { label: "Workflow", value: course?.workflow?.name },
              ]}
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Select a client and application to view partner & client details.
          </div>
        )}

        {/* ── Items table ── */}
        <div>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Description",
                    "Total Fee",
                    "Commission %",
                    "Commission Amt",
                    "Tax",
                    "Tax Amount",
                    "Net Amount",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className="h-8 text-sm min-w-40"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.total_fee}
                        onChange={(e) =>
                          updateItem(item.id, "total_fee", e.target.value)
                        }
                        className="h-8 text-sm w-28 text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.commission_percent}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "commission_percent",
                              e.target.value,
                            )
                          }
                          className="h-8 text-sm w-16 text-right"
                        />
                        <span className="text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.commission_amount}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "commission_amount",
                            e.target.value,
                          )
                        }
                        className="h-8 text-sm w-24 text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={item.tax}
                        onValueChange={(v) => updateItem(item.id, "tax", v)}
                      >
                        <SelectTrigger className="h-8 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {taxOptions.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.tax_amount}
                        onChange={(e) =>
                          updateItem(item.id, "tax_amount", e.target.value)
                        }
                        className="h-8 text-sm w-24 text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm tabular-nums text-gray-700 px-2">
                        {toCurrencyNumber(item.net_amount).toLocaleString(
                          "en-AU",
                          { minimumFractionDigits: 2 },
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addItem}
            className="mt-2 text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: APP_BLUE }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Line
          </button>
        </div>

        {/* ── Payments ── */}
        <div>
          <SectionTitle>Payments Received</SectionTitle>
          {payments.length > 0 && (
            <div className="rounded-xl border border-gray-200 overflow-hidden mb-2">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Amount", "Date", "Method", ""].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="bg-white hover:bg-gray-50/50">
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.amount}
                          onChange={(e) =>
                            updatePayment(p.id, "amount", e.target.value)
                          }
                          className="h-8 text-sm w-28 text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="date"
                          value={p.payment_date}
                          onChange={(e) =>
                            updatePayment(p.id, "payment_date", e.target.value)
                          }
                          className="h-8 text-xs w-36"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Select
                          value={p.payment_method}
                          onValueChange={(v) =>
                            updatePayment(p.id, "payment_method", v)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethodOptions.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removePayment(p.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            onClick={addPayment}
            className="text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: APP_BLUE }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment
          </button>
        </div>

        {/* ── Discount + Summary ── */}
        <div className="flex gap-6 items-start">
          {/* Left: discount + net fee cards */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs whitespace-nowrap text-gray-600">
                Discount Given to Client:
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountGiven}
                  onChange={(e) => setDiscountGiven(e.target.value)}
                  className="h-8 text-sm w-28 text-right"
                />
                <span className="text-xs text-gray-500">{currency}</span>
              </div>
              <Input
                type="date"
                value={discountDate}
                onChange={(e) => setDiscountDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>

            {/* Net Fee Received / Net Income display cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Net Fee Received</p>
                <p className="text-3xl font-light text-gray-300 tabular-nums">
                  {netFeeReceived.toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Net Income</p>
                <p
                  className="text-3xl font-light tabular-nums"
                  style={{ color: netIncome > 0 ? APP_BLUE : "#d1d5db" }}
                >
                  {netIncome.toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="w-80 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <SummaryRow
              label="Total Fee"
              value={totalFee}
              currency={currency}
            />
            <SummaryRow
              label="Commission Claimed"
              value={commissionClaimed}
              currency={currency}
            />
            <SummaryRow label="Tax" value={taxTotal} currency={currency} />
            <SummaryRow
              label="Net Fee Paid to Partner"
              value={netFeePaidToPartner}
              currency={currency}
            />
            <SummaryRow
              label="Total Paid"
              value={totalPaid}
              currency={currency}
            />
            <SummaryRow
              label="Amount Due"
              value={amountDue}
              currency={currency}
              bold
            />

            <div className="mt-3 pt-3 border-t border-gray-200">
              <Label className="text-xs text-gray-500">
                Select Payment Option
              </Label>
              <Select value={paymentOption} onValueChange={setPaymentOption}>
                <SelectTrigger className="mt-1.5 h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["ACT Trans Details", "Bank Transfer", "Cheque"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Footer actions ── */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof onOpenChange === "function") onOpenChange(false);
              if (typeof onClose === "function") onClose();
            }}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            style={{ backgroundColor: APP_BLUE, color: "white" }}
          >
            {saveMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );

  return <div className="w-full">{inner}</div>;
}
