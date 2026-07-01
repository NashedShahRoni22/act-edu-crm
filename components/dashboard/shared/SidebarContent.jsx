"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Settings } from "lucide-react";
import Link from "next/link";
import { railSections } from "./MenuItems";

const isPathActive = (pathname, path) => {
  if (path === "/dashboard") return pathname === path;
  return pathname === path || pathname.startsWith(path + "/");
};

// ── Single nav link ────────────────────────────────────────────────────
function NavItem({ item, pathname, onClose, isMobile }) {
  const active = isPathActive(pathname, item.path);
  return (
    <Link
      href={item.path}
      onClick={isMobile ? onClose : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? "bg-[#3B4CB8] text-white shadow-sm"
          : "text-gray-600 hover:bg-[#3B4CB8]/10 hover:text-gray-900"
      }`}
    >
      <item.icon
        className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-gray-400"}`}
        strokeWidth={1.75}
      />
      <span className={`flex-1 font-medium ${active ? "text-white" : ""}`}>
        {item.label}
      </span>
    </Link>
  );
}

// ── SidebarContent ─────────────────────────────────────────────────────
export default function SidebarContent({
  pathname,
  onClose,
  isMobile,
  userInfo,
  activeSectionKey,
  onTogglePanel,
}) {
  const [search, setSearch] = useState("");

  const activeSection = railSections.find((s) => s.key === activeSectionKey);

  // All items flat for search
  const allItems = activeSection
    ? activeSection.groups.flatMap((g) => g.items)
    : [];

  const filteredItems =
    search.trim().length > 0
      ? allItems.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        )
      : null;

  const initials = userInfo?.name
    ? userInfo.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SA";

  return (
    <>
      {/* ── Search ──────────────────────────────────────────── */}
      <div className="px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#3B4CB8]/20 focus-within:border-[#3B4CB8] transition-all">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSectionKey}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="space-y-0.5"
          >
            {filteredItems ? (
              filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    pathname={pathname}
                    onClose={onClose}
                    isMobile={isMobile}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">
                  No results found
                </p>
              )
            ) : (
              activeSection?.groups.flatMap((group, gi) =>
                group.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    pathname={pathname}
                    onClose={onClose}
                    isMobile={isMobile}
                  />
                )),
              )
            )}
          </motion.div>
        </AnimatePresence>
      </nav>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#3B4CB8] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate leading-tight">
            {userInfo?.name ?? "Super Admin"}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight">
            {userInfo?.role ?? "Administrator"}
          </p>
        </div>
        <Link
          href={"/dashboard/settings"}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors shrink-0"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </Link>
      </div>
    </>
  );
}
