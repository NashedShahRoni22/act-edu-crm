"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit2,
  Loader2,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";
import WarningDialog from "@/components/common/WarningDialog";
import AgentDialog from "../agents/Agentdialog";
import AgentsSkeleton from "../agents/AgentsSkeleton";
import Pagination from "../shared/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Agents() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(1); // 1 = active, 0 = inactive
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState({ type: null, id: null });
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusTargetAgent, setStatusTargetAgent] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("is_active", activeTab.toString());
    params.append("row", "10");
    params.append("page", currentPage.toString());

    if (debouncedSearchQuery) {
      params.append("search", debouncedSearchQuery);
    }

    return params.toString();
  }, [activeTab, currentPage, debouncedSearchQuery]);

  const refetchAgentsList = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey?.[0];
        return typeof key === "string" && key.startsWith("/agents?");
      },
    });
  };

  // Fetch agents
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [`/agents?${queryParams}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
    placeholderData: keepPreviousData,
  });

  const agents = useMemo(() => data?.data || [], [data?.data]);
  const showTableSkeleton = isFetching && !!data;
  const paginationInfo = useMemo(
    () => ({
      currentPage: data?.current_page || 1,
      lastPage: data?.last_page || 1,
      total: data?.total || 0,
      from: data?.from,
      to: data?.to,
      hasNextPage: !!data?.next_page_url,
      hasPrevPage: !!data?.prev_page_url,
    }),
    [data],
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
      setLoadingAction({ type: null, id: null });
      if (res.status === "success") {
        toast.success(res.message || "Status updated successfully");
        refetchAgentsList();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: () => {
      setTogglingId(null);
      setLoadingAction({ type: null, id: null });
      toast.error("Failed to update status");
    },
  });

  // Handlers
  const handleView = async (agent) => {
    setLoadingAction({ type: "view", id: agent.id });
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
    } finally {
      setLoadingAction({ type: null, id: null });
    }
  };

  const handleEdit = async (agent) => {
    setLoadingAction({ type: "edit", id: agent.id });
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
    } finally {
      setLoadingAction({ type: null, id: null });
    }
  };

  const handleAddNew = () => {
    setSelectedAgent(null);
    setViewMode(false);
    setShowDialog(true);
  };

  const handleToggleStatus = (agent) => {
    setStatusTargetAgent(agent);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (!statusTargetAgent) return;
    setStatusConfirmOpen(false);
    setTogglingId(statusTargetAgent.id);
    setLoadingAction({ type: "toggle", id: statusTargetAgent.id });
    toggleStatusMutation.mutate({
      id: statusTargetAgent.id,
      is_active: statusTargetAgent.is_active,
    });
  };

  if (isLoading) {
    return <AgentsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load agents</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <WarningDialog
        open={statusConfirmOpen}
        onOpenChange={(open) => {
          setStatusConfirmOpen(open);
          if (!open) setStatusTargetAgent(null);
        }}
        title={
          statusTargetAgent?.is_active ? "Deactivate Agent" : "Activate Agent"
        }
        description={
          statusTargetAgent?.is_active
            ? "Are you sure you want to deactivate this agent? They will move to the inactive list."
            : "Are you sure you want to activate this agent? They will move back to the active list."
        }
        itemName={statusTargetAgent?.name}
        onConfirm={confirmToggleStatus}
        isLoading={toggleStatusMutation.isPending}
        confirmLabel={statusTargetAgent?.is_active ? "Deactivate" : "Activate"}
        confirmingLabel={
          statusTargetAgent?.is_active ? "Deactivating..." : "Activating..."
        }
      />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Agents Management
          </h2>
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
              onClick={() => {
                setActiveTab(1);
                setCurrentPage(1);
              }}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 1
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setActiveTab(0);
                setCurrentPage(1);
              }}
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
                placeholder="Search name, business, phone, email..."
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
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Structure
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  City
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Office
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Clients
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applications
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showTableSkeleton ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-gray-50 transition-colors animate-pulse"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                          <div className="h-3 w-32 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-6 w-12 bg-blue-100 rounded-full" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-6 w-12 bg-green-100 rounded-full" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {Array.from({ length: 3 }).map((__, btnIdx) => (
                          <div
                            key={btnIdx}
                            className="w-10 h-10 bg-gray-200 rounded-lg"
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No agents found matching "${searchQuery}"`
                          : `No ${activeTab === 1 ? "active" : "inactive"} agents found`}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent, index) => (
                  <TableRow
                    key={agent.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {agent.type_display}
                      </p>
                    </TableCell>

                    {/* Structure */}
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.structure}</p>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.phone}</p>
                    </TableCell>

                    {/* City */}
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-gray-600">{agent.city}</p>
                    </TableCell>

                    {/* Office */}
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {agent.associated_offices}
                      </p>
                    </TableCell>

                    {/* Clients */}
                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {agent.clients_count}
                      </span>
                    </TableCell>

                    {/* Applications */}
                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {agent.applications_count}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleView(agent)}
                          disabled={
                            loadingAction.type === "view" &&
                            loadingAction.id === agent.id
                          }
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          {loadingAction.type === "view" &&
                          loadingAction.id === agent.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(agent)}
                          disabled={
                            loadingAction.type === "edit" &&
                            loadingAction.id === agent.id
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          {loadingAction.type === "edit" &&
                          loadingAction.id === agent.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit2 className="w-4 h-4" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleStatus(agent)}
                          disabled={
                            loadingAction.type === "toggle" &&
                            loadingAction.id === agent.id
                          }
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title={agent.is_active ? "Deactivate" : "Activate"}
                        >
                          {loadingAction.type === "toggle" &&
                          loadingAction.id === agent.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : agent.is_active ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        {...paginationInfo}
        onPageChange={setCurrentPage}
        noun="agents"
      />

      {/* Dialog */}
      <AgentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        agent={selectedAgent}
        viewMode={viewMode}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedAgent(null);
          refetchAgentsList();
        }}
      />
    </motion.div>
  );
}
