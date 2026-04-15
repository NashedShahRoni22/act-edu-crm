"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PartnerApplicationsTab from "./tabs/PartnerApplicationsTab";
import PartnerProductsTab from "./tabs/PartnerProductsTab";
import PartnerBranchesTab from "./tabs/PartnerBranchesTab";
import PartnerAgreementsTab from "./tabs/PartnerAgreementsTab";
import PartnerContactsTab from "./tabs/PartnerContactsTab";
import PartnerNotesTab from "./tabs/PartnerNotesTab";
import PartnerDocumentsTab from "./tabs/PartnerDocumentsTab";
import PartnerAppointmentsTab from "./tabs/PartnerAppointmentsTab";
import PartnerTasksTab from "./tabs/PartnerTasksTab";

const tabs = [
  { id: "applications", label: "Applications", component: PartnerApplicationsTab },
  { id: "products", label: "Products", component: PartnerProductsTab },
  { id: "branches", label: "Branches", component: PartnerBranchesTab },
  { id: "agreements", label: "Agreements", component: PartnerAgreementsTab },
  { id: "contacts", label: "Contacts", component: PartnerContactsTab },
  { id: "notes", label: "Notes", component: PartnerNotesTab },
  { id: "documents", label: "Documents", component: PartnerDocumentsTab },
  { id: "appointments", label: "Appointments", component: PartnerAppointmentsTab },
  { id: "tasks", label: "Tasks", component: PartnerTasksTab },
];

export default function PartnerTabsPanel({ partnerId }) {
  const [activeTab, setActiveTab] = useState("applications");

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
                  layoutId="partnerDetailsTab"
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
          {ActiveComponent ? <ActiveComponent partnerId={partnerId} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
