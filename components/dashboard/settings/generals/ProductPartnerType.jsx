"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductPartnerTypeDialog from "./ProductPartnerTypeDialog";
import ProductPartnerTypeSkeleton from "./ProductPartnerTypeSkeleton";

export default function ProductPartnerType() {
  const { accessToken } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [type, setType] = useState("partner");

  // For now, placeholder as the API endpoint wasn't specified
  const { data: typesData, isLoading } = useQuery({
    queryKey: [`/settings/types?type=${type}`, accessToken, refreshKey],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const types = typesData?.data || [];

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* types tabs here */}
      <div>
        <button
          onClick={() => setType("partner")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            type === "partner"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Partner Types
        </button>
        <button
          onClick={() => setType("product")}
          className={`px-4 py-2 text-sm font-medium rounded-md ml-2 ${
            type === "product"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Product Types
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 capitalize">
            {type} Types
          </h4>
          <p className="text-gray-600 text-sm mt-1">
            Manage all product and partner category types
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Type
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <ProductPartnerTypeSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          {types.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 font-medium">No types yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Create your first product or partner type
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Master Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {types.map((type, index) => (
                    <motion.tr
                      key={type.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {type.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {type.master_category?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            type.status
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {type.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Dialog */}
      <ProductPartnerTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}
