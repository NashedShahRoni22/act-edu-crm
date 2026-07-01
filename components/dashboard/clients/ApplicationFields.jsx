"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";

function ApplicationItem({
  app,
  index,
  updateApplication,
  removeApplication,
  canRemove,
}) {
  const { accessToken } = useAppContext();

  const { data: workflowsData, isLoading: isWorkflowsLoading } = useQuery({
    queryKey: ["/workflows?with=stages", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const { data: partnersData, isLoading: isPartnersLoading } = useQuery({
    queryKey: [`/partners?workflow_id=${app.workflow_id}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!app.workflow_id,
  });

  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    queryKey: [
      app.partner_id ? `/partners/${app.partner_id}/branches` : "/partners/0/branches",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!app.partner_id,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: [
      app.partner_id ? `/products?partner_id=${app.partner_id}` : "/products?partner_id=0",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!app.partner_id,
  });

  const workflows = workflowsData?.data || [];
  const partners = partnersData?.data || [];
  const branches = branchesData?.data || [];
  const products = productsData?.data || [];

  const selectedWorkflow = workflows.find((w) => w.id.toString() === app.workflow_id.toString());
  const stages = selectedWorkflow?.stages || [];

  const handleWorkflowChange = (e) => {
    updateApplication(index, "workflow_id", e.target.value);
    updateApplication(index, "current_stage_id", "");
    updateApplication(index, "partner_id", "");
    updateApplication(index, "partner_branch_id", "");
    updateApplication(index, "product_id", "");
  };

  const handlePartnerChange = (e) => {
    updateApplication(index, "partner_id", e.target.value);
    updateApplication(index, "partner_branch_id", "");
    updateApplication(index, "product_id", "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border-2 border-gray-200 rounded-lg relative"
    >
      {canRemove && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workflow Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workflow
          </label>
          <select
            value={app.workflow_id}
            onChange={handleWorkflowChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isWorkflowsLoading}
          >
            <option value="">{isWorkflowsLoading ? "Loading workflows..." : "Select workflow"}</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stage Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Stage
          </label>
          <select
            value={app.current_stage_id}
            onChange={(e) => updateApplication(index, "current_stage_id", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
            disabled={!app.workflow_id}
          >
            <option value="">{!app.workflow_id ? "Select workflow first" : "Select stage"}</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        {/* Partner Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partner
          </label>
          <select
            value={app.partner_id}
            onChange={handlePartnerChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
            disabled={!app.workflow_id || isPartnersLoading}
          >
            <option value="">
              {!app.workflow_id ? "Select workflow first" : isPartnersLoading ? "Loading partners..." : "Select partner"}
            </option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Partner Branch Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partner Branch
          </label>
          <select
            value={app.partner_branch_id}
            onChange={(e) => updateApplication(index, "partner_branch_id", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
            disabled={!app.partner_id || isBranchesLoading}
          >
            <option value="">
              {!app.partner_id ? "Select partner first" : isBranchesLoading ? "Loading branches..." : "Select branch"}
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name || `Branch #${branch.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <select
            value={app.product_id}
            onChange={(e) => updateApplication(index, "product_id", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
            disabled={!app.partner_id || isProductsLoading}
          >
            <option value="">
              {!app.partner_id ? "Select partner first" : isProductsLoading ? "Loading products..." : "Select product"}
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicationFields({
  applications,
  setApplications,
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
            <ApplicationItem
              key={index}
              app={app}
              index={index}
              updateApplication={updateApplication}
              removeApplication={removeApplication}
              canRemove={applications.length > 1}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
