"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Mail,
  Menu,
  ChevronDown,
  Settings,
  UserCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/context/context";
import Link from "next/link";
import NotificationCenter from "./NotificationCenter";

export default function Topbar({ toggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { userInfo, logout } = useAppContext();
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = userInfo?.name
    ? userInfo.name.slice(0, 2).toUpperCase()
    : "SA";

  return (
    // No fixed/sticky — sits naturally in the flex column, shrink-0 handled by layout
    <header className="h-16 w-full bg-white border-b border-gray-200 z-30 flex items-center px-4 lg:px-5 gap-3">

      {/* ── Left ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">

        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Add Client */}
        <Link href="/dashboard/add-client" className="flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </motion.button>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contacts…"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Right ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Office Check-in CTA */}
        <Link href="/dashboard/office-checkin" className="hidden sm:block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden lg:inline">Office Check-in</span>
          </motion.button>
        </Link>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

        {/* Mail */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mail"
        >
          <Mail className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Settings */}
        <Link href="/dashboard/settings">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </motion.button>
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User profile */}
        <div className="relative" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {initials}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform duration-200 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userInfo?.name ?? "Super Admin"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {userInfo?.email ?? ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu links */}
                <div className="py-1">
                  {[
                    { label: "Profile Settings", href: "/dashboard/profile" },
                    { label: "Account Settings", href: "/dashboard/settings" },
                    { label: "Preferences", href: "/dashboard/preferences" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}