"use client";

import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { Mail, Phone, Users, MapPin } from "lucide-react";
import AddPartnerContactDialog from "./AddPartnerContactDialog";

function ContactsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerContactsTab({ partnerId }) {
  const { accessToken } = useAppContext();

  const { data: contactsData, isLoading, isError } = useQuery({
    queryKey: [`/partners/${partnerId}/contacts`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId,
  });

  if (isLoading) return <ContactsSkeleton />;

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-600">
        Failed to load contacts.
      </div>
    );
  }

  const contacts = contactsData?.data || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">
            Total Contacts: <span className="font-semibold">{contacts.length}</span>
          </p>
        </div>
        <AddPartnerContactDialog partnerId={partnerId} />
      </div>

      {contacts.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No contacts found</p>
          <AddPartnerContactDialog partnerId={partnerId} />
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              {/* Contact Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {contact.name}
                  </h4>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {contact.department && (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {contact.department}
                      </span>
                    )}
                    {contact.position && (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                        {contact.position}
                      </span>
                    )}
                    {contact.is_primary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-sm">
                {/* Email */}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-[#3B4CB8] hover:underline truncate"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}

                {/* Phone */}
                {(contact.phone_code || contact.phone_number) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">
                      {contact.phone_code} {contact.phone_number}
                    </span>
                  </div>
                )}

                {/* Fax */}
                {contact.fax && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-xs">Fax:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {contact.fax}
                    </span>
                  </div>
                )}

                {/* Branch */}
                {contact.branch && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">
                      {contact.branch.name}
                      {contact.branch.city && ` - ${contact.branch.city}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
