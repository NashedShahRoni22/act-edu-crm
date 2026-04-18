"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Flame,
  Mail,
  Phone,
  User,
  Workflow,
  MapPin,
  FileText,
  Globe,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Snowflake,
  Thermometer,
  Tag,
  X,
  XCircle,
  MessageCircle,
  Edit2,
} from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

const RATING_OPTIONS = [
  {
    value: 1,
    label: "Lost",
    icon: XCircle,
    activeClassName: "text-red-600 bg-red-100",
    idleClassName: "text-gray-400 hover:text-red-600",
  },
  {
    value: 2,
    label: "Cold",
    icon: Snowflake,
    activeClassName: "text-sky-600 bg-sky-100",
    idleClassName: "text-gray-400 hover:text-sky-600",
  },
  {
    value: 3,
    label: "Warm",
    icon: Thermometer,
    activeClassName: "text-amber-600 bg-amber-100",
    idleClassName: "text-gray-400 hover:text-amber-600",
  },
  {
    value: 4,
    label: "Hot",
    icon: Flame,
    activeClassName: "text-orange-600 bg-orange-100",
    idleClassName: "text-gray-400 hover:text-orange-600",
  },
];

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 wrap-break-word">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function ContactProfilePanelSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100" />
            <div className="space-y-2 w-full">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContactProfilePanel({ contactId }) {
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

  const updateTagsMutation = useMutation({
    mutationFn: async (tagId) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("tag_id", String(tagId));
      return postWithToken(`/contacts/${contactId}/tags`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}`, accessToken],
        });
        queryClient.invalidateQueries({ queryKey: ["/contacts", accessToken] });
        toast.success(res.message || "Tags updated successfully");
      } else {
        toast.error(res?.message || "Failed to update tags");
      }
    },
    onError: () => toast.error("Failed to update tags"),
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return postWithToken(
        `/contacts/${contactId}/tags/${tagId}`,
        fd,
        accessToken,
      );
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}`, accessToken],
        });
        queryClient.invalidateQueries({ queryKey: ["/contacts", accessToken] });
        toast.success(res.message || "Tag removed successfully");
      } else {
        toast.error(res?.message || "Failed to remove tag");
      }
    },
    onError: () => toast.error("Failed to remove tag"),
  });

  const updateRatingMutation = useMutation({
    mutationFn: async (rating) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("contact_rating", String(rating));
      return postWithToken(`/contacts/${contactId}/rating`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}`, accessToken],
        });
        queryClient.invalidateQueries({ queryKey: ["/contacts", accessToken] });
        toast.success(res.message || "Rating updated successfully");
      } else {
        toast.error(res?.message || "Failed to update rating");
      }
    },
    onError: () => toast.error("Failed to update rating"),
  });

  if (isLoading) return <ContactProfilePanelSkeleton />;

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-6 text-sm text-red-600">
        Failed to load contact details.
      </div>
    );
  }

  const contact = data?.data;
  const contactTags = contact?.tags || [];
  const allTags = allTagsData?.data || [];
  const addableTags = allTags.filter(
    (tag) =>
      !contactTags.some(
        (contactTag) => Number(contactTag.id) === Number(tag.id),
      ),
  );
  const contactRating = Number(contact?.contact_rating ?? 0);

  if (!contact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500">
        Contact details are not available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#3B4CB8] text-white flex items-center justify-center text-lg font-bold">
          {initials(contact.first_name, contact.last_name)}
        </div>

        <h2 className="text-xl font-semibold text-gray-900">
          {contact.first_name} {contact.last_name}
        </h2>
        <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
          {contact.status || "Unknown"}
        </span>
        {contact.internal_id && (
          <p className="text-xs text-gray-500 mt-1">
            ID: {contact.internal_id}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2 pb-2 border-b border-gray-100">
        {contact.phone ? (
          <a
            href={`sms:${contact.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Send Message"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Message
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
            title="No phone available"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Message
          </button>
        )}

        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Send Email"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
            title="No email available"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
        )}

        <Link
          href={`/dashboard/edit-client/${contact.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          title="Edit Client"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>
      {/* Rating Section */}
      <div className="space-y-3 py-2 border-t border-b border-gray-100">
        {/* <h3 className="text-sm font-semibold text-gray-900">Rating</h3> */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RATING_OPTIONS.map((rating) => {
            const isActive = contactRating === rating.value;
            const Icon = rating.icon;

            return (
              <button
                key={rating.value}
                type="button"
                onClick={() => updateRatingMutation.mutate(rating.value)}
                disabled={updateRatingMutation.isPending}
                className={`cursor-pointer flex flex-col items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                  isActive ? rating.activeClassName : rating.idleClassName
                }`}
                title={`Set rating to ${rating.label}`}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span className="text-xs">{rating.label}</span>
              </button>
            );
          })}
        </div>
        {/* {contactRating ? (
          <p className="text-xs text-gray-500">
            Current rating: {RATING_OPTIONS.find((item) => item.value === contactRating)?.label || "Unknown"}
          </p>
        ) : (
          <p className="text-xs text-gray-500">No rating set yet</p>
        )} */}
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Contact Information
        </h3>
        <DetailRow icon={Mail} label="Email" value={contact.email} />
        {contact.secondary_email && (
          <DetailRow
            icon={Mail}
            label="Secondary Email"
            value={contact.secondary_email}
          />
        )}
        <DetailRow icon={Phone} label="Phone" value={contact.phone} />
        <DetailRow
          icon={User}
          label="Assignee"
          value={`${contact.assignee?.first_name || ""} ${contact.assignee?.last_name || ""}`.trim()}
        />
        <DetailRow icon={Workflow} label="Lead Source" value={contact.source} />
      </div>

      {/* Personal Information Section */}
      {(contact.gender || contact.dob) && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Personal Information
          </h3>
          {contact.gender && (
            <DetailRow icon={User} label="Gender" value={contact.gender} />
          )}
          {contact.dob && (
            <DetailRow
              icon={CalendarDays}
              label="Date of Birth"
              value={formatDate(contact.dob)}
            />
          )}
          {contact.degree_levels && (
            <DetailRow
              icon={Globe}
              label="Degree Levels"
              value={contact.degree_levels}
            />
          )}
          {contact.preferred_intake && (
            <DetailRow
              icon={Clock}
              label="Preferred Intake"
              value={contact.preferred_intake}
            />
          )}
        </div>
      )}

      {/* Address Section */}
      {(contact.street ||
        contact.city ||
        contact.state ||
        contact.postal_code ||
        contact.country) && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Address</h3>
          {contact.street && (
            <DetailRow icon={MapPin} label="Street" value={contact.street} />
          )}
          {contact.city && (
            <DetailRow icon={MapPin} label="City" value={contact.city} />
          )}
          {contact.state && (
            <DetailRow icon={MapPin} label="State" value={contact.state} />
          )}
          {contact.postal_code && (
            <DetailRow
              icon={MapPin}
              label="Postal Code"
              value={contact.postal_code}
            />
          )}
          {contact.country && (
            <DetailRow icon={Globe} label="Country" value={contact.country} />
          )}
        </div>
      )}

      {/* Passport & Visa Section */}
      {(contact.passport_number ||
        contact.country_of_passport ||
        contact.visa_type ||
        contact.visa_expiry_date) && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Passport & Visa
          </h3>
          {contact.country_of_passport && (
            <DetailRow
              icon={FileText}
              label="Passport Country"
              value={contact.country_of_passport}
            />
          )}
          {contact.passport_number && (
            <DetailRow
              icon={FileText}
              label="Passport Number"
              value={contact.passport_number}
            />
          )}
          {contact.visa_type && (
            <DetailRow
              icon={Globe}
              label="Visa Type"
              value={contact.visa_type}
            />
          )}
          {contact.visa_expiry_date && (
            <DetailRow
              icon={CalendarDays}
              label="Visa Expiry"
              value={formatDate(contact.visa_expiry_date)}
            />
          )}
        </div>
      )}

      {/* Portal Status Section */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Tags</h3>

        {contactTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contactTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100"
              >
                <Tag className="w-3 h-3" />
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => removeTagMutation.mutate(tag.id)}
                  disabled={removeTagMutation.isPending}
                  className="ml-0.5 hover:text-red-600 disabled:opacity-50"
                  title="Remove tag"
                >
                  {removeTagMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tags assigned</p>
        )}

        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tag
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-1" align="start">
            <div className="max-h-56 overflow-y-auto">
              {addableTags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-3 px-2">
                  No more tags to add
                </p>
              ) : (
                addableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      updateTagsMutation.mutate(tag.id);
                      setTagsOpen(false);
                    }}
                    disabled={updateTagsMutation.isPending}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Portal Status Section */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Portal Access</h3>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          <CheckCircle
            className={`w-4 h-4 ${
              contact.client_portal_active ? "text-green-600" : "text-gray-400"
            }`}
          />
          <span className="text-sm text-gray-700">
            Client Portal:{" "}
            <span
              className={`font-medium ${
                contact.client_portal_active
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {contact.client_portal_active ? "Active" : "Inactive"}
            </span>
          </span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
        <DetailRow
          icon={CalendarDays}
          label="Created"
          value={formatDate(contact.created_at)}
        />
        <DetailRow
          icon={CalendarDays}
          label="Last Updated"
          value={formatDate(contact.updated_at)}
        />
      </div>

      {/* Applications Section */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Applications on record</p>
        <p className="text-2xl font-bold text-gray-900">
          {contact.applications?.length || 0}
        </p>
        {contact.applications?.length > 0 && (
          <div className="mt-3 space-y-2">
            {contact.applications.map((app) => (
              <div
                key={app.id}
                className="text-xs bg-gray-50 rounded-lg p-2 border border-gray-100"
              >
                <p className="font-medium text-gray-900">
                  {app.workflow?.name || "Workflow"}
                </p>
                <p className="text-gray-500">
                  {app.courses?.length || 0} course
                  {(app.courses?.length || 0) !== 1 ? "s" : ""} •{" "}
                  <span
                    className={`${
                      app.status === "In Progress"
                        ? "text-amber-700"
                        : "text-green-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
