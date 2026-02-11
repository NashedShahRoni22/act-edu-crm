"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, Phone, Globe, MapPin, Upload, Loader2, Save, Printer } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Preferences() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  // Get agency data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/agency", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const companyData = data?.data;

  // Form state
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    fax: "",
    website: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Initialize form data when company data loads
  useEffect(() => {
    if (companyData) {
      setFormData({
        company_name: companyData.company_name || "",
        email: companyData.contact_info?.email || "",
        phone: companyData.contact_info?.phone || "",
        fax: companyData.contact_info?.fax || "",
        website: companyData.contact_info?.website || "",
        street: companyData.address?.street || "",
        city: companyData.address?.city || "",
        state: companyData.address?.state || "",
        zip: companyData.address?.zip || "",
        country: companyData.address?.country || "",
      });
      if (companyData.logo_url) {
        setLogoPreview(companyData.logo_url);
      }
    }
  }, [companyData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update mutation
  const updateAgencyMutation = useMutation({
    mutationFn: async (formDataToSend) => {
      return await postWithToken(
        `/agency/${companyData.id}`,
        formDataToSend,
        accessToken
      );
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message || "Agency updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["/agency"],
        });
        setLogoFile(null);
      } else {
        toast.error(data.message || "Failed to update agency");
      }
    },
    onError: (error) => {
      toast.error("Failed to update agency");
      console.error(error);
    },
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("_method", "PUT");
    formDataToSend.append("company_name", formData.company_name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("fax", formData.fax);
    formDataToSend.append("website", formData.website);
    formDataToSend.append("street", formData.street);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("zip", formData.zip);
    formDataToSend.append("country", formData.country);

    if (logoFile) {
      formDataToSend.append("logo", logoFile);
    }

    updateAgencyMutation.mutate(formDataToSend);
  };

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
          <p className="text-sm text-red-800">Failed to load agency data</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200"
    >
      <form onSubmit={handleSubmit}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Company Logo
          </h3>
          <div className="flex items-start gap-6">
            <div className="relative">
              {logoPreview ? (
                <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                  <Image
                    src={logoPreview}
                    alt="Company Logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Company Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="company@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="123-456-7890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fax
              </label>
              <div className="relative">
                <Printer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="fax"
                  value={formData.fax}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="123-456-7891"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            Address Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State / Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ZIP / Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
          {/* <button
            type="button"
            onClick={() => {
              if (companyData) {
                setFormData({
                  company_name: companyData.company_name || "",
                  email: companyData.contact_info?.email || "",
                  phone: companyData.contact_info?.phone || "",
                  fax: companyData.contact_info?.fax || "",
                  website: companyData.contact_info?.website || "",
                  street: companyData.address?.street || "",
                  city: companyData.address?.city || "",
                  state: companyData.address?.state || "",
                  zip: companyData.address?.zip || "",
                  country: companyData.address?.country || "",
                });
                setLogoFile(null);
                if (companyData.logo_url) {
                  setLogoPreview(companyData.logo_url);
                }
              }
            }}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
          >
            Cancel
          </button> */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={updateAgencyMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateAgencyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}