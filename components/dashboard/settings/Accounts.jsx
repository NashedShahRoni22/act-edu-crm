"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, CreditCard, Percent } from "lucide-react";
import BusinessInformation from "./account/Businessinformation";
import ManualPayment from "./account/ManualPayment";
import TaxSettings from "./account/Taxsettings";

const tabs = [
  {
    id: "business-info",
    label: "Business Information",
    icon: Building2,
    component: BusinessInformation,
  },
  {
    id: "manual-payment",
    label: "Manual Payment Details",
    icon: CreditCard,
    component: ManualPayment,
  },
  {
    id: "tax-settings",
    label: "Tax Settings",
    icon: Percent,
    component: TaxSettings,
  },
];

export default function Accounts() {
  const [activeTab, setActiveTab] = useState("business-info");

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
                  layoutId="activeAccountTab"
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