"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SidebarContent from "./SidebarContent";
import { useAppContext } from "@/context/context";
import { railSections } from "./MenuItems";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";

// ── helpers ────────────────────────────────────────────────────────────
const isPathActive = (pathname, path) => {
  if (path === "/dashboard") return pathname === path;
  return pathname === path || pathname.startsWith(path + "/");
};

/** Returns the railSection key whose items include the current pathname */
const getActiveSectionKey = (pathname) => {
  for (const section of railSections) {
    for (const group of section.groups) {
      if (group.items.some((item) => isPathActive(pathname, item.path))) {
        return section.key;
      }
    }
  }
  return railSections[0].key; // default to first section
};

// ── CSS custom properties injected once ───────────────────────────────
// You can also move these into globals.css / tailwind config
const SIDEBAR_VARS = `
  :root {
    --sidebar-bg-rail: #1a2035;
    --sidebar-bg-panel: #f8f7ff;
    --sidebar-accent: #6c63ff;
    --sidebar-hover: rgba(108, 99, 255, 0.07);
    --sidebar-group-icon-bg: rgba(108, 99, 255, 0.12);
  }
`;

// ── RailItem ──────────────────────────────────────────────────────────
function RailItem({ section, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      title={section.label}
      className={`
        w-10 h-10 rounded flex flex-col items-center justify-center gap-1 mt-4`}
    >
      <section.icon
        className={`w-5 h-5 transition-colors ${
          isActive ? "text-white" : "text-white/60"
        }`}
        strokeWidth={isActive ? 2 : 1.75}
      />
      <span
        className={`text-[10px] leading-none transition-colors ${
          isActive ? "text-white font-medium" : "text-white/40"
        }`}
      >
        {section.label}
      </span>
    </button>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { userInfo, accessToken } = useAppContext();

  // Fetch permissions list
  const { data, isLoading } = useQuery({
    queryKey: ["/user-permissions", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const permissions = data?.data || [];
  // console.log(permissions);

  const [activeSectionKey, setActiveSectionKey] = useState(() =>
    getActiveSectionKey(pathname),
  );
  const [panelOpen, setPanelOpen] = useState(true);

  // Sync active section when route changes
  useEffect(() => {
    setActiveSectionKey(getActiveSectionKey(pathname));
  }, [pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Handle rail click: switch section, and toggle panel open/closed.
  // - Clicking the already-active section toggles the panel.
  // - Clicking a different section switches to it and ensures panel is open.
  const handleRailClick = useCallback((key) => {
    setActiveSectionKey((prevKey) => {
      if (prevKey === key) {
        setPanelOpen((p) => !p);
      } else {
        setPanelOpen(true);
      }
      return key;
    });
  }, []);

  const togglePanel = useCallback(() => setPanelOpen((p) => !p), []);

  // ── Shared icon rail markup ──────────────────────────────────────────
  const IconRail = () => (
    <div className="w-[60px] bg-[#1a2035] flex flex-col items-center pt-3 pb-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 mb-4 bg-[#3B4CB8] rounded-xl flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-xs">ACT</span>
      </div>

      {/* Section buttons */}
      {railSections.map((section) => (
        <RailItem
          key={section.key}
          section={section}
          isActive={activeSectionKey === section.key}
          onClick={() => handleRailClick(section.key)}
        />
      ))}

      {/* Expand button — only shown when the panel is collapsed */}
      {!panelOpen ? (
        <button
          onClick={togglePanel}
          title="Expand sidebar"
          className="w-10 h-10 rounded flex items-center justify-center mt-4 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <PanelLeftOpen className="w-5 h-5" strokeWidth={1.75} />
        </button>
      ) : (
        <button
          onClick={togglePanel}
          title="Expand sidebar"
          className="w-10 h-10 rounded flex items-center justify-center mt-4 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <PanelLeftClose className="w-5 h-5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );

  // ── Expand panel (desktop) ───────────────────────────────────────────
  const ExpandPanel = () => (
    <AnimatePresence initial={false}>
      {panelOpen && (
        <motion.div
          key="panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 220, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
          className="overflow-hidden flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full"
          style={{ minWidth: 0 }}
        >
          {/* min-w to stop content from squishing during animation */}
          <div className="w-[220px] flex flex-col h-full">
            <SidebarContent
              pathname={pathname}
              onClose={() => setIsOpen(false)}
              isMobile={false}
              userInfo={userInfo}
              activeSectionKey={activeSectionKey}
              onTogglePanel={togglePanel}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Inject CSS variables */}
      <style>{SIDEBAR_VARS}</style>

      {/* ── Mobile overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 top-16 bottom-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:shrink-0 border-none overflow-visible z-50 relative">
        <div className="flex h-full bg-[#1a2035] overflow-hidden border-r border-gray-200">
          <IconRail />
          <ExpandPanel />
        </div>
      </aside>

      {/* ── Mobile sidebar ───────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
        className="lg:hidden fixed top-16 bottom-0 left-0 z-50 flex border-r border-gray-200 shadow-xl"
        style={{ width: 280 }}
      >
        {/* Rail still visible on mobile */}
        <IconRail />

        {/* Full content panel */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          <SidebarContent
            pathname={pathname}
            onClose={() => setIsOpen(false)}
            isMobile={true}
            userInfo={userInfo}
            activeSectionKey={activeSectionKey}
            onTogglePanel={() => setIsOpen(false)}
          />
        </div>
      </motion.aside>
    </>
  );
}
