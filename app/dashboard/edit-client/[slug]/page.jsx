"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Users,
  Briefcase,
  Plus,
  Loader2,
  Check,
  ChevronDown,
  X,
  CalendarDays,
  MapPin,
} from "lucide-react";
import SectionContainer from "@/components/dashboard/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

export default function EditClientPage() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const contactId = params?.slug;

  const [initialized, setInitialized] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    assignee_id: "",
    source: "",
    tag_ids: [],
  });
  const [applications, setApplications] = useState([{ ...emptyApplication }]);

  const { data: usersData } = useQuery({
    queryKey: ["/users", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const users = usersData?.data || [];

  const { data: tagsData } = useQuery({
    queryKey: ["/tags", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const tags = tagsData?.data || [];

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["/services", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const services = servicesData?.data || [];

  const { data: contactData, isLoading: loadingContact, isError } = useQuery({
    queryKey: [`/contacts/${contactId}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!contactId,
  });

  useEffect(() => {
    if (initialized || !contactData?.data) return;

    const contact = contactData.data;

    setFormData({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      dob: contact.dob || "",
      gender: contact.gender || "",
      street: contact.street || "",
      city: contact.city || "",
      state: contact.state || "",
      postal_code: contact.postal_code || "",
      country: contact.country || "",
      assignee_id: contact.assignee_id ? String(contact.assignee_id) : "",
      source: contact.source || "",
      tag_ids: (contact.tags || []).map((tag) => Number(tag.id)),
    });

    const mappedApplications = (contact.applications || []).map((app) => {
      const firstCourse = app.courses?.[0];
      const matchedService = services.find(
        (service) =>
          String(service.product_id) === String(firstCourse?.product_id || "") &&
          String(service.partner_id) === String(firstCourse?.partner_id || "") &&
          String(service.partner_branch_id) === String(firstCourse?.partner_branch_id || "")
      );

      return {
        unique_id: matchedService?.unique_id || "",
        product_id: firstCourse?.product_id ? String(firstCourse.product_id) : "",
        partner_id: firstCourse?.partner_id ? String(firstCourse.partner_id) : "",
        partner_branch_id: firstCourse?.partner_branch_id
          ? String(firstCourse.partner_branch_id)
          : "",
        workflow_id: app.workflow_id ? String(app.workflow_id) : "",
        current_stage_id: app.current_stage_id ? String(app.current_stage_id) : "",
      };
    });

    setApplications(mappedApplications.length > 0 ? mappedApplications : [{ ...emptyApplication }]);
    setInitialized(true);
  }, [contactData, services, initialized]);

  const updateMutation = useMutation({
    mutationFn: async (fd) => postWithToken(`/contacts/${contactId}`, fd, accessToken),
    onSuccess: (res) => {
      if (res?.status === "success") {
        toast.success(res.message || "Contact updated successfully");
        queryClient.invalidateQueries({ queryKey: ["/contacts"] });
        queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}`, accessToken] });
        router.push(`/dashboard/contacts/${contactId}`);
      } else {
        toast.error(res?.message || "Failed to update contact");
      }
    },
    onError: () => toast.error("Failed to update contact"),
  });

  const addApplication = () => {
    setApplications((prev) => [...prev, { ...emptyApplication }]);
  };

  const removeApplication = (index) => {
    if (applications.length === 1) return;
    setApplications((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateApplication = (index, field, value) => {
    setApplications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "workflow_id") updated[index].current_stage_id = "";
      return updated;
    });
  };

  const toggleTag = (tagId) => {
    setFormData((prev) => {
      const normalizedId = Number(tagId);
      const exists = prev.tag_ids.includes(normalizedId);
      return {
        ...prev,
        tag_ids: exists
          ? prev.tag_ids.filter((id) => id !== normalizedId)
          : [...prev.tag_ids, normalizedId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) return toast.error("First name is required");
    if (!formData.last_name.trim()) return toast.error("Last name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.phone.trim()) return toast.error("Phone is required");
    if (!formData.assignee_id) return toast.error("Assignee is required");
    if (!formData.source) return toast.error("Source is required");

    for (let i = 0; i < applications.length; i += 1) {
      const app = applications[i];
      if (!app.product_id || !app.partner_id || !app.partner_branch_id) {
        return toast.error(`Application ${i + 1}: Service is required`);
      }
      if (!app.workflow_id) return toast.error(`Application ${i + 1}: Workflow is required`);
      if (!app.current_stage_id) return toast.error(`Application ${i + 1}: Stage is required`);
    }

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("first_name", formData.first_name.trim());
    fd.append("last_name", formData.last_name.trim());
    fd.append("email", formData.email.trim());
    fd.append("phone", formData.phone.trim());
    fd.append("dob", formData.dob || "");
    fd.append("gender", formData.gender || "");
    fd.append("street", formData.street || "");
    fd.append("city", formData.city || "");
    fd.append("state", formData.state || "");
    fd.append("postal_code", formData.postal_code || "");
    fd.append("country", formData.country || "");
    fd.append("assignee_id", formData.assignee_id);
    fd.append("source", formData.source);

    formData.tag_ids.forEach((tagId, index) => {
      fd.append(`tag_ids[${index}]`, String(tagId));
    });

    applications.forEach((app, index) => {
      fd.append(`applications[${index}][product_id]`, app.product_id);
      fd.append(`applications[${index}][partner_id]`, app.partner_id);
      fd.append(`applications[${index}][partner_branch_id]`, app.partner_branch_id);
      fd.append(`applications[${index}][workflow_id]`, app.workflow_id);
      fd.append(`applications[${index}][current_stage_id]`, app.current_stage_id);
    });

    updateMutation.mutate(fd);
  };

  if (loadingContact || loadingServices) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-[#3B4CB8] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <SectionContainer>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Failed to load client details.
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-gray-500 text-sm mt-1">Update client details and applications</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#3B4CB8]" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.first_name} onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.last_name} onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={formData.dob} onChange={(e) => setFormData((p) => ({ ...p, dob: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignee <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select value={formData.assignee_id} onChange={(e) => setFormData((p) => ({ ...p, assignee_id: e.target.value }))} className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]">
                  <option value="">Select Assignee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={formData.source} onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))} className="w-full px-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]">
                  <option value="">Select Source</option>
                  {SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={formData.street} onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input type="text" value={formData.state} onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input type="text" value={formData.postal_code} onChange={(e) => setFormData((p) => ({ ...p, postal_code: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input type="text" value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full min-h-10.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex flex-wrap gap-1.5 items-center bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] transition-all",
                      formData.tag_ids.length === 0 && "text-gray-400"
                    )}
                  >
                    {formData.tag_ids.length === 0 ? (
                      <span className="flex-1">Select tags...</span>
                    ) : (
                      tags
                        .filter((tag) => formData.tag_ids.includes(Number(tag.id)))
                        .map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 pr-1 text-xs">
                            {tag.name}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTag(tag.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation();
                                  toggleTag(tag.id);
                                }
                              }}
                              className="ml-0.5 hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </Badge>
                        ))
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-56 overflow-y-auto">
                    {tags.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No tags found</p>
                    ) : (
                      tags.map((tag) => {
                        const isSelected = formData.tag_ids.includes(Number(tag.id));
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left",
                              isSelected && "bg-[#3B4CB8]/5"
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                isSelected ? "bg-[#3B4CB8] border-[#3B4CB8]" : "border-gray-300"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{tag.name}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#3B4CB8]" />
              Applications
            </h3>
            <button type="button" onClick={addApplication} className="flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors">
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </div>

          <div className="space-y-4">
            {applications.map((app, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg relative">
                {applications.length > 1 && (
                  <button type="button" onClick={() => removeApplication(index)} className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="mb-3"><span className="text-sm font-semibold text-gray-900">Application #{index + 1}</span></div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service / Application <span className="text-red-500">*</span></label>
                    <select
                      value={app.unique_id || ""}
                      onChange={(e) => {
                        const selectedService = services.find((s) => s.unique_id === e.target.value);
                        if (selectedService) {
                          const updated = [...applications];
                          updated[index] = {
                            unique_id: selectedService.unique_id,
                            product_id: String(selectedService.product_id),
                            partner_id: String(selectedService.partner_id),
                            partner_branch_id: String(selectedService.partner_branch_id),
                            workflow_id: "",
                            current_stage_id: "",
                          };
                          setApplications(updated);
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.unique_id} value={service.unique_id}>{service.display_label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workflow <span className="text-red-500">*</span></label>
                    <select
                      value={app.workflow_id}
                      onChange={(e) => updateApplication(index, "workflow_id", e.target.value)}
                      disabled={!app.unique_id}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Workflow</option>
                      {app.unique_id &&
                        services
                          .find((s) => s.unique_id === app.unique_id)
                          ?.available_workflows.map((workflow) => (
                            <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                          ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage <span className="text-red-500">*</span></label>
                    <select
                      value={app.current_stage_id}
                      onChange={(e) => updateApplication(index, "current_stage_id", e.target.value)}
                      disabled={!app.workflow_id}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Stage</option>
                      {app.workflow_id &&
                        services
                          .find((s) => s.unique_id === app.unique_id)
                          ?.available_workflows.find((w) => String(w.id) === String(app.workflow_id))
                          ?.stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/contacts/${contactId}`)}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Update Contact
              </>
            )}
          </button>
        </motion.div>
      </form>
    </SectionContainer>
  );
}
