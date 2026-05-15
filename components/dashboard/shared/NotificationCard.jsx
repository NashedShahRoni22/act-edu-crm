import Link from "next/link";

export default function NotificationCard({notification, isRead, markAsReadMutation}) {
  return (
    <Link
      key={notification.id}
      href={`/dashboard${notification.data?.link || ""}`}
      className={`block px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
        isRead ? "" : "bg-blue-50/50"
      }`}
    >
      <div
        onClick={(e) => {
          if (!isRead) {
            e.preventDefault();
            markAsReadMutation.mutate(notification.id);
          }
        }}
        className="flex items-start justify-between gap-2"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {notification.data?.title}
          </p>
          {notification.data?.message && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {notification.data.message}
            </p>
          )}
          {notification.data?.action_by?.name && (
            <p className="text-xs text-gray-500 mt-1">
              By {notification.data.action_by.name}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            {notification.created_at}
          </p>
        </div>
        {isRead === false && (
          <div className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />
        )}
      </div>
    </Link>
  );
}
