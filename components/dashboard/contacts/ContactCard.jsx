import { motion } from "framer-motion";
import {
  Clock,
  Edit,
  Eye,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
} from "lucide-react";
import Link from "next/link";

export default function ContactCard({
  contact,
  index,
  badgeStyle,
  color,
  initials,
  addedDate,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`${color} w-14 h-14 rounded-full flex items-center justify-center shrink-0`}
          >
            <span className="text-white text-lg font-bold">{initials}</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h3>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeStyle}`}
            >
              {contact.status}
            </span>
          </div>
        </div>
        <Link
          href={`/dashboard/contacts/${contact.id}`}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{contact.phone || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{contact.email || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Added: {addedDate}</span>
        </div>
      </div>

      {/* Applications pill */}
      {contact.applications?.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {contact.applications.map((app) => (
              <span
                key={app.id}
                className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium"
              >
                {app.workflow?.name ?? `App #${app.id}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Source:{" "}
          <span className="font-medium text-gray-900">
            {contact.source || "—"}
          </span>
        </div>
        {/* <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/contacts/${contact.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Message"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div> */}
      </div>
    </motion.div>
  );
}
