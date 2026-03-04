"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Users,
  Briefcase,
  Plus,
  Trash2,
  Loader2,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import SectionContainer from "@/components/dashboard/SectionContainer";

const emptyApplication = {
  unique_id: "",
  product_id: "",
  partner_id: "",
  partner_branch_id: "",
  workflow_id: "",
  current_stage_id: "",
};

const SOURCES = [
  "Facebook Lead Ads",
  "Google Ads",
  "Website",
  "Referral",
  "Walk-in",
  "Phone Call",
  "Email",
  "LinkedIn",
  "Instagram",
  "Other",
];

export default function AddClientPage() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    assignee_id: "",
    source: "",
  });

  const [applications, setApplications] = useState([{ ...emptyApplication }]);

  // Fetch users for assignee
  const { data: usersData } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const users = usersData?.data || [];

  // Fetch services (products with branches and workflows)
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["/services", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const services = servicesData?.data || [];

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/contacts", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Contact created successfully");
        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          assignee_id: "",
          source: "",
        });
        setApplications([{ ...emptyApplication }]);
        queryClient.invalidateQueries({ queryKey: ["/contacts"] });
      } else {
        toast.error(res.message || "Failed to create contact");
      }
    },
    onError: () => toast.error("Failed to create contact"),
  });

  // Add new application
  const addApplication = () => {
    setApplications([...applications, { ...emptyApplication }]);
  };

  // Remove application
  const removeApplication = (index) => {
    if (applications.length > 1) {
      setApplications(applications.filter((_, i) => i !== index));
    }
  };

  // Update application field
  const updateApplication = (index, field, value) => {
    const updatedApps = [...applications];
    updatedApps[index] = { ...updatedApps[index], [field]: value };

    // Reset stage when workflow changes
    if (field === "workflow_id") {
      updatedApps[index].current_stage_id = "";
    }

    setApplications(updatedApps);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
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
    if (!formData.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    if (!formData.assignee_id) {
      toast.error("Assignee is required");
      return;
    }
    if (!formData.source) {
      toast.error("Source is required");
      return;
    }

    // Validate applications
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      if (!app.unique_id) {
        toast.error(`Application ${i + 1}: Service is required`);
        return;
      }
      if (!app.workflow_id) {
        toast.error(`Application ${i + 1}: Workflow is required`);
        return;
      }
      if (!app.current_stage_id) {
        toast.error(`Application ${i + 1}: Stage is required`);
        return;
      }
    }

    // Build FormData
    const fd = new FormData();
    fd.append("first_name", formData.first_name.trim());
    fd.append("last_name", formData.last_name.trim());
    fd.append("email", formData.email.trim());
    fd.append("phone", formData.phone.trim());
    fd.append("assignee_id", formData.assignee_id);
    fd.append("source", formData.source);

    applications.forEach((app, index) => {
      fd.append(`applications[${index}][product_id]`, app.product_id);
      fd.append(`applications[${index}][partner_id]`, app.partner_id);
      fd.append(`applications[${index}][partner_branch_id]`, app.partner_branch_id);
      fd.append(`applications[${index}][workflow_id]`, app.workflow_id);
      fd.append(`applications[${index}][current_stage_id]`, app.current_stage_id);
    });

    createMutation.mutate(fd);
  };

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#3B4CB8] animate-spin" />
      </div>
    );
  }

  return (
    <SectionContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new contact with application details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#3B4CB8]" />
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.assignee_id}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, assignee_id: e.target.value }))
                  }
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  required
                >
                  <option value="">Select Assignee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, source: e.target.value }))
                  }
                  className="w-full px-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  required
                >
                  <option value="">Select Source</option>
                  {SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Applications */}
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border-2 border-gray-200 rounded-lg relative"
                >
                  {/* Remove button */}
                  {applications.length > 1 && (
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

                  <div className="grid grid-cols-1 gap-4">
                    {/* Service Selection (Product + Partner + Branch combined) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service / Application <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={app.unique_id || ""}
                        onChange={(e) => {
                          const selectedService = services.find(
                            (s) => s.unique_id === e.target.value
                          );
                          if (selectedService) {
                            const updatedApps = [...applications];
                            updatedApps[index] = {
                              unique_id: selectedService.unique_id,
                              product_id: selectedService.product_id,
                              partner_id: selectedService.partner_id,
                              partner_branch_id: selectedService.partner_branch_id,
                              workflow_id: "",
                              current_stage_id: "",
                            };
                            setApplications(updatedApps);
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                        required
                      >
                        <option value="">Select Service</option>
                        {services.map((service) => (
                          <option key={service.unique_id} value={service.unique_id}>
                            {service.display_label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Workflow Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Workflow <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={app.workflow_id}
                        onChange={(e) =>
                          updateApplication(index, "workflow_id", e.target.value)
                        }
                        disabled={!app.unique_id}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Select Workflow</option>
                        {app.unique_id &&
                          services
                            .find((s) => s.unique_id === app.unique_id)
                            ?.available_workflows.map((workflow) => (
                              <option key={workflow.id} value={workflow.id}>
                                {workflow.name}
                              </option>
                            ))}
                      </select>
                    </div>

                    {/* Stage Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stage <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={app.current_stage_id}
                        onChange={(e) =>
                          updateApplication(
                            index,
                            "current_stage_id",
                            e.target.value
                          )
                        }
                        disabled={!app.workflow_id}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Select Stage</option>
                        {app.workflow_id &&
                          services
                            .find((s) => s.unique_id === app.unique_id)
                            ?.available_workflows.find(
                              (w) => w.id == app.workflow_id
                            )
                            ?.stages.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end gap-3"
        >
          <button
            type="button"
            onClick={() => {
              setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                assignee_id: "",
                source: "",
              });
              setApplications([{ ...emptyApplication }]);
            }}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Contact
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </SectionContainer>
  );
}