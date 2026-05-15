"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import ApplicationDialog from "@/components/dashboard/applications/ApplicationDialog";
import ApplicationAccordion from "@/components/dashboard/applications/ApplicationAccordion";

export default function ContactApplicationsTab({ contactId }) {
  const { accessToken } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: workflowsData } = useQuery({
    queryKey: ["/workflows", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: partnersData } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const workflows = workflowsData?.data || [];
  const partners = partnersData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Applications</h3>
          <p className="text-sm text-gray-500">Open a record to view details.</p>
        </div>

        <ApplicationDialog
          contactId={contactId}
          workflows={workflows}
          partners={partners}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>

      <ApplicationAccordion contactId={contactId} />
    </div>
  );
}
