"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
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
const taxOptions = ["GST (10%)", "GST (0%)", "No Tax"];
const paymentMethodOptions = ["Cheque", "Bank Transfer", "Cash", "Credit Card", "Other"];

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
    income_type: "",
    amount: "",
    tax_name: "GST (10%)",
    tax_rate: 10,
    is_tax_inclusive: false,
    tax_amount: "",
    total_amount: "",
  };
}

function blankPayment() {
  return { id: Date.now(), amount: "", payment_date: todayValue(), payment_method: "Cheque" };
}

function toNumber(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function SectionTitle({ children }) {
  return (
    <p className="text-sm font-semibold mb-3" style={{ color: APP_BLUE }}>
      {children}
    </p>
  );
}

function DetailCard({ title, rows }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex-1">
      <p className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3">{title}</p>
      <div className="space-y-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-3 text-sm">
            <span className="font-medium text-gray-600 w-28 shrink-0">{label}:</span>
            <span className="text-gray-800">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, currency, bold }) {
  return (
    <div className={`flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 ${bold ? "font-semibold" : ""}`}>
      <span className={`text-sm ${bold ? "text-gray-900" : "text-gray-600"}`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm tabular-nums ${bold ? "text-gray-900" : "text-gray-700"}`}>
          {toNumber(value).toFixed(2)}
        </span>
        <span className="text-xs text-gray-400 w-8">{currency}</span>
      </div>
    </div>
  );
}

export default function GeneralInvoice({ inline = true, onClose }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [invoiceType, setInvoiceType] = useState("general_client");
  const [clientId, setClientId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayValue());
  const [dueDate, setDueDate] = useState(dueDateDefault());
  const [currency, setCurrency] = useState("AUD");
  const [discountGiven, setDiscountGiven] = useState("0");
  const [paymentOption, setPaymentOption] = useState("ACT Trans Details");

  const [items, setItems] = useState([blankItem()]);
  const [payments, setPayments] = useState([]);

  const isClientMode = invoiceType === "general_client";

  // ── Client mode queries ──────────────────────────────────────────────────────
  const { data: contactsData, isLoading: isContactsLoading } = useQuery({
    queryKey: ["/contacts", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && isClientMode,
  });
  const contacts = contactsData?.data || [];
  const clientContacts = contacts.filter((c) => c.status === "Client");

  const { data: applicationsData, isLoading: isApplicationsLoading } = useQuery({
    queryKey: [`/contacts/${clientId}/applications`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!clientId && isClientMode,
  });
  const applications = useMemo(() => applicationsData?.data || [], [applicationsData?.data]);

  const selectedApplication = useMemo(
    () => applications.find((a) => String(a.id) === String(applicationId)),
    [applications, applicationId]
  );
  const selectedClient = clientContacts.find((c) => String(c.id) === String(clientId)) || null;
  const clientCourse = selectedApplication?.courses?.[0] || null;
  const clientPartner = clientCourse?.partner || null;

  // ── Partner mode queries ─────────────────────────────────────────────────────
  const { data: partnersData } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !isClientMode,
  });
  const partners = partnersData?.data || [];

  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: [`/services?partner_id=${partnerId}&with=partner,branches`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId && !isClientMode,
  });
  const services = useMemo(() => servicesData?.data || [], [servicesData?.data]);

  const selectedService = useMemo(
    () => services.find((s) => String(s.unique_id) === String(serviceId)),
    [services, serviceId]
  );

  const selectedWorkflow = useMemo(
    () => (selectedService?.available_workflows || []).find((w) => String(w.id) === String(workflowId)),
    [selectedService, workflowId]
  );

  // ── Computed totals ──────────────────────────────────────────────────────────
  const subTotal = items.reduce((s, i) => s + toNumber(i.amount), 0);
  const taxTotal = items.reduce((s, i) => s + toNumber(i.tax_amount), 0);
  const grandTotal = subTotal + taxTotal;
  const totalPaid = payments.reduce((s, p) => s + toNumber(p.amount), 0);
  const amountDue = grandTotal - totalPaid - toNumber(discountGiven);

  // ── Item helpers ─────────────────────────────────────────────────────────────
  const addItem = () => setItems((s) => [...s, blankItem()]);
  const removeItem = (id) => setItems((s) => s.filter((i) => i.id !== id));
  const updateItem = (id, field, value) =>
    setItems((s) =>
      s.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        // auto-calc total
        updated.total_amount = (toNumber(updated.amount) + toNumber(updated.tax_amount)).toFixed(2);
        return updated;
      })
    );

  // ── Payment helpers ──────────────────────────────────────────────────────────
  const addPayment = () => setPayments((p) => [...p, blankPayment()]);
  const removePayment = (id) => setPayments((p) => p.filter((x) => x.id !== id));
  const updatePayment = (id, field, value) =>
    setPayments((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  // ── Submit ───────────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isClientMode) {
        if (!clientId) throw new Error("Select a client");
        if (!applicationId) throw new Error("Select an application");
      } else {
        if (!partnerId) throw new Error("Select a partner");
        if (!serviceId) throw new Error("Select a product/service");
        if (!workflowId) throw new Error("Select a workflow");
      }

      const payload = {
        invoice_type: invoiceType,
        ...(isClientMode
          ? { client_id: Number(clientId), application_id: Number(applicationId) }
          : { partner_id: Number(partnerId), workflow_id: Number(workflowId) }),
        invoice_date: invoiceDate,
        due_date: dueDate,
        currency,
        sub_total: subTotal,
        tax_total: taxTotal,
        grand_total: grandTotal,
        total_paid: totalPaid,
        amount_due: amountDue,
        discount_given: toNumber(discountGiven),
        items: items.map((i) => ({
          description: i.description,
          income_type: i.income_type,
          amount: toNumber(i.amount),
          tax_name: i.tax_name,
          tax_rate: toNumber(i.tax_rate),
          is_tax_inclusive: !!i.is_tax_inclusive,
          tax_amount: toNumber(i.tax_amount),
          total_amount: toNumber(i.total_amount),
        })),
        payments: payments.map((p) => ({
          amount: toNumber(p.amount),
          payment_date: p.payment_date,
          payment_method: p.payment_method,
        })),
        income_shares: [],
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.status !== "success") throw new Error(data?.message || "Failed to create invoice");
      return data;
    },
    onSuccess: async () => {
      toast.success("Invoice created successfully");
      await queryClient.invalidateQueries({ queryKey: ["/invoices"] });
      if (typeof onClose === "function") onClose();
    },
    onError: (err) => toast.error(err?.message || "Failed to create invoice"),
  });

  return (
    <div className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto p-0">

      {/* ── Header bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="text-base font-semibold text-gray-900">Create General Invoice</div>

        <div className="flex items-center gap-6">
          {/* Invoice type toggles */}
          <div className="flex items-center gap-4">
            {[
              { key: "general_client", label: "Client Invoice" },
              { key: "general_partner", label: "Partner Invoice" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="invoice_type"
                  checked={invoiceType === key}
                  onChange={() => {
                    setInvoiceType(key);
                    setClientId(""); setApplicationId("");
                    setPartnerId(""); setServiceId(""); setWorkflowId("");
                  }}
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
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 whitespace-nowrap">Invoice Date</span>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 whitespace-nowrap">Due Date</span>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-xs w-36" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">

        {/* ── Client / Partner selectors ── */}
        {isClientMode ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select value={clientId} onValueChange={(v) => { setClientId(v); setApplicationId(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isContactsLoading ? "Loading..." : "Select client"} />
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
              <Select value={applicationId} onValueChange={setApplicationId} disabled={!clientId || isApplicationsLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={!clientId ? "Select a client first" : isApplicationsLoading ? "Loading..." : "Select application"} />
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
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Partner</Label>
              <Select value={partnerId} onValueChange={(v) => { setPartnerId(v); setServiceId(""); setWorkflowId(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={partners.length ? "Select partner" : "No partners"} />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Product / Service</Label>
              <Select value={serviceId} onValueChange={(v) => { setServiceId(v); setWorkflowId(""); }} disabled={!partnerId || isServicesLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={!partnerId ? "Select partner first" : isServicesLoading ? "Loading..." : "Select product/service"} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.unique_id} value={String(s.unique_id)}>
                      {s.display_label || s.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Workflow</Label>
              <Select value={workflowId} onValueChange={setWorkflowId} disabled={!selectedService}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={!selectedService ? "Select service first" : "Select workflow"} />
                </SelectTrigger>
                <SelectContent>
                  {(selectedService?.available_workflows || []).map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* ── Detail cards ── */}
        {isClientMode ? (
          (selectedApplication || selectedClient) ? (
            <div className="flex gap-4">
              <DetailCard
                title="Partner Details"
                rows={[
                  { label: "Name", value: clientPartner?.name },
                  { label: "Address", value: clientPartner?.address },
                  { label: "Contact", value: clientPartner?.phone },
                  { label: "Service", value: clientCourse?.workflow?.name },
                ]}
              />
              <DetailCard
                title="Client Details"
                rows={[
                  { label: "Name", value: selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : null },
                  { label: "DOB", value: selectedClient?.dob },
                  { label: "Partner Client Id", value: selectedClient?.partner_client_id },
                  { label: "Partner", value: clientPartner?.name },
                  { label: "Product", value: clientCourse?.product?.name },
                  { label: "Branch", value: clientCourse?.branch?.name },
                  { label: "Workflow", value: clientCourse?.workflow?.name },
                ]}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a client and application to view details.</div>
          )
        ) : (
          selectedService ? (
            <div className="flex gap-4">
              <DetailCard
                title="Partner Details"
                rows={[
                  { label: "Name", value: selectedService.partner_name },
                  { label: "Branch", value: selectedService.branch_name },
                  { label: "Branch ID", value: selectedService.partner_branch_id ? String(selectedService.partner_branch_id) : null },
                ]}
              />
              <DetailCard
                title="Product Details"
                rows={[
                  { label: "Product", value: selectedService.product_name },
                  { label: "Display", value: selectedService.display_label },
                  { label: "Workflow", value: selectedWorkflow?.name },
                ]}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a partner and product/service to view details.</div>
          )
        )}

        {/* ── Items table ── */}
        <div>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Description", "Income Type", "Amount", "Tax", "Tax Amount", "Total", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Description"
                        className="h-8 text-sm min-w-40"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.income_type}
                        onChange={(e) => updateItem(item.id, "income_type", e.target.value)}
                        placeholder="Income type"
                        className="h-8 text-sm w-32"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number" step="0.01" min="0"
                        value={item.amount}
                        onChange={(e) => updateItem(item.id, "amount", e.target.value)}
                        className="h-8 text-sm w-28 text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select value={item.tax_name} onValueChange={(v) => updateItem(item.id, "tax_name", v)}>
                        <SelectTrigger className="h-8 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {taxOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number" step="0.01" min="0"
                        value={item.tax_amount}
                        onChange={(e) => updateItem(item.id, "tax_amount", e.target.value)}
                        className="h-8 text-sm w-24 text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm tabular-nums text-gray-700 px-2">
                        {toNumber(item.total_amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
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
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="bg-white hover:bg-gray-50/50">
                      <td className="px-3 py-2">
                        <Input type="number" step="0.01" min="0" value={p.amount}
                          onChange={(e) => updatePayment(p.id, "amount", e.target.value)}
                          className="h-8 text-sm w-28 text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="date" value={p.payment_date}
                          onChange={(e) => updatePayment(p.id, "payment_date", e.target.value)}
                          className="h-8 text-xs w-36" />
                      </td>
                      <td className="px-3 py-2">
                        <Select value={p.payment_method} onValueChange={(v) => updatePayment(p.id, "payment_method", v)}>
                          <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {paymentMethodOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removePayment(p.id)} className="text-gray-300 hover:text-red-400 transition-colors">
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
          {/* Left: discount + totals display */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs whitespace-nowrap text-gray-600">Discount Given to Client:</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number" step="0.01" min="0"
                  value={discountGiven}
                  onChange={(e) => setDiscountGiven(e.target.value)}
                  className="h-8 text-sm w-28 text-right"
                />
                <span className="text-xs text-gray-500">{currency}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-3xl font-light text-gray-300 tabular-nums">
                  {totalPaid.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                <p className="text-3xl font-light tabular-nums" style={{ color: amountDue > 0 ? APP_BLUE : "#d1d5db" }}>
                  {amountDue.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Right: summary panel */}
          <div className="w-80 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <SummaryRow label="Sub Total" value={subTotal} currency={currency} />
            <SummaryRow label="Tax Total" value={taxTotal} currency={currency} />
            <SummaryRow label="Grand Total" value={grandTotal} currency={currency} bold />

            <div className="mt-3 pt-3 border-t border-gray-200">
              <Label className="text-xs text-gray-500">Select Payment Option</Label>
              <Select value={paymentOption} onValueChange={setPaymentOption}>
                <SelectTrigger className="mt-1.5 h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["ACT Trans Details", "Bank Transfer", "Cheque"].map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
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
            onClick={() => typeof onClose === "function" && onClose()}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saveMutation.isPending}
            style={{ borderColor: APP_BLUE, color: APP_BLUE }}
          >
            Save & Preview
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            style={{ backgroundColor: APP_BLUE }}
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Save
          </Button>
          <Button
            type="button"
            disabled={saveMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save & Send
          </Button>
        </div>
      </div>
    </div>
  );
}