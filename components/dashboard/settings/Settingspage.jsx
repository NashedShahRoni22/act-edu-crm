"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { settingsNavigation } from "./Settingsnavigation";
import SectionContainer from "./Sectioncontainer";

export default function Settingspage() {
  const [activeNav, setActiveNav] = useState("preferences");

  const handleNavClick = (navItem) => {
    setActiveNav(navItem.id);
  };

  const activeNavItem = settingsNavigation.find((nav) => nav.id === activeNav);

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex">
      {/* Settings Navigation Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0"
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Organization Settings
          </h2>
        </div>

        <nav className="px-2 pb-4">
          {settingsNavigation.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              onClick={() => handleNavClick(item)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${
                activeNav === item.id
                  ? "bg-primary/5 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <item.icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    activeNav === item.id ? "text-primary" : "text-gray-500"
                  }`}
                  strokeWidth={1.5}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      activeNav === item.id ? "text-primary" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNav}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {/* Content Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeNavItem?.label}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeNavItem?.description}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <SectionContainer activeNav={activeNav} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}