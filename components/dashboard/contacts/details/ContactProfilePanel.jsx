"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Flame,
  Mail,
  Phone,
  User,
  Loader2,
  Snowflake,
  Thermometer,
  XCircle,
  MessageCircle,
  Edit2,
  Tag,
  X,
  Plus,
  CheckCircle,
} from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const RATING_OPTIONS = [
  {
    value: 1,
    label: "Lost",
    icon: XCircle,
    activeClass: "bg-red-50 text-red-600 border-red-200 ring-1 ring-red-300",
    idleClass: "text-gray-400 hover:text-red-500 hover:bg-red-50 border-transparent",
  },
  {
    value: 2,
    label: "Cold",
    icon: Snowflake,
    activeClass: "bg-sky-50 text-sky-600 border-sky-200 ring-1 ring-sky-300",
    idleClass: "text-gray-400 hover:text-sky-500 hover:bg-sky-50 border-transparent",
  },
  {
    value: 3,
    label: "Warm",
    icon: Thermometer,
    activeClass: "bg-amber-50 text-amber-600 border-amber-200 ring-1 ring-amber-300",
    idleClass: "text-gray-400 hover:text-amber-500 hover:bg-amber-50 border-transparent",
  },
  {
    value: 4,
    label: "Hot",
    icon: Flame,
    activeClass: "bg-orange-50 text-orange-600 border-orange-200 ring-1 ring-orange-300",
    idleClass: "text-gray-400 hover:text-orange-500 hover:bg-orange-50 border-transparent",
  },
];

const AVATAR_COLORS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

function getAvatarGradient(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function Skeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="hidden md:flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-16 h-16 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ href, onClick, disabled, loading, icon: Icon, label, colorClass }) {
  const base =
    "group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border";
  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${colorClass}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${colorClass}`}>
      {content}
    </button>
  );
}

export default function ContactProfileHeader({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [tagsOpen, setTagsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contacts/${contactId}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: allTagsData } = useQuery({
    queryKey: ["/tags", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}`, accessToken] });
    queryClient.invalidateQueries({ queryKey: ["/contacts", accessToken] });
  };

  const updateRatingMutation = useMutation({
    mutationFn: async (rating) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("contact_rating", String(rating));
      return postWithToken(`/contacts/${contactId}/rating`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") { invalidate(); toast.success(res.message || "Rating updated"); }
      else toast.error(res?.message || "Failed to update rating");
    },
    onError: () => toast.error("Failed to update rating"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("status", status);
      return postWithToken(`/contacts/${contactId}/update-status`, fd, accessToken);
    },
    onSuccess: (res, status) => {
      if (res?.status === "success") { 
        invalidate(); 
        toast.success(res.message || `Status updated to ${status}`); 
      }
      else toast.error(res?.message || "Failed to update status");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateTagsMutation = useMutation({
    mutationFn: async (tagId) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("tag_id", String(tagId));
      return postWithToken(`/contacts/${contactId}/tags`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") { invalidate(); toast.success(res.message || "Tag added"); }
      else toast.error(res?.message || "Failed to add tag");
    },
    onError: () => toast.error("Failed to update tags"),
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return postWithToken(`/contacts/${contactId}/tags/${tagId}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") { invalidate(); toast.success(res.message || "Tag removed"); }
      else toast.error(res?.message || "Failed to remove tag");
    },
    onError: () => toast.error("Failed to remove tag"),
  });

  if (isLoading) return <Skeleton />;
  if (isError) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-600">
      Failed to load contact.
    </div>
  );

  const contact = data?.data;
  if (!contact) return null;

  const contactTags = contact?.tags || [];
  const allTags = allTagsData?.data || [];
  const addableTags = allTags.filter(
    (tag) => !contactTags.some((ct) => Number(ct.id) === Number(tag.id))
  );
  const contactRating = Number(contact?.contact_rating ?? 0);
  const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim();
  const avatarGradient = getAvatarGradient(contact.first_name);

  const statusColors = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Inactive: "bg-gray-100 text-gray-500 border-gray-200",
    Prospect: "bg-violet-50 text-violet-700 border-violet-200",
  };
  const statusClass = statusColors[contact.status] || "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">

          {/* Avatar + Identity */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md`}
            >
              {initials(contact.first_name, contact.last_name)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-gray-900 truncate">{fullName}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusClass}`}>
                  {contact.status || "Unknown"}
                </span>
                {contact.client_portal_active && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                    <CheckCircle className="w-3 h-3" /> Portal
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                {contact.email && (
                  <span className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {contact.phone}
                  </span>
                )}
                {contact.source && (
                  <span className="text-gray-400">via {contact.source}</span>
                )}
              </div>

              {/* Tags row */}
              {(contactTags.length > 0 || true) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {contactTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1 h-5 px-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTagMutation.mutate(tag.id)}
                        disabled={removeTagMutation.isPending}
                        className="ml-0.5 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 h-5 px-1.5 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded border border-dashed border-gray-300 hover:border-indigo-300 transition-all"
                      >
                        <Plus className="w-2.5 h-2.5" /> Tag
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-1" align="start">
                      <div className="max-h-48 overflow-y-auto">
                        {addableTags.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-3">No tags to add</p>
                        ) : (
                          addableTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => { updateTagsMutation.mutate(tag.id); setTagsOpen(false); }}
                              disabled={updateTagsMutation.isPending}
                              className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                              {tag.name}
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Rating + Actions */}
          <div className="flex flex-col gap-3 shrink-0">
            {/* Rating pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 mr-1 hidden lg:block">Rating</span>
              {RATING_OPTIONS.map((opt) => {
                const isActive = contactRating === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateRatingMutation.mutate(opt.value)}
                    disabled={updateRatingMutation.isPending}
                    title={opt.label}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 disabled:opacity-50 ${
                      isActive ? opt.activeClass : opt.idleClass
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden md:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
              {contact.phone && (
                <ActionButton
                  href={`sms:${contact.phone}`}
                  icon={MessageCircle}
                  label="Message"
                  colorClass="border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                />
              )}
              {contact.email && (
                <ActionButton
                  href={`mailto:${contact.email}`}
                  icon={Mail}
                  label="Email"
                  colorClass="border-gray-200 text-gray-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                />
              )}
              <ActionButton
                href={`/dashboard/edit-client/${contact.id}`}
                icon={Edit2}
                label="Edit"
                colorClass="border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <ActionButton
                      loading={updateStatusMutation.isPending}
                      icon={User}
                      label={`Status: ${contact.status || 'Unknown'}`}
                      colorClass="border-gray-200 text-gray-600 hover:bg-gray-50 flex-1 sm:flex-none justify-center"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  {['Lead', 'Prospect', 'Client', 'Archived'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (contact.status !== s) updateStatusMutation.mutate(s);
                      }}
                      disabled={updateStatusMutation.isPending || contact.status === s}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-between"
                    >
                      {s}
                      {contact.status === s && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Footer meta strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
          {contact.internal_id && <span>ID: <span className="font-mono text-gray-500">{contact.internal_id}</span></span>}
          {contact.assignee && (
            <span>
              Assigned to{" "}
              <span className="text-gray-600 font-medium">
                {contact.assignee.first_name} {contact.assignee.last_name}
              </span>
            </span>
          )}
          {contact.created_at && (
            <span>Added {formatDate(contact.created_at)}</span>
          )}
          {contact.applications?.length > 0 && (
            <span>
              <span className="font-semibold text-gray-600">{contact.applications.length}</span> application{contact.applications.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}