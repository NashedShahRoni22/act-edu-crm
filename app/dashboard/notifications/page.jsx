"use client";

import { useAppContext } from "@/context/context";
import Link from "next/link";
import { ChevronLeft, CheckCheck, Trash2, Bell } from "lucide-react";
import SectionContainer from "@/components/dashboard/SectionContainer";
import NotificationCard from "@/components/dashboard/shared/NotificationCard";

export default function NotificationsPage() {
  const {
    notifications,
    notificationsQuery,
    markAsReadMutation,
    markAllAsReadMutation,
  } = useAppContext();

  const unreadCount = notifications.filter((n) => n.read_at === null).length;
  const isLoading = notificationsQuery.isLoading;

  return (
    <SectionContainer>
      <section className="bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link> */}
              <h1 className="text-lg font-semibold text-gray-900">
                Notifications
              </h1>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    No notifications
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              </div>
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

        {/* Empty State for Read Notifications */}
        {!isLoading && notifications.length > 0 && unreadCount === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            All notifications marked as read
          </div>
        )}
      </section>
    </SectionContainer>
  );
}
