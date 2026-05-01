"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CustomFieldsDialog from "./CustomFieldsDialog";
import CustomFieldsSkeleton from "./CustomFieldsSkeleton";

const MODULES = ["client", "partner", "agent", "product", "application"];

export default function CustomFields() {
  const { accessToken } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("client");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch custom fields
  const { data: fieldsData, isLoading, error } = useQuery({
    queryKey: [
      `/custom-fields?module=${selectedModule}`,
      accessToken,
      refreshKey,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const fields = fieldsData?.data || [];

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Custom Fields</h3>
          <p className="text-gray-600 mt-1">
            Manage custom fields for different modules
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 text-white"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Field
        </Button>
      </div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {MODULES.map((module) => (
              <motion.button
                key={module}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedModule(module)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedModule === module
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <CustomFieldsSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          {fields.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  No custom fields yet
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Create your first custom field for {selectedModule}
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
                      Section
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Options
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Mandatory
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fields.map((field, index) => (
                    <motion.tr
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {field.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {field.section?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                          {field.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex gap-2">
                          {field.allow_multiple && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
                              Multiple
                            </span>
                          )}
                          {field.show_on_list_view && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                              List View
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            field.is_mandatory
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {field.is_mandatory ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            field.status
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {field.status ? "Active" : "Inactive"}
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
      <CustomFieldsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}
