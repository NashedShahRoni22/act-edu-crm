"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, X, GitBranch, Flag, ChevronDown } from "lucide-react";

export default function ApplicationFields({
  applications,
  setApplications,
  services,
  addApplication,
  removeApplication,
  updateApplication,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#3B4CB8]" />
          Applications
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={addApplication}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {applications.map((app, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-2 border-gray-200 rounded-lg relative"
            >
              {/* Remove button */}
              {applications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeApplication(index)}
                  className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  Application #{index + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service / Application{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={app.unique_id || ""}
                      onChange={(e) => {
                        const selectedService = services.find(
                          (s) => s.unique_id === e.target.value,
                        );
                        if (selectedService) {
                          const updatedApps = [...applications];
                          updatedApps[index] = {
                            ...updatedApps[index],
                            unique_id: selectedService.unique_id,
                            product_id: selectedService.product_id,
                            partner_id: selectedService.partner_id,
                            partner_branch_id:
                              selectedService.partner_branch_id,
                            workflow_id: "",
                            current_stage_id: "",
                          };
                          setApplications(updatedApps);
                        }
                      }}
                      className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                      required
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option
                          key={service.unique_id}
                          value={service.unique_id}
                        >
                          {service.display_label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Workflow Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={app.workflow_id}
                      onChange={(e) =>
                        updateApplication(index, "workflow_id", e.target.value)
                      }
                      disabled={!app.unique_id}
                      className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select Workflow</option>
                      {app.unique_id &&
                        services
                          .find((s) => s.unique_id === app.unique_id)
                          ?.available_workflows.map((workflow) => (
                            <option key={workflow.id} value={workflow.id}>
                              {workflow.name}
                            </option>
                          ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Stage Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Flag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={app.current_stage_id}
                      onChange={(e) =>
                        updateApplication(
                          index,
                          "current_stage_id",
                          e.target.value,
                        )
                      }
                      disabled={!app.workflow_id}
                      className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select Stage</option>
                      {app.workflow_id &&
                        services
                          .find((s) => s.unique_id === app.unique_id)
                          ?.available_workflows.find(
                            (w) => w.id == app.workflow_id,
                          )
                          ?.stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
