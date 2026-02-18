"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Workflow, FileText } from "lucide-react";
import DocumentTypes from "./workflows/Documenttypes";
import Workflows from "./workflows/Workflows";
import DocumentChecklist from "./workflows/Documentchecklist";

const tabs = [
  {
    id: "workflows",
    label: "Workflows",
    icon: Workflow,
    component: Workflows,
  },
  {
    id: "document-types",
    label: "Document Types",
    icon: FileText,
    component: DocumentTypes,
  },
  {
    id: "document-checklist",
    label: "Document Checklist",
    icon: FileText,
    component: DocumentChecklist,
  },
];

export default function Workflowpage() {
  const [activeTab, setActiveTab] = useState("workflows");

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Pill Style */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {/* Background for active tab */}
              {isActive && (
                <motion.div
                  layoutId="activeWorkflowTab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              <tab.icon
                className={`w-4 h-4 relative z-10`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}