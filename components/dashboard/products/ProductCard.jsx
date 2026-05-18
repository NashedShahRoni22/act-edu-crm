"use client";

import { BookOpen, Users, TrendingUp, MapPin, Building2, Eye, Edit, Trash2, MoreVertical } from "lucide-react";

export default function ProductCard({ product, onView, onEdit, onDelete, deleteDisabled }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-[#3B4CB8] w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2">
              {product.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 bg-white border border-[#3B4CB8] text-[#3B4CB8] rounded-full text-xs font-medium">
                {product.product_type}
              </span>
              {product.is_auto_synced ? (
                <span className="inline-block px-3 py-1 bg-[#ECFDF5] border border-[#10B981] text-[#059669] rounded-full text-xs font-medium">
                  Auto Synced
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-medium">
                  Manual
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative group">
          <button className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
            <MoreVertical className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-32">
            <button
              onClick={() => onView(product)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            {product.is_editable && (
              <button
                onClick={() => onEdit(product)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {product.is_deletable && (
              <button
                onClick={() => onDelete(product.id, product.name)}
                disabled={deleteDisabled}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-6">
        {product.partner_name && (
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600">{product.partner_name}</p>
          </div>
        )}
        {product.branches_display && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600">{product.branches_display}</p>
          </div>
        )}
        {product.duration && (
          <div className="text-xs text-gray-500">Duration: {product.duration}</div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#EEF2FF] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-[#3B4CB8]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{product.enrolled_count}</p>
          <p className="text-xs text-gray-500 mt-0.5">Enrolled</p>
        </div>

        <div className="bg-[#FFFBEB] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{product.in_progress_count}</p>
          <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
        </div>
      </div>
    </div>
  );
}
