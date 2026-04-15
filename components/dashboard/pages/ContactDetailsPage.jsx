"use client";

import SectionContainer from "../SectionContainer";
import TabSectionContainer from "../TabSectionContainer";
import ContactProfilePanel from "../contacts/details/ContactProfilePanel";
import ContactTabsPanel from "../contacts/details/ContactTabsPanel";

function parseContactId(slug) {
  if (!slug) return null;

  const normalized = Array.isArray(slug) ? slug[0] : slug;

  if (typeof normalized === "number" && Number.isFinite(normalized)) {
    return normalized;
  }

  const raw = String(normalized).trim();
  const directNumber = Number(raw);

  if (Number.isInteger(directNumber) && directNumber > 0) {
    return directNumber;
  }

  const matchedId = raw.match(/\d+/);
  const extracted = matchedId ? Number(matchedId[0]) : NaN;

  return Number.isInteger(extracted) && extracted > 0 ? extracted : null;
}

export default function ContactDetailsPage({ slug }) {
  const contactId = parseContactId(slug);

  if (!contactId) {
    return (
      <TabSectionContainer>
        <div className="bg-white border border-red-100 text-red-600 rounded-xl p-6">
          Invalid contact link. Please go back to contacts and open a valid record.
        </div>
      </TabSectionContainer>
    );
  }

  return (
    <TabSectionContainer>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3">
          <ContactProfilePanel contactId={contactId} />
        </div>

        <div className="xl:col-span-9">
          <ContactTabsPanel contactId={contactId} />
        </div>
      </div>
    </TabSectionContainer>
  );
}
