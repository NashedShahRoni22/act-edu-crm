"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  MapPin,
  Loader2,
  Edit2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  StickyNote,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ProductViewDialog({ open, onOpenChange, product, onEdit }) {
  const { accessToken } = useAppContext();

  // Fetch full product details
  const { data, isLoading } = useQuery({
    queryKey: ["/products", product?.id, accessToken],
    queryFn: () => fetchWithToken(`/products/${product?.id}`, accessToken),
    enabled: !!accessToken && !!product?.id && open,
  });

  const productData = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#3B4CB8] flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">{productData?.name}</div>
              <div className="flex items-center gap-2 mt-1">
                {productData?.product_type && (
                  <span className="text-xs px-2 py-0.5 bg-[#3B4CB8]/10 text-[#3B4CB8] rounded-full font-medium">
                    {productData.product_type}
                  </span>
                )}
                {productData?.is_auto_synced ? (
                  <span className="text-xs px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded-full font-medium">
                    Auto Synced
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                    Manual
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>Product details and information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : productData ? (
          <div className="space-y-6">
            {/* Partner & Branch Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3B4CB8]" />
                Partner & Location
              </h3>
              <div className="space-y-3">
                {productData.partner_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Partner</p>
                      <p className="text-sm font-medium text-gray-900">
                        {productData.partner_name}
                      </p>
                    </div>
                  </div>
                )}
                {productData.branches_display && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Branches</p>
                      <p className="text-sm font-medium text-gray-900">
                        {productData.branches_display}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3B4CB8]" />
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Revenue Type</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {productData.revenue_type === "1"
                        ? "Revenue from Client"
                        : "Commission from Partner"}
                    </p>
                  </div>
                </div>
                {productData.duration && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">
                        {productData.duration}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Intake Months */}
            {productData.intake_months && productData.intake_months.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#3B4CB8]" />
                  Intake Months
                </h3>
                <div className="flex flex-wrap gap-2">
                  {productData.intake_months.map((month, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#3B4CB8]/10 text-[#3B4CB8] rounded-lg text-xs font-medium"
                    >
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {productData.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3B4CB8]" />
                  Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {productData.description}
                  </p>
                </div>
              </div>
            )}

            {/* Internal Note */}
            {productData.note && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-[#3B4CB8]" />
                  Internal Note
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {productData.note}
                  </p>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EEF2FF] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#3B4CB8]" />
                    <p className="text-xs text-gray-600">Enrolled</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {productData.enrolled_count}
                  </p>
                </div>
                <div className="bg-[#FFFBEB] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {productData.in_progress_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            {productData.sync_status && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Sync Status
                    </p>
                    <p className="text-sm text-blue-700">{productData.sync_status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            No product data available
          </div>
        )}

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {productData?.is_editable && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onOpenChange(false);
                onEdit(productData);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Product
            </motion.button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}