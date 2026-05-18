"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderOpen, 
  Package, 
  Network, 
  Handshake, 
  Users, 
  StickyNote, 
  Files, 
  Calendar, 
  ListTodo 
} from "lucide-react";

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
  { id: "applications", label: "Applications", icon: FolderOpen, component: PartnerApplicationsTab },
  { id: "products", label: "Products", icon: Package, component: PartnerProductsTab },
  { id: "branches", label: "Branches", icon: Network, component: PartnerBranchesTab },
  { id: "agreements", label: "Agreements", icon: Handshake, component: PartnerAgreementsTab },
  { id: "contacts", label: "Contacts", icon: Users, component: PartnerContactsTab },
  { id: "notes", label: "Notes", icon: StickyNote, component: PartnerNotesTab },
  { id: "documents", label: "Documents", icon: Files, component: PartnerDocumentsTab },
  { id: "appointments", label: "Appointments", icon: Calendar, component: PartnerAppointmentsTab },
  { id: "tasks", label: "Tasks", icon: ListTodo, component: PartnerTasksTab },
];

export default function PartnerTabsPanel({ partnerId }) {
  const [activeTab, setActiveTab] = useState("applications");

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="bg-white min-h-screen rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row gap-5">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-48 lg:w-52 shrink-0 flex flex-col gap-0.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors ${
                isActive ? "text-[#3B4CB8]" : "text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="partnerDetailsTabIndicator"
                  className="absolute inset-0 bg-[#3B4CB8]/10 border border-[#3B4CB8]/20 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon strokeWidth={isActive ? 2 : 1.75} className={`relative z-10 w-4 h-4 shrink-0 transition-colors ${isActive ? "text-[#3B4CB8]" : "text-gray-400"}`} />
              <span className="relative z-10 flex-1 truncate">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Component Area */}
      <div className="flex-1 min-w-0 bg-gray-50/50 rounded-xl border border-gray-100 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {ActiveComponent ? <ActiveComponent partnerId={partnerId} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
