"use client";

import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Bell,
  Mail,
  Calendar,
  User,
  Menu,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useState } from "react";

export default function Topbar({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { userInfo, logout } = useAppContext();

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Add Client Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </motion.button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Contacts"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Office Check-in Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden lg:inline">Office Check-in</span>
          </motion.button>

          {/* Icon Buttons */}
          <div className="flex items-center gap-1">
            {/* Calendar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
            </motion.button>

            {/* Mail */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          New application submitted
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          2 hours ago
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Calendar */}
            <Link href="/dashboard/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </Link>
          </div>

          {/* User Profile */}
          <div className="relative ml-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-medium text-sm">
                {userInfo?.name?.slice(0, 2).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </motion.button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo?.name}
                  </p>
                  <p className="text-xs text-gray-500">{userInfo?.email}</p>
                </div>
                <div className="py-2">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Profile Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Account Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Preferences
                  </a>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={logout}
                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {/* <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Contacts"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div> */}
    </header>
  );
}

// Add this import at the top if not already there
import { UserCheck } from "lucide-react";
import { useAppContext } from "@/context/context";
import Link from "next/link";
