"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactActivitiesTab from "./tabs/ContactActivitiesTab";
import ContactApplicationsTab from "./tabs/ContactApplicationsTab";
import ContactServicesTab from "./tabs/ContactServicesTab";
import ContactAppointmentsTab from "./tabs/ContactAppointmentsTab";
import ContactNotesTab from "./tabs/ContactNotesTab";
import ContactDocumentsTab from "./tabs/ContactDocumentsTab";
import ContactTasksTab from "./tabs/ContactTasksTab";
import ContactEducationTab from "./tabs/ContactEducationTab";

const tabs = [
  { id: "activities", label: "Activity Logs", component: ContactActivitiesTab },
  { id: "applications", label: "Applications", component: ContactApplicationsTab },
  { id: "services", label: "Services", component: ContactServicesTab },
  { id: "appointments", label: "Appointments", component: ContactAppointmentsTab },
  { id: "notes", label: "Notes", component: ContactNotesTab },
  { id: "documents", label: "Documents", component: ContactDocumentsTab },
  { id: "tasks", label: "Tasks", component: ContactTasksTab },
  { id: "education", label: "Education", component: ContactEducationTab },
];

export default function ContactTabsPanel({ contactId }) {
  const [activeTab, setActiveTab] = useState("activities");

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto mb-6">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.98 }}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="contactDetailsTab"
                  className="absolute inset-0 bg-[#3B4CB8] rounded-lg"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.18 }}
        >
          {ActiveComponent ? <ActiveComponent contactId={contactId} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
