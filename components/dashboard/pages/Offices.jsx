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
  Building2,
  MapPin,
  Mail,
  Phone,
  Smartphone,
  User,
  Search,
  Eye,
  X,
  Check,
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
  name: "",
  street: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  email: "",
  phone: "",
  mobile: "",
  contact_person: "",
};

export default function Offices() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [viewingOffice, setViewingOffice] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch offices list
  const { data, isLoading, error } = useQuery({
    queryKey: ["/offices", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const offices = data?.data || [];

  // Filter offices based on search
  const filteredOffices = offices.filter(
    (office) =>
      office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/offices", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Office created successfully");
        handleCloseDialog();
        queryClient.invalidateQueries({ queryKey: ["/offices"] });
      } else {
        toast.error(res.message || "Failed to create office");
      }
    },
    onError: () => toast.error("Failed to create office"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/offices/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Office updated successfully");
        handleCloseDialog();
        queryClient.invalidateQueries({ queryKey: ["/offices"] });
      } else {
        toast.error(res.message || "Failed to update office");
      }
    },
    onError: () => toast.error("Failed to update office"),
  });

  // Handle add new office
  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingOffice(null);
    setShowDialog(true);
  };

  // Handle edit office
  const handleEdit = (office) => {
    setFormData({
      name: office.name || "",
      street: office.street || "",
      city: office.city || "",
      state: office.state || "",
      zip_code: office.zip_code || "",
      country: office.country || "",
      email: office.email || "",
      phone: office.phone || "",
      mobile: office.mobile || "",
      contact_person: office.contact_person || "",
    });
    setEditingOffice(office);
    setShowDialog(true);
  };

  // Handle view office details
  const handleView = async (office) => {
    try {
      const response = await fetchWithToken(`/offices/${office.id}`, accessToken);
      if (response?.data) {
        setViewingOffice(response.data);
        setShowViewDialog(true);
      }
    } catch (error) {
      toast.error("Failed to load office details");
    }
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingOffice(null);
    setFormData(emptyForm);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Office name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    const fd = new FormData();
    if (editingOffice) fd.append("_method", "PUT");

    Object.keys(formData).forEach((key) => {
      fd.append(key, formData[key].trim());
    });

    if (editingOffice) {
      updateMutation.mutate({ id: editingOffice.id, fd });
    } else {
      createMutation.mutate(fd);
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
          <p className="text-sm text-red-800">Failed to load offices</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Offices</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your office locations and contact information
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Office
        </motion.button>
      </div>

      {/* Search Bar */}
      {offices.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offices by name, city, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      )}

      {/* Table */}
      {offices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Building2 className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-500">No offices configured yet</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Office
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
                    Office Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOffices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No offices found matching "{searchQuery}"
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOffices.map((office, index) => (
                    <motion.tr
                      key={office.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Office Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {office.name}
                            </p>
                            <p className="text-xs text-gray-500">ID: {office.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-900">
                            <p>{office.city}, {office.state}</p>
                            <p className="text-xs text-gray-500">{office.country}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {office.email}
                          </div>
                          {office.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {office.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="px-6 py-4">
                        {office.contact_person ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <User className="w-4 h-4 text-gray-400" />
                            {office.contact_person}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleView(office)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button> */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(office)}
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
          {filteredOffices.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredOffices.length}</span> of{" "}
                <span className="font-medium">{offices.length}</span> offices
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffice ? "Edit Office" : "Add New Office"}
            </DialogTitle>
            <DialogDescription>
              {editingOffice
                ? "Update the office information below."
                : "Fill in the details to add a new office location."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Office Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Branch Dhaka"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, street: e.target.value }))
                    }
                    placeholder="e.g., Tajmahal Road"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="e.g., Mohammadpur"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, state: e.target.value }))
                    }
                    placeholder="e.g., Dhaka"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, zip_code: e.target.value }))
                    }
                    placeholder="e.g., 1207"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, country: e.target.value }))
                    }
                    placeholder="e.g., Bangladesh"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
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
                    placeholder="1234566"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, mobile: e.target.value }))
                    }
                    placeholder="234522"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, contact_person: e.target.value }))
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
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
                    {editingOffice ? "Save Changes" : "Create Office"}
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
              <Building2 className="w-5 h-5 text-primary" />
              {viewingOffice?.name}
            </DialogTitle>
            <DialogDescription>Office details and contact information</DialogDescription>
          </DialogHeader>

          {viewingOffice && (
            <div className="space-y-6">
              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                  {viewingOffice.street && <p>{viewingOffice.street}</p>}
                  <p>
                    {viewingOffice.city}, {viewingOffice.state} {viewingOffice.zip_code}
                  </p>
                  <p className="font-medium">{viewingOffice.country}</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{viewingOffice.email}</span>
                  </div>
                  {viewingOffice.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {viewingOffice.phone}
                      </span>
                    </div>
                  )}
                  {viewingOffice.mobile && (
                    <div className="flex items-center gap-3 text-sm">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium text-gray-900">
                        {viewingOffice.mobile}
                      </span>
                    </div>
                  )}
                  {viewingOffice.contact_person && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="font-medium text-gray-900">
                        {viewingOffice.contact_person}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
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
                handleEdit(viewingOffice);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Office
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}