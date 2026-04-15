"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Mail,
  Phone,
  User,
  Workflow,
  MapPin,
  FileText,
  Globe,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";

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

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 wrap-break-word">{value || "-"}</p>
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

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/contacts/${contactId}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
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

  console.log(contact);

  if (!contact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500">
        Contact details are not available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#3B4CB8] text-white flex items-center justify-center text-lg font-bold">
          {initials(contact.first_name, contact.last_name)}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {contact.first_name} {contact.last_name}
          </h2>
          <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
            {contact.status || "Unknown"}
          </span>
          {contact.internal_id && (
            <p className="text-xs text-gray-500 mt-1">ID: {contact.internal_id}</p>
          )}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
        <DetailRow icon={Mail} label="Email" value={contact.email} />
        {contact.secondary_email && (
          <DetailRow icon={Mail} label="Secondary Email" value={contact.secondary_email} />
        )}
        <DetailRow icon={Phone} label="Phone" value={contact.phone} />
        <DetailRow icon={User} label="Assignee" value={`${contact.assignee?.first_name || ""} ${contact.assignee?.last_name || ""}`.trim()} />
        <DetailRow icon={Workflow} label="Lead Source" value={contact.source} />
      </div>

      {/* Personal Information Section */}
      {(contact.gender || contact.dob) && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
          {contact.gender && <DetailRow icon={User} label="Gender" value={contact.gender} />}
          {contact.dob && (
            <DetailRow icon={CalendarDays} label="Date of Birth" value={formatDate(contact.dob)} />
          )}
          {contact.degree_levels && (
            <DetailRow icon={Globe} label="Degree Levels" value={contact.degree_levels} />
          )}
          {contact.preferred_intake && (
            <DetailRow icon={Clock} label="Preferred Intake" value={contact.preferred_intake} />
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
            <DetailRow icon={MapPin} label="Postal Code" value={contact.postal_code} />
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
          <h3 className="text-sm font-semibold text-gray-900">Passport & Visa</h3>
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
            <DetailRow icon={Globe} label="Visa Type" value={contact.visa_type} />
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
        <h3 className="text-sm font-semibold text-gray-900">Portal Access</h3>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          <CheckCircle
            className={`w-4 h-4 ${
              contact.client_portal_active
                ? "text-green-600"
                : "text-gray-400"
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
                  {app.courses?.length || 0} course{(app.courses?.length || 0) !== 1 ? "s" : ""} •{" "}
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
