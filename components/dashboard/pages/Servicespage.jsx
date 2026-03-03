"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Search, Plus, Eye, Edit2, Trash2, Package } from "lucide-react";
import { useState } from "react";

export default function ServicesPage() {
  const {accessToken} = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch services list
  const {
    data: servicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/services", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const services = servicesData?.data || [];

  const filtered = services?.filter((s) =>
    [s.product_name, s.partner_name, s.branch_name, s.display_label]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-400 text-sm">Manage smarter. Perform better.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 focus:border-[#3B4CB8] transition-all"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New
        </motion.button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Product", "Partner", "Branch", "Unique ID", "Workflows"].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      i === 5 ? "text-right" : "text-left"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No services found matching "${searchQuery}"`
                          : "No services found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((service, index) => (
                  <motion.tr
                    key={service.unique_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#3B4CB8]/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[#3B4CB8]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.product_name}</p>
                          <p className="text-xs text-gray-400">ID #{service.product_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 font-medium">{service.partner_name}</p>
                      <p className="text-xs text-gray-400">Partner #{service.partner_id}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{service.branch_name}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono font-medium">
                        {service.unique_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {service.available_workflows.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {service.available_workflows.map((wf) => (
                            <span
                              key={wf.id}
                              className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium"
                            >
                              {wf.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td> */}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filtered.length}</span> of{" "}
              <span className="font-medium">{services.length}</span> services
            </p>
          </div>
        )}
      </div>
    </div>
  );
}