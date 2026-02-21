"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarContent from "./SidebarContent";
import { useAppContext } from "@/context/context";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState([]);
  const { userInfo } = useAppContext();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Always Visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        <SidebarContent
          pathname={pathname}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          onClose={() => setIsOpen(false)}
          isMobile={false}
          userInfo={userInfo}
        />
      </aside>

      {/* Mobile Sidebar - Toggle */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col"
      >
        <SidebarContent
          pathname={pathname}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          onClose={() => setIsOpen(false)}
          isMobile={true}
          userInfo={userInfo}
        />
      </motion.aside>
    </>
  );
}