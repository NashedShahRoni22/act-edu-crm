"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  Search,
  Eye,
  Check,
  UserCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  position_title: "",
  office_id: "",
  role: "User",
};

const USER_ROLES = ["Admin", "User", "Manager", "Agent"];

export default function Users() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const users = data?.data || [];

  // Fetch offices for dropdown
  const { data: officesData } = useQuery({
    queryKey: ["/offices", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const offices = officesData?.data || [];

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/users", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "User created successfully");
        handleCloseDialog();
        queryClient.invalidateQueries({ queryKey: ["/users"] });
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
        queryClient.invalidateQueries({ queryKey: ["/users"] });
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
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
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
      {users.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      )}

      {/* Table */}
      {users.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <UserCircle className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No users added yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First User
          </motion.button>
        </div>
      ) : (
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No users found matching "{searchQuery}"
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
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
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
                <span className="font-medium">{users.length}</span> users
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update the user information below."
                : "Fill in the details to add a new user."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, first_name: e.target.value }))
                    }
                    placeholder="John"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, last_name: e.target.value }))
                    }
                    placeholder="Doe"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                    disabled={!!editingUser}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="12345"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Work Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title
                  </label>
                  <input
                    type="text"
                    value={formData.position_title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, position_title: e.target.value }))
                    }
                    placeholder="Executive"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.office_id}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, office_id: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    <option value="">Select an office</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, role: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingUser ? "Save Changes" : "Create User"}
                  </>
                )}
              </motion.button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              {viewingUser?.first_name} {viewingUser?.last_name}
            </DialogTitle>
            <DialogDescription>User details and information</DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">
                      {viewingUser.email}
                    </span>
                  </div>
                  {viewingUser.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {viewingUser.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Work Information
                </h3>
                <div className="space-y-3">
                  {viewingUser.position_title && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium text-gray-900">
                        {viewingUser.position_title}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Office:</span>
                    <span className="font-medium text-gray-900">
                      {getOfficeName(viewingUser.office_id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Role:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        viewingUser.role
                      )}`}
                    >
                      {viewingUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setShowViewDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowViewDialog(false);
                handleEdit(viewingUser);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit User
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}