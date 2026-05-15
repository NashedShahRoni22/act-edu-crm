"use client";

import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/context/context";
import Link from "next/link";
import NotificationCard from "./NotificationCard";

export default function NotificationCenter() {
  const {
    notifications,
    notificationsQuery,
    markAsReadMutation,
    markAllAsReadMutation,
  } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => n.read_at === null).length;
  const isLoading = notificationsQuery.isLoading;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = notification.read_at === null ? false : true;
                return (
                  <NotificationCard
                    key={notification.id}
                    isRead={isRead}
                    notification={notification}
                    markAsReadMutation={markAllAsReadMutation}
                  />
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Link
                href="/dashboard/notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
