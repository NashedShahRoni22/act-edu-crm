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
import ContactInfo from "../profile/ContactInfo";
import ContactVisa from "../profile/ContactVisa";

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

function toDateInputValue(dateString) {
  if (!dateString) return "";
  if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toISOString().slice(0, 10);
}

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
    queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/update-expiry-dates`, accessToken] });
    queryClient.invalidateQueries({ queryKey: ["/contacts", accessToken] });
  };

  

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
  const visaRecord = {
    visa_expiry_date: contact.visa_expiry_date ?? "",
    health_insurance_expiry_date: contact.health_insurance_expiry_date ?? "",
    visa_type: contact.visa_type ?? "",
    country: contact.country ?? "",
    country_of_passport: contact.country_of_passport ?? "",
    passport_number: contact.passport_number ?? "",
  };
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <ContactInfo
            contact={contact}
            avatarGradient={avatarGradient}
            initials={initials(contact.first_name, contact.last_name)}
            fullName={fullName}
            contactTags={contactTags}
            addableTags={addableTags}
            removeTagMutation={removeTagMutation}
            updateTagsMutation={updateTagsMutation}
          />

          <ContactVisa contactId={contactId} contact={contact} />
        </div>
      </div>
    </div>
  );
}