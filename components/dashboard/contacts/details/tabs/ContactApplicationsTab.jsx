"use client";

import { useState } from "react";
import ApplicationDialog from "@/components/dashboard/applications/ApplicationDialog";
import ApplicationAccordion from "@/components/dashboard/applications/ApplicationAccordion";

export default function ContactApplicationsTab({ contactId }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Applications
          </h3>
          <p className="text-sm text-gray-500">
            Open a record to view details.
          </p>
        </div>

        <ApplicationDialog
          contactId={contactId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>

      <ApplicationAccordion contactId={contactId} />
    </div>
  );
}
