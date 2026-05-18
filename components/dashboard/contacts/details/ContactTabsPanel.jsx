"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  FolderOpen, 
  Briefcase, 
  Calendar, 
  StickyNote, 
  Files, 
  ListTodo, 
  GraduationCap 
} from "lucide-react";

import ContactActivitiesTab from "./tabs/ContactActivitiesTab";
import ContactApplicationsTab from "./tabs/ContactApplicationsTab";
import ContactServicesTab from "./tabs/ContactServicesTab";
import ContactAppointmentsTab from "./tabs/ContactAppointmentsTab";
import ContactNotesTab from "./tabs/ContactNotesTab";
import ContactDocumentsTab from "./tabs/ContactDocumentsTab";
import ContactTasksTab from "./tabs/ContactTasksTab";
import ContactEducationTab from "./tabs/ContactEducationTab";

const tabs = [
  { id: "activities", label: "Activity Logs", icon: Activity, component: ContactActivitiesTab },
  { id: "applications", label: "Applications", icon: FolderOpen, component: ContactApplicationsTab },
  { id: "services", label: "Services", icon: Briefcase, component: ContactServicesTab },
  { id: "appointments", label: "Appointments", icon: Calendar, component: ContactAppointmentsTab },
  { id: "notes", label: "Notes", icon: StickyNote, component: ContactNotesTab },
  { id: "documents", label: "Documents", icon: Files, component: ContactDocumentsTab },
  { id: "tasks", label: "Tasks", icon: ListTodo, component: ContactTasksTab },
  { id: "education", label: "Education", icon: GraduationCap, component: ContactEducationTab },
];

export default function ContactTabsPanel({ contactId }) {
  const [activeTab, setActiveTab] = useState("activities");

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
                  layoutId="contactDetailsTabIndicator"
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
            {ActiveComponent ? <ActiveComponent contactId={contactId} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
