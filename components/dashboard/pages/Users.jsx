"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  Search,
  Eye,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "react-hot-toast";
import WarningDialog from "@/components/common/WarningDialog";
import UsersSkeleton from "../team/users/UsersSkeleton";
import UserFormDialog from "../team/users/UserFormDialog";
import UserViewDialog from "../team/users/UserViewDialog";
import Pagination from "../shared/Pagination";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  position_title: "",
  office_id: "",
  role: "User",
};

// const USER_ROLES = ["Admin", "User", "Manager", "Agent"];

export default function Users() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusTargetUser, setStatusTargetUser] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (statusFilter && statusFilter !== "all") {
      params.append("status", statusFilter);
    }
    if (roleFilter && roleFilter !== "all") {
      params.append("role", roleFilter);
    }
    if (debouncedSearchQuery) {
      params.append("search", debouncedSearchQuery);
    }

    params.append("row", "10");
    params.append("page", currentPage.toString());

    return params.toString();
  }, [statusFilter, roleFilter, debouncedSearchQuery, currentPage]);

  const refetchUsersList = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey?.[0];
        return typeof key === "string" && key.startsWith("/users?");
      },
    });
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("status", status);
      return postWithToken(`/users/${id}/update-status`, fd, accessToken);
    },
    onSuccess: (res) => {
      setStatusLoadingId(null);
      if (res.status === "success") {
        toast.success(res.message || "User status updated successfully");
        refetchUsersList();
      } else {
        toast.error(res.message || "Failed to update user status");
      }
    },
    onError: () => {
      setStatusLoadingId(null);
      toast.error("Failed to update user status");
    },
  });

  // Fetch users list
  const {
    data: usersData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [`/users?${queryParams}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
    placeholderData: keepPreviousData,
  });

  const users = useMemo(() => usersData?.data || [], [usersData?.data]);
  const showTableSkeleton = isFetching && !!usersData;

  // Fetch offices for dropdown
  const { data: officesData } = useQuery({
    queryKey: ["/offices", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const offices = officesData?.data || [];
  // Fetch roles for dropdown
  const { data: rolesData } = useQuery({
    queryKey: ["/roles", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const roles = useMemo(() => rolesData?.data || [], [rolesData?.data]);
  const roleOptions = useMemo(() => {
    const roleNames = roles
      .map((role) => role?.name || role?.role || "")
      .filter(Boolean);
    return Array.from(new Set(roleNames));
  }, [roles]);

  const paginationInfo = useMemo(
    () => ({
      currentPage: usersData?.current_page || 1,
      lastPage: usersData?.last_page || 1,
      total: usersData?.total || 0,
      from: usersData?.from,
      to: usersData?.to,
      hasNextPage: !!usersData?.next_page_url,
      hasPrevPage: !!usersData?.prev_page_url,
    }),
    [usersData]
  );

  const statusMeta = usersData?.meta || {};

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/users", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "User created successfully");
        handleCloseDialog();
        refetchUsersList();
      } else {
        toast.error(res.message || "Failed to create user");
      }
    },
    onError: () => toast.error("Failed to create user"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/users/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "User updated successfully");
        handleCloseDialog();
        refetchUsersList();
      } else {
        toast.error(res.message || "Failed to update user");
      }
    },
    onError: () => toast.error("Failed to update user"),
  });

  // Handle add new user
  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingUser(null);
    setShowDialog(true);
  };

  // Handle edit user
  const handleEdit = (user) => {
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      position_title: user.position_title || "",
      office_id: user.office_id || "",
      role: user.role || "User",
    });
    setEditingUser(user);
    setShowDialog(true);
  };

  // Handle view user details
  const handleView = (user) => {
    setViewingUser(user);
    setShowViewDialog(true);
  };

  const handleToggleStatus = (user) => {
    setStatusTargetUser(user);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (!statusTargetUser) return;

    const nextStatus = statusTargetUser.status === "active" ? "inactive" : "active";
    setStatusConfirmOpen(false);
    setStatusLoadingId(statusTargetUser.id);
    statusMutation.mutate({ id: statusTargetUser.id, status: nextStatus });
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!formData.last_name.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.office_id) {
      toast.error("Office is required");
      return;
    }

    const fd = new FormData();
    if (editingUser) fd.append("_method", "PUT");

    fd.append("first_name", formData.first_name.trim());
    fd.append("last_name", formData.last_name.trim());
    if (!editingUser) {
      fd.append("email", formData.email.trim());
    }
    fd.append("phone", formData.phone.trim());
    fd.append("position_title", formData.position_title.trim());
    fd.append("office_id", formData.office_id);
    fd.append("role", formData.role);

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  // Get office name by ID
  const getOfficeName = (officeId) => {
    const office = offices.find((o) => o.id === officeId);
    return office?.name || "N/A";
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "manager":
        return "bg-blue-100 text-blue-700";
      case "agent":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <UsersSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load users</p>
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
          if (!open) setStatusTargetUser(null);
        }}
        title={
          statusTargetUser?.status === "active"
            ? "Deactivate User"
            : "Activate User"
        }
        description={
          statusTargetUser?.status === "active"
            ? "Are you sure you want to deactivate this user? They will move to the inactive list."
            : "Are you sure you want to activate this user? They will move back to the active list."
        }
        itemName={statusTargetUser?.first_name ? `${statusTargetUser.first_name} ${statusTargetUser.last_name || ""}`.trim() : ""}
        onConfirm={confirmToggleStatus}
        isLoading={statusMutation.isPending}
        confirmLabel={
          statusTargetUser?.status === "active" ? "Deactivate" : "Activate"
        }
        confirmingLabel={
          statusTargetUser?.status === "active"
            ? "Deactivating..."
            : "Activating..."
        }
      />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusFilter("active");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "active"
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setStatusFilter("inactive");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "inactive"
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Inactive
            </button>
          </div>

          <div className="flex flex-1 flex-wrap md:flex-nowrap gap-3 md:justify-end">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All Roles</option>
              {roleOptions.map((roleName) => (
                <option key={roleName} value={roleName}>
                  {roleName}
                </option>
              ))}
            </select>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {showTableSkeleton ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No users found matching current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {user.first_name?.[0]}
                              {user.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4">
                        {user.position_title ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {user.position_title}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Office */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {getOfficeName(user.office_id)}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleView(user)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleStatus(user)}
                            disabled={statusLoadingId === user.id}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                            title={
                              user.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {statusLoadingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.status === "active" ? (
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
      </div>

      <Pagination {...paginationInfo} onPageChange={setCurrentPage} noun="users" />

      <UserFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isPending={isPending}
        onClose={handleCloseDialog}
        offices={offices}
        roles={roles}
      />

      <UserViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        user={viewingUser}
        getOfficeName={getOfficeName}
        getRoleBadgeColor={getRoleBadgeColor}
        onEdit={() => {
          setShowViewDialog(false);
          handleEdit(viewingUser);
        }}
      />
    </motion.div>
  );
}