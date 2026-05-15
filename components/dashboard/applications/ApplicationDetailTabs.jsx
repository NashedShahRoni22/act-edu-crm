"use client";

import { useState } from "react";
import ApplicationCoursesPreview from "./ApplicationCoursesPreview";
import ApplicationActivityTab from "./ApplicationActivityTab";
import ApplicationDocumentsTab from "./ApplicationDocumentsTab";

export default function ApplicationDetailTabs({ applicationId, application }) {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <div className="space-y-3">
      <ApplicationCoursesPreview application={application} />
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {[
          { key: "activity", label: "Activity" },
          { key: "documents", label: "Documents" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#3B4CB8] text-[#3B4CB8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "activity" ? (
        <ApplicationActivityTab applicationId={applicationId} />
      ) : (
        <ApplicationDocumentsTab />
      )}
    </div>
  );
}
