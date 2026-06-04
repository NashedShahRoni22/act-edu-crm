"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, Tag, X, Plus, MessageCircle, Mail, Edit2 } from "lucide-react";
import Link from "next/link";

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

const STATUS_STYLES = {
  Client:   "bg-emerald-50 text-emerald-800 border-emerald-200",
  Lead:     "bg-amber-50 text-amber-800 border-amber-200",
  Prospect: "bg-blue-50 text-blue-800 border-blue-200",
  Active:   "bg-emerald-50 text-emerald-800 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-500 border-gray-200",
  Archived: "bg-gray-100 text-gray-400 border-gray-200",
};

export default function ContactInfo({
  contact,
  avatarGradient,
  initials,
  fullName,
  contactTags = [],
  addableTags = [],
  removeTagMutation,
  updateTagsMutation,
}) {
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setTagMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const statusClass =
    STATUS_STYLES[contact.status] || "bg-blue-50 text-blue-800 border-blue-200";

  const fields = [
    { label: "Email",       value: contact.email,       isLink: true  },
    { label: "Phone",       value: contact.phone,       isLink: false },
    { label: "Source",      value: contact.source,      isLink: false },
    {
      label: "Assignee",
      value: contact.assignee
        ? `${contact.assignee.first_name || ""} ${contact.assignee.last_name || ""}`.trim()
        : "",
      isLink: false,
    },
    { label: "Date of Birth", value: contact.dob, isLink: false },
    { label: "Gender", value: contact.gender, isLink: false },
    {
      label: "Added on",
      value: contact.created_at
        ? new Date(contact.created_at).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "",
      isLink: false,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-[14px] bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center text-[18px] font-semibold shrink-0 shadow`}
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-semibold text-gray-900 leading-tight truncate">
              {fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {contact.status && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium border ${statusClass}`}>
                  {contact.status}
                </span>
              )}
              {contact.client_portal_active && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-violet-50 text-violet-800 border border-violet-200">
                  <CheckCircle className="w-3 h-3" />
                  Portal
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Fields grid ── */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
        {fields.map(({ label, value, isLink }, i) => (
          <div key={label} className="px-5 py-3">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-gray-400 mb-1">
              {label}
            </p>
            {value ? (
              <p
                className={`text-[13.5px] font-medium truncate ${
                  isLink ? "text-indigo-600" : "text-gray-900"
                }`}
              >
                {value}
              </p>
            ) : (
              <p className="text-[13.5px] font-medium text-gray-300">—</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Tags ── */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-1.5">
        {contactTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[11.5px] font-medium bg-violet-50 text-violet-800 border border-violet-200"
          >
            <Tag className="w-2.5 h-2.5 shrink-0" />
            {tag.name}
            <button
              type="button"
              onClick={() => removeTagMutation.mutate(tag.id)}
              disabled={removeTagMutation.isPending}
              className="ml-0.5 text-violet-400 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label={`Remove ${tag.name}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {/* Add tag dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setTagMenuOpen((o) => !o)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium text-gray-500 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add tag
          </button>

          {tagMenuOpen && addableTags.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px] z-20">
              {addableTags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    updateTagsMutation.mutate(t.id);
                    setTagMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                  {t.name}
                </button>
              ))}
              {addableTags.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">No tags available</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Actions ── */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-2">
        {contact?.phone && (
          <a
            href={`sms:${contact.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Message
          </a>
        )}
        {contact?.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
        )}
        <Link
          href={`/dashboard/edit-client/${contact?.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium text-gray-700 border border-gray-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit contact
        </Link>
      </div>
    </div>
  );
}