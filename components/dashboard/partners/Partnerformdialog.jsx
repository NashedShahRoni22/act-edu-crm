"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Loader2,
  Check,
  X,
  Plus,
  Building2,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  master_category: "",
  partner_type: "",
  business_registration_number: "",
  show_on_invoice: false,
  currency: "AED",
  workflows: [],
  street: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  phone: "",
  email: "",
  fax: "",
  website: "",
  logo: null,
  branches: [],
};

const emptyBranch = {
  name: "",
  email: "",
  city: "",
  country: "",
};

const CURRENCIES = ["AED", "USD", "EUR", "GBP", "AUD", "CAD"];

export default function PartnerFormDialog({
  open,
  onOpenChange,
  editingPartner,
  onSuccess,
}) {
  const { accessToken } = useAppContext();
  const [formData, setFormData] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Fetch master categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["/partners/master-categories", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open,
  });

  const categories = categoriesData?.data || [];

  // Fetch partner types based on selected category
  const { data: partnerTypesData, isLoading: loadingTypes } = useQuery({
    queryKey: [
      `/partners/partner-types/${formData.master_category}`,
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!formData.master_category && open,
  });

  const partnerTypes = partnerTypesData?.data || [];

  // Fetch workflows
  const { data: workflowsData } = useQuery({
    queryKey: ["/workflows", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open,
  });

  const workflows = workflowsData?.data || [];

  // Load partner data when editing
  useEffect(() => {
    if (editingPartner && open) {
      const loadPartnerData = async () => {
        try {
          const response = await fetchWithToken({
            queryKey: [`/partners/${editingPartner.id}`, accessToken],
          });

          if (response?.data) {
            const partnerData = response.data;

            setFormData({
              name: partnerData.name || "",
              master_category: partnerData.master_category?.id || "",
              partner_type: partnerData.partner_type?.id || "",
              business_registration_number:
                partnerData.business_registration_number || "",
              show_on_invoice: partnerData.show_on_invoice || false,
              currency: partnerData.currency || "AED",
              workflows: partnerData.workflow_ids || [],
              street: partnerData.street || "",
              city: partnerData.city || "",
              state: partnerData.state || "",
              zip_code: partnerData.zip_code || "",
              country: partnerData.country || "",
              phone: partnerData.phone || "",
              email: partnerData.email || "",
              fax: partnerData.fax || "",
              website: partnerData.website || "",
              logo: null,
              branches: partnerData.branches || [],
            });

            if (partnerData.logo) {
              setLogoPreview(partnerData.logo);
            }
          }
        } catch (error) {
          toast.error("Failed to load partner details");
        }
      };
      loadPartnerData();
    } else if (!editingPartner && open) {
      setFormData(emptyForm);
      setLogoFile(null);
      setLogoPreview(null);
    }
  }, [editingPartner, open, accessToken]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/partners", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Partner created successfully");
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to create partner");
      }
    },
    onError: () => toast.error("Failed to create partner"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/partners/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Partner updated successfully");
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to update partner");
      }
    },
    onError: () => toast.error("Failed to update partner"),
  });

  // Reset partner type when category changes (only for new partners)
  useEffect(() => {
    if (formData.master_category && !editingPartner) {
      setFormData((prev) => ({ ...prev, partner_type: "" }));
    }
  }, [formData.master_category, editingPartner]);

  // Handle workflow toggle
  const toggleWorkflow = (workflowId) => {
    setFormData((prev) => ({
      ...prev,
      workflows: prev.workflows.includes(workflowId)
        ? prev.workflows.filter((id) => id !== workflowId)
        : [...prev.workflows, workflowId],
    }));
  };

  // Add branch
  const addBranch = () => {
    setFormData((prev) => ({
      ...prev,
      branches: [...prev.branches, { ...emptyBranch }],
    }));
  };

  // Remove branch
  const removeBranch = (index) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  };

  // Update branch
  const updateBranch = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === index ? { ...branch, [field]: value } : branch,
      ),
    }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Partner name is required");
      return;
    }
    if (!formData.master_category) {
      toast.error("Master category is required");
      return;
    }
    if (!formData.partner_type) {
      toast.error("Partner type is required");
      return;
    }
    if (!formData.currency) {
      toast.error("Currency is required");
      return;
    }
    if (formData.workflows.length === 0) {
      toast.error("Select at least one workflow");
      return;
    }

    const fd = new FormData();
    if (editingPartner) fd.append("_method", "PUT");

    if (logoFile) {
      fd.append("logo", logoFile);
    }

    fd.append("name", formData.name.trim());
    fd.append("master_category", formData.master_category);
    fd.append("partner_type", formData.partner_type);
    fd.append(
      "business_registration_number",
      formData.business_registration_number.trim(),
    );
    fd.append("show_on_invoice", formData.show_on_invoice ? "1" : "0");
    fd.append("currency", formData.currency);

    formData.workflows.forEach((workflowId, index) => {
      fd.append(`workflows[${index}]`, workflowId);
    });

    fd.append("street", formData.street.trim());
    fd.append("city", formData.city.trim());
    fd.append("state", formData.state.trim());
    fd.append("zip_code", formData.zip_code.trim());
    fd.append("country", formData.country.trim());
    fd.append("phone", formData.phone.trim());
    fd.append("email", formData.email.trim());
    fd.append("fax", formData.fax.trim());
    fd.append("website", formData.website.trim());

    formData.branches.forEach((branch, index) => {
      fd.append(`branches[${index}][name]`, branch.name.trim());
      fd.append(`branches[${index}][email]`, branch.email.trim());
      fd.append(`branches[${index}][city]`, branch.city.trim());
      fd.append(`branches[${index}][country]`, branch.country.trim());
    });

    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPartner ? "Edit Partner" : "Add New Partner"}
          </DialogTitle>
          <DialogDescription>
            {editingPartner
              ? "Update partner information and settings."
              : "Create a new partner with all details."}
          </DialogDescription>
        </DialogHeader>

        {loadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Basic Information
              </h3>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Partner Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Master Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.master_category}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        master_category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.partner_type}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          partner_type: e.target.value,
                        }))
                      }
                      disabled={!formData.master_category || loadingTypes}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100"
                      required
                    >
                      <option value="">Select Type</option>
                      {partnerTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {loadingTypes && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, currency: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.business_registration_number}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        business_registration_number: e.target.value,
                      }))
                    }
                    placeholder="Registration Number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_on_invoice}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        show_on_invoice: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-[#3B4CB8] border-gray-300 rounded focus:ring-2 focus:ring-[#3B4CB8]/50"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show on Invoice
                  </span>
                </label>
              </div>
            </div>

            {/* Workflows */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Workflows <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {workflows.map((workflow) => (
                  <label
                    key={workflow.id}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.workflows.includes(workflow.id)}
                      onChange={() => toggleWorkflow(workflow.id)}
                      className="w-4 h-4 text-[#3B4CB8] border-gray-300 rounded focus:ring-2 focus:ring-[#3B4CB8]/50"
                    />
                    <span className="text-sm text-gray-700">
                      {workflow.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact & Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Contact & Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
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
                    placeholder="+1234567890"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, website: e.target.value }))
                    }
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fax
                  </label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fax: e.target.value }))
                    }
                    placeholder="Fax Number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  />
                </div>

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
                    placeholder="Street Address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
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
                    placeholder="City"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
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
                    placeholder="State"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
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
                    placeholder="Zip Code"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
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
                    placeholder="Country"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  />
                </div>
              </div>
            </div>

            {/* Branches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Branches
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addBranch}
                  className="flex items-center gap-1 text-xs text-[#3B4CB8] hover:text-[#2F3C94]"
                >
                  <Plus className="w-4 h-4" />
                  Add Branch
                </motion.button>
              </div>

              {formData.branches.map((branch, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeBranch(index)}
                    className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={branch.name}
                        onChange={(e) =>
                          updateBranch(index, "name", e.target.value)
                        }
                        placeholder="Branch Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        value={branch.email}
                        onChange={(e) =>
                          updateBranch(index, "email", e.target.value)
                        }
                        placeholder="Branch Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={branch.city}
                        onChange={(e) =>
                          updateBranch(index, "city", e.target.value)
                        }
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={branch.country}
                        onChange={(e) =>
                          updateBranch(index, "country", e.target.value)
                        }
                        placeholder="Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingPartner ? "Save Changes" : "Create Partner"}
                  </>
                )}
              </motion.button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}