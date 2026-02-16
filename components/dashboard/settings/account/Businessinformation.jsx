"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  FileText,
  Loader2,
  Check,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function BusinessInformation() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [editingRegistration, setEditingRegistration] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  // Fetch Business Registration Number
  const {
    data: registrationData,
    isLoading: loadingRegistration,
    error: errorRegistration,
  } = useQuery({
    queryKey: ["/business-registration-number", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
    onSuccess: (data) => {
      if (data?.data?.registration_number) {
        setRegistrationNumber(data.data.registration_number);
      }
    },
  });

  // Fetch Business Invoice Address
  const {
    data: addressResponseData,
    isLoading: loadingAddress,
    error: errorAddress,
  } = useQuery({
    queryKey: ["/business-invoice-address", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
    onSuccess: (data) => {
      if (data?.data) {
        setAddressData({
          street: data.data.street || "",
          city: data.data.city || "",
          state: data.data.state || "",
          zip_code: data.data.zip_code || "",
          country: data.data.country || "",
        });
      }
    },
  });

  // Update Registration Number mutation
  const updateRegistrationMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/business-registration-number", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Registration number updated successfully");
        setEditingRegistration(false);
        queryClient.invalidateQueries({
          queryKey: ["/business-registration-number"],
        });
      } else {
        toast.error(res.message || "Failed to update registration number");
      }
    },
    onError: () => toast.error("Failed to update registration number"),
  });

  // Update Invoice Address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (fd) =>
      await postWithToken("/business-invoice-address", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Invoice address updated successfully");
        setEditingAddress(false);
        queryClient.invalidateQueries({
          queryKey: ["/business-invoice-address"],
        });
      } else {
        toast.error(res.message || "Failed to update invoice address");
      }
    },
    onError: () => toast.error("Failed to update invoice address"),
  });

  // Handle registration number edit start
  const handleEditRegistration = () => {
    setRegistrationNumber(
      registrationData?.data?.registration_number || ""
    );
    setEditingRegistration(true);
  };

  // Handle registration number cancel
  const handleCancelRegistration = () => {
    setRegistrationNumber(
      registrationData?.data?.registration_number || ""
    );
    setEditingRegistration(false);
  };

  // Handle registration number save
  const handleSaveRegistration = () => {
    if (!registrationNumber.trim()) {
      toast.error("Registration number is required");
      return;
    }

    const fd = new FormData();
    fd.append("registration_number", registrationNumber.trim());
    updateRegistrationMutation.mutate(fd);
  };

  // Handle address edit start
  const handleEditAddress = () => {
    const currentData = addressResponseData?.data || {};
    setAddressData({
      street: currentData.street || "",
      city: currentData.city || "",
      state: currentData.state || "",
      zip_code: currentData.zip_code || "",
      country: currentData.country || "",
    });
    setEditingAddress(true);
  };

  // Handle address cancel
  const handleCancelAddress = () => {
    const currentData = addressResponseData?.data || {};
    setAddressData({
      street: currentData.street || "",
      city: currentData.city || "",
      state: currentData.state || "",
      zip_code: currentData.zip_code || "",
      country: currentData.country || "",
    });
    setEditingAddress(false);
  };

  // Handle address save
  const handleSaveAddress = () => {
    if (!addressData.street.trim()) {
      toast.error("Street is required");
      return;
    }
    if (!addressData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!addressData.state.trim()) {
      toast.error("State is required");
      return;
    }
    if (!addressData.zip_code.trim()) {
      toast.error("Zip code is required");
      return;
    }
    if (!addressData.country.trim()) {
      toast.error("Country is required");
      return;
    }

    const fd = new FormData();
    fd.append("street", addressData.street.trim());
    fd.append("city", addressData.city.trim());
    fd.append("state", addressData.state.trim());
    fd.append("zip_code", addressData.zip_code.trim());
    fd.append("country", addressData.country.trim());
    updateAddressMutation.mutate(fd);
  };

  const isLoading = loadingRegistration || loadingAddress;
  const hasError = errorRegistration || errorAddress;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load business information</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-white rounded-lg border border-gray-200"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your business registration and invoice address details
        </p>
      </div>

      {/* Business Registration Number Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Business Registration Number
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Your official business registration identifier
              </p>
            </div>
          </div>

          {!editingRegistration && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditRegistration}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          {editingRegistration ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g., axy-baxy"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelRegistration}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveRegistration}
                  disabled={updateRegistrationMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateRegistrationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {registrationData?.data?.registration_number ? (
                  <div className="inline-flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span className="text-base font-semibold text-gray-900">
                      {registrationData.data.registration_number}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No registration number set
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Invoice Address Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Business Invoice Address
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Address displayed on invoices and official documents
              </p>
            </div>
          </div>

          {!editingAddress && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditAddress}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          {editingAddress ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressData.street}
                    onChange={(e) =>
                      setAddressData((p) => ({ ...p, street: e.target.value }))
                    }
                    placeholder="e.g., 404, 379 Pitt Street"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="e.g., Melbourne"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) =>
                      setAddressData((p) => ({ ...p, state: e.target.value }))
                    }
                    placeholder="e.g., Victoria"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressData.zip_code}
                    onChange={(e) =>
                      setAddressData((p) => ({ ...p, zip_code: e.target.value }))
                    }
                    placeholder="e.g., MV-431"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressData.country}
                    onChange={(e) =>
                      setAddressData((p) => ({ ...p, country: e.target.value }))
                    }
                    placeholder="e.g., Australia"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelAddress}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveAddress}
                  disabled={updateAddressMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateAddressMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div>
              {addressResponseData?.data?.street ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900 font-medium">
                      {addressResponseData.data.street}
                    </p>
                    <p className="text-sm text-gray-700">
                      {addressResponseData.data.city}, {addressResponseData.data.state}{" "}
                      {addressResponseData.data.zip_code}
                    </p>
                    <p className="text-sm text-gray-700">
                      {addressResponseData.data.country}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No invoice address set
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}