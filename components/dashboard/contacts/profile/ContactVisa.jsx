"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { COUNTRY_OPTIONS, useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { toast } from "react-hot-toast";
import {
  Edit2, MessageCircle, Mail,
  XCircle, Snowflake, Thermometer, Flame, CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const RATING_OPTIONS = [
  { value: 1, label: "Lost",  icon: XCircle,    activeClass: "bg-red-50   text-red-800   border-red-200"   },
  { value: 2, label: "Cold",  icon: Snowflake,  activeClass: "bg-sky-50   text-sky-800   border-sky-200"   },
  { value: 3, label: "Warm",  icon: Thermometer,activeClass: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: 4, label: "Hot",   icon: Flame,      activeClass: "bg-orange-50 text-orange-800 border-orange-200" },
];

const STATUS_OPTIONS = ["Lead", "Prospect", "Client", "Archived"];

const VISA_TYPE_OPTIONS = [
  "Student Visa","Visitor Visa","Work Visa","Dependent Visa",
  "Permanent Residency","Transit Visa","Other",
];

function toDateString(d) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

function formatDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? null
    : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ExpiryStatus({ dateStr }) {
  if (!dateStr) return <span className="text-gray-300">—</span>;
  const today = new Date();
  const expiry = new Date(dateStr);
  const daysLeft = Math.ceil((expiry - today) / 86400000);
  const formatted = formatDate(dateStr);

  if (daysLeft < 0) {
    return (
      <span className="text-red-700 font-medium">
        {formatted}
        <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-2.5 h-2.5" /> Expired
        </span>
      </span>
    );
  }
  if (daysLeft <= 60) {
    return (
      <span className="text-amber-700 font-medium">
        {formatted}
        <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-2.5 h-2.5" /> Expiring
        </span>
      </span>
    );
  }
  return (
    <span className="text-emerald-700 font-medium">
      {formatted}
      <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-2.5 h-2.5" /> Valid
      </span>
    </span>
  );
}

export default function ContactVisa({ contactId, contact }) {
  const { accessToken } = useAppContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    visa_expiry_date: "", health_insurance_expiry_date: "",
    visa_type: "", country: "", country_of_passport: "",
    passport_number: "", update_note: "",
  });

  const { data: expiryData } = useQuery({
    queryKey: [`/contacts/${contactId}/update-expiry-dates`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [`/contacts/${contactId}`, accessToken] });
    qc.invalidateQueries({ queryKey: [`/contacts/${contactId}/update-expiry-dates`, accessToken] });
    qc.invalidateQueries({ queryKey: ["/contacts", accessToken] });
  };

  const updateExpiry = useMutation({
    mutationFn: async (values) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      Object.entries(values).forEach(([k, v]) => fd.append(k, v || ""));
      return postWithToken(`/contacts/${contactId}/update-expiry-dates`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") { invalidate(); setOpen(false); toast.success(res.message || "Visa updated"); }
      else toast.error(res?.message || "Failed to update visa");
    },
    onError: () => toast.error("Failed to update visa"),
  });

  const updateRating = useMutation({
    mutationFn: async (rating) => {
      const fd = new FormData();
      fd.append("_method", "PUT"); fd.append("contact_rating", String(rating));
      return postWithToken(`/contacts/${contactId}/rating`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") { invalidate(); toast.success(res.message || "Rating updated"); }
      else toast.error(res?.message || "Failed to update rating");
    },
    onError: () => toast.error("Failed to update rating"),
  });

  const updateStatus = useMutation({
    mutationFn: async (status) => {
      const fd = new FormData();
      fd.append("_method", "PUT"); fd.append("status", status);
      return postWithToken(`/contacts/${contactId}/update-status`, fd, accessToken);
    },
    onSuccess: (res, status) => {
      if (res?.status === "success") { invalidate(); toast.success(`Status updated to ${status}`); }
      else toast.error(res?.message || "Failed to update status");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const visa = expiryData?.data || {
    visa_expiry_date: contact.visa_expiry_date,
    health_insurance_expiry_date: contact.health_insurance_expiry_date,
    visa_type: contact.visa_type,
    country: contact.country,
    country_of_passport: contact.country_of_passport,
    passport_number: contact.passport_number,
  };

  const openEdit = () => {
    setForm({
      visa_expiry_date: toDateString(visa.visa_expiry_date),
      health_insurance_expiry_date: toDateString(visa.health_insurance_expiry_date),
      visa_type: visa.visa_type || "",
      country: visa.country || "",
      country_of_passport: visa.country_of_passport || "",
      passport_number: visa.passport_number || "",
      update_note: "",
    });
    setOpen(true);
  };

  const currentRating = Number(contact.contact_rating || 0);
  const currentStatus = contact.status || "";

  const visaFields = [
    { label: "Visa type",         value: visa.visa_type,            plain: true  },
    { label: "Country",           value: visa.country,              plain: true  },
    { label: "Passport country",  value: visa.country_of_passport,  plain: true  },
    { label: "Passport no.",      value: visa.passport_number,      plain: true, mute: true },
    { label: "Visa expiry",       value: visa.visa_expiry_date,     plain: false },
    { label: "Health ins. expiry",value: visa.health_insurance_expiry_date, plain: false },
  ];

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

        

        {/* ── Rating ── */}
        <div className="border-b border-gray-100">
          <div className="px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2.5">Rating</p>
            <div className="flex items-center gap-2 flex-wrap">
              {RATING_OPTIONS.map(({ value, label, icon: Icon, activeClass }) => {
                const isActive = currentRating === value;
                return (
                  <button
                    key={value}
                    onClick={() => updateRating.mutate(value)}
                    disabled={updateRating.isPending}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12px] font-medium border transition-colors disabled:opacity-50 ${
                      isActive
                        ? activeClass
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Status ── */}
        <div className="border-b border-gray-100">
          <div className="px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2.5">Status</p>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus.mutate(s)}
                  disabled={updateStatus.isPending}
                  className={`px-3 py-1.5 rounded-[9px] text-[12px] font-medium border transition-colors disabled:opacity-50 ${
                    currentStatus === s
                      ? "bg-violet-50 text-violet-800 border-violet-200"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Visa details ── */}
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Visa &amp; travel
            </p>
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Edit2 className="w-3 h-3" /> Edit visa
            </button>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-t border-gray-100">
            {visaFields.map(({ label, value, plain, mute }) => (
              <div key={label} className="px-5 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-1">{label}</p>
                {plain ? (
                  <p className={`text-[13px] font-medium truncate ${mute ? "text-gray-400" : "text-gray-900"}`}>
                    {value || "—"}
                  </p>
                ) : (
                  <div className="text-[13px]">
                    {value ? <ExpiryStatus dateStr={value} /> : <span className="text-gray-300">—</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        {/* <div className="px-5 py-3 flex flex-wrap gap-2">
          {contact?.phone && (
            <a href={`sms:${contact.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium text-gray-700 border border-gray-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> Message
            </a>
          )}
          {contact?.email && (
            <a href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors">
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          )}
          <Link href={`/dashboard/edit-client/${contact?.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium text-gray-700 border border-gray-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Edit contact
          </Link>
        </div> */}
      </div>

      {/* ── Edit visa dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit visa details</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); updateExpiry.mutate(form); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "visa_expiry_date",              label: "Visa expiry date",           type: "date"   },
                { id: "health_insurance_expiry_date",  label: "Health insurance expiry",    type: "date"   },
                { id: "passport_number",               label: "Passport number",            type: "text",  placeholder: "e.g. A9123456" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} type={type} placeholder={placeholder}
                    value={form[id]} onChange={(e) => setForm(s => ({ ...s, [id]: e.target.value }))} />
                </div>
              ))}

              {[
                { id: "visa_type",           label: "Visa type",           opts: VISA_TYPE_OPTIONS,   placeholder: "Select visa type"       },
                { id: "country",             label: "Country",             opts: COUNTRY_OPTIONS,     placeholder: "Select country"          },
                { id: "country_of_passport", label: "Country of passport", opts: COUNTRY_OPTIONS,     placeholder: "Select passport country" },
              ].map(({ id, label, opts, placeholder }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <select id={id} value={form[id]}
                    onChange={(e) => setForm(s => ({ ...s, [id]: e.target.value }))}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="">{placeholder}</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="update_note">Update note</Label>
                <Textarea id="update_note" value={form.update_note}
                  onChange={(e) => setForm(s => ({ ...s, update_note: e.target.value }))}
                  placeholder="Brief note about this change (optional)" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setOpen(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={updateExpiry.isPending}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {updateExpiry.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}