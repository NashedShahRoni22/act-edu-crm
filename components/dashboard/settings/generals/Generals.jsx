"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProductPartnerType from "./ProductPartnerType";
import DiscountedReason from "./DiscountedReason";

export default function Generals() {
  const [activeTab, setActiveTab] = useState("product-partner-type");

  const tabs = [
    { id: "product-partner-type", label: "Product/Partner Type" },
    { id: "discounted-reason", label: "Discounted Reason" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tabs */}
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 cursor-pointer rounded-md font-medium transition-all text-sm ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {activeTab === "product-partner-type" && <ProductPartnerType />}
        {activeTab === "discounted-reason" && <DiscountedReason />}
      </motion.div>
    </motion.div>
  );
}
