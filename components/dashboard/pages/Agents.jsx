"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Download, Eye, Edit2, Loader2, Users, UserCheck, UserX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";
import AgentDialog from "../agents/Agentdialog";

export default function Agents() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(1); // 1 = active, 0 = inactive
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Fetch agents
  const { data, isLoading } = useQuery({
    queryKey: ["/agents", activeTab, accessToken],
    queryFn: () =>
      fetchWithToken({
        queryKey: [`/agents?is_active=${activeTab}`, accessToken],
      }),
    enabled: !!accessToken,
  });

  const agents = data?.data || [];

  // Filter by search
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.phone?.includes(searchQuery)
  );

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      const fd = new FormData();
      fd.append("_method", "PATCH");
      fd.append("is_active", is_active ? 0 : 1);
      return postWithToken(`/agents/${id}/status`, fd, accessToken);
    },
    onSuccess: (res) => {
      setTogglingId(null);
      if (res.status === "success") {
        toast.success(res.message || "Status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["/agents"] });
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: () => {
      setTogglingId(null);
      toast.error("Failed to update status");
    },
  });

  // Handlers
  const handleView = async (agent) => {
    try {
      const res = await fetchWithToken({
        queryKey: [`/agents/${agent.id}`, accessToken],
      });
      if (res?.data) {
        setSelectedAgent(res.data);
        setViewMode(true);
        setShowDialog(true);
      }
    } catch {
      toast.error("Failed to load agent details");
    }
  };

  const handleEdit = async (agent) => {
    try {
      const res = await fetchWithToken({
        queryKey: [`/agents/${agent.id}`, accessToken],
      });
      if (res?.data) {
        setSelectedAgent(res.data);
        setViewMode(false);
        setShowDialog(true);
      }
    } catch {
      toast.error("Failed to load agent details");
    }
  };

  const handleAddNew = () => {
    setSelectedAgent(null);
    setViewMode(false);
    setShowDialog(true);
  };

  const handleToggleStatus = (agent) => {
    const action = agent.is_active ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} ${agent.name}?`)) {
      setTogglingId(agent.id);
      toggleStatusMutation.mutate({ id: agent.id, is_active: agent.is_active });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Agents Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage all agents and their details
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </motion.button>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab(1)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 1
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab(0)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 0
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Search + Import */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Import
            </motion.button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Structure
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Office
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Clients
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No agents found matching "${searchQuery}"`
                          : `No ${activeTab === 1 ? "active" : "inactive"} agents found`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent, index) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.type_display}</p>
                    </td>

                    {/* Structure */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.structure}</p>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.phone}</p>
                    </td>

                    {/* City */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.city}</p>
                    </td>

                    {/* Office */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.associated_offices}</p>
                    </td>

                    {/* Clients */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {agent.clients_count}
                      </span>
                    </td>

                    {/* Applications */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {agent.applications_count}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleView(agent)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(agent)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleStatus(agent)}
                          disabled={togglingId === agent.id}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title={agent.is_active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === agent.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : agent.is_active ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredAgents.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredAgents.length}</span> of{" "}
              <span className="font-medium">{agents.length}</span> agents
            </p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <AgentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        agent={selectedAgent}
        viewMode={viewMode}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedAgent(null);
          queryClient.invalidateQueries({ queryKey: ["/agents"] });
        }}
      />
    </motion.div>
  );
}