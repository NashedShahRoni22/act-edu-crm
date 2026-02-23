"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Percent,
  Upload,
  Check,
  Loader2,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { postWithToken, fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const AGENT_TYPES = [
  { value: "super_agent", label: "Super Agent" },
  { value: "sub_agent", label: "Sub Agent" },
];

const STRUCTURES = [
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
];

const emptyForm = {
  agent_types: [],
  structure: "individual",
  full_name: "",
  business_name: "",
  primary_contact_name: "",
  tax_number: "",
  contract_expiry_date: "",
  email: "",
  phone: "",
  logo: null,
  street: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  offices: [],
  income_sharing_percentage: "",
  claim_revenue_percentage: "",
};

export default function AgentDialog({ open, onOpenChange, agent, viewMode, onSuccess }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(!viewMode);

  // Fetch offices
  const { data: officesData } = useQuery({
    queryKey: ["/offices", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open,
  });
  const offices = officesData?.data || [];

  // Initialize form when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        agent_types: agent.types_raw || [],
        structure: agent.structure?.toLowerCase() || "individual",
        full_name: agent.full_name || "",
        business_name: agent.business_name || "",
        primary_contact_name: agent.primary_contact_name || "",
        tax_number: agent.tax_number || "",
        contract_expiry_date: agent.contract_expiry_date || "",
        email: agent.email || "",
        phone: agent.phone || "",
        logo: null,
        street: agent.street || "",
        city: agent.city || "",
        state: agent.state || "",
        zip_code: agent.zip_code || "",
        country: agent.country || "",
        offices: agent.office_ids || [],
        income_sharing_percentage: agent.income_sharing_percentage || "",
        claim_revenue_percentage: agent.claim_revenue_percentage || "",
      });
      if (agent.logo) setLogoPreview(agent.logo);
    } else {
      setFormData(emptyForm);
      setLogoPreview(null);
    }
    setIsEditing(!viewMode);
    setLogoFile(null);
  }, [agent, viewMode]);

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (fd) => postWithToken("/agents", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Agent created successfully");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to create agent");
      }
    },
    onError: () => toast.error("Failed to create agent"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => postWithToken(`/agents/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Agent updated successfully");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to update agent");
      }
    },
    onError: () => toast.error("Failed to update agent"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Handlers
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleAgentType = (type) => {
    setFormData((prev) => ({
      ...prev,
      agent_types: prev.agent_types.includes(type)
        ? prev.agent_types.filter((t) => t !== type)
        : [...prev.agent_types, type],
    }));
  };

  const toggleOffice = (officeId) => {
    setFormData((prev) => ({
      ...prev,
      offices: prev.offices.includes(officeId)
        ? prev.offices.filter((id) => id !== officeId)
        : [...prev.offices, officeId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (formData.agent_types.length === 0) return toast.error("Select at least one agent type");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.phone.trim()) return toast.error("Phone is required");
    if (formData.offices.length === 0) return toast.error("Select at least one office");

    if (formData.structure === "individual" && !formData.full_name.trim()) {
      return toast.error("Full name is required for individual structure");
    }

    if (formData.structure === "business") {
      if (!formData.business_name.trim()) return toast.error("Business name is required");
      if (!formData.primary_contact_name.trim())
        return toast.error("Primary contact name is required");
      if (!formData.tax_number.trim()) return toast.error("Tax number is required");
      if (!formData.contract_expiry_date.trim())
        return toast.error("Contract expiry date is required");
    }

    const fd = new FormData();
    if (agent) fd.append("_method", "PUT");

    formData.agent_types.forEach((type, i) => fd.append(`agent_types[${i}]`, type));
    fd.append("structure", formData.structure);
    if (formData.full_name) fd.append("full_name", formData.full_name.trim());
    if (formData.business_name) fd.append("business_name", formData.business_name.trim());
    if (formData.primary_contact_name)
      fd.append("primary_contact_name", formData.primary_contact_name.trim());
    if (formData.tax_number) fd.append("tax_number", formData.tax_number.trim());
    if (formData.contract_expiry_date)
      fd.append("contract_expiry_date", formData.contract_expiry_date);
    fd.append("email", formData.email.trim());
    fd.append("phone", formData.phone.trim());
    if (logoFile) fd.append("logo", logoFile);
    if (formData.street) fd.append("street", formData.street.trim());
    if (formData.city) fd.append("city", formData.city.trim());
    if (formData.state) fd.append("state", formData.state.trim());
    if (formData.zip_code) fd.append("zip_code", formData.zip_code.trim());
    if (formData.country) fd.append("country", formData.country.trim());
    formData.offices.forEach((id, i) => fd.append(`offices[${i}]`, id));
    if (formData.income_sharing_percentage)
      fd.append("income_sharing_percentage", formData.income_sharing_percentage);
    if (formData.claim_revenue_percentage)
      fd.append("claim_revenue_percentage", formData.claim_revenue_percentage);

    if (agent) {
      updateMutation.mutate({ id: agent.id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isSubAgent = formData.agent_types.includes("sub_agent");
  const isSuperAgent = formData.agent_types.includes("super_agent");
  const isIndividual = formData.structure === "individual";
  const isBusiness = formData.structure === "business";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {agent ? (viewMode ? "View Agent" : "Edit Agent") : "Add New Agent"}
              </DialogTitle>
              <DialogDescription>
                {agent
                  ? viewMode
                    ? "Agent details"
                    : "Update agent information"
                  : "Create a new agent"}
              </DialogDescription>
            </div>
            {viewMode && agent && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </motion.button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {AGENT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                    formData.agent_types.includes(type.value)
                      ? "bg-primary/10 border-primary"
                      : "border-gray-300 hover:bg-gray-50"
                  } ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.agent_types.includes(type.value)}
                    onChange={() => toggleAgentType(type.value)}
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Structure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Structure <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {STRUCTURES.map((str) => (
                <label
                  key={str.value}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                    formData.structure === str.value
                      ? "bg-primary/10 border-primary"
                      : "border-gray-300 hover:bg-gray-50"
                  } ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    checked={formData.structure === str.value}
                    onChange={() => setFormData((p) => ({ ...p, structure: str.value }))}
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{str.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Logo */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Conditional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isIndividual && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {isBusiness && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, business_name: e.target.value }))
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.primary_contact_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, primary_contact_name: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tax_number}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, tax_number: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.contract_expiry_date}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, contract_expiry_date: e.target.value }))
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email & Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => setFormData((p) => ({ ...p, zip_code: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
              />
            </div>

            {/* Percentages */}
            {isSubAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Sharing %
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.income_sharing_percentage}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, income_sharing_percentage: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {isSuperAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claim Revenue %
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.claim_revenue_percentage}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, claim_revenue_percentage: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Offices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Offices <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
              {offices.map((office) => (
                <label
                  key={office.id}
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                    !isEditing ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.offices.includes(office.id)}
                    onChange={() => toggleOffice(office.id)}
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{office.name}</span>
                </label>
              ))}
            </div>
          </div>

          {isEditing && (
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {agent ? "Save Changes" : "Create Agent"}
                  </>
                )}
              </motion.button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}