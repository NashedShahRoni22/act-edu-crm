"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreVertical,
  TrendingUp,
  Users,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function PartnerCard({
  partner,
  index,
  onEdit,
  onDelete,
  onView,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-[#3B4CB8] w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
            {partner.logo ? (
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {partner.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {partner.name}
            </h3>
            {partner.email && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs truncate">{partner.email}</span>
              </div>
            )}
            {partner.master_category?.name && (
              <span className="inline-block mt-2 px-3 py-1 bg-white border border-[#3B4CB8] text-[#3B4CB8] rounded-full text-xs font-medium">
                {partner.master_category.name}
              </span>
            )}
          </div>
        </div>

        {/* Only auto synced partners cannot be edited or deleted. */}
        {!partner.is_auto_synced && (
          <div className="relative group shrink-0">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-32">
              <Link
                href={`/dashboard/partners/${partner.id}`}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </Link>
              <button
                onClick={() => onEdit(partner)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              {partner.is_deletable && (
                <button
                  onClick={() => onDelete(partner.id, partner.name)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {partner.city && (
          <div>
            <p className="text-xs text-gray-500 mb-0.5">City</p>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">
                {partner.city}
              </p>
            </div>
          </div>
        )}

        {partner.workflow_display && (
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Workflows</p>
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
              {partner.workflow_display}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#EEF2FF] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-[#3B4CB8]" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {partner.products_count}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Products</p>
        </div>

        <div className="bg-[#ECFDF5] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {partner.enrolled_count}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Enrolled</p>
        </div>

        <div className="bg-[#FFFBEB] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {partner.in_progress_count}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
        </div>
      </div>
    </motion.div>
  );
}
