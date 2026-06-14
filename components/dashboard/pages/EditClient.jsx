"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Loader2, Check } from "lucide-react";
import SectionContainer from "@/components/dashboard/SectionContainer";
import ClientFormFields from "../clients/ClientFormFields";
import ApplicationFields from "../clients/ApplicationFields";

const emptyApplication = {
  unique_id: "",
  product_id: "",
  partner_id: "",
  partner_branch_id: "",
  workflow_id: "",
  current_stage_id: "",
};

function normalizeDegreeLevels(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item?.id ?? item))
      .filter((item) => Number.isInteger(item) && item > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0);
  }
  return [];
}

export default function EditClient({ slug: contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [applicationsInitialized, setApplicationsInitialized] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    secondary_email: "",
    phone: "",
    dob: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    preferred_intake: "",
    degree_levels: [],
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

  const { data: degreeLevelsData } = useQuery({
    queryKey: ["/degree-levels", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const degreeLevels = degreeLevelsData?.data || [];

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["/services", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const services = useMemo(
    () => servicesData?.data || [],
    [servicesData?.data],
  );

  const {
    data: contactData,
    isLoading: loadingContact,
    isError,
  } = useQuery({
    queryKey: [`/contacts/${contactId}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!contactId,
  });

  useEffect(() => {
    if (initialized || !contactData?.data) return;

    const contact = contactData.data;

    const timer = setTimeout(() => {
      setFormData({
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        secondary_email: contact.secondary_email || "",
        phone: contact.phone || "",
        dob: contact.dob || "",
        gender: contact.gender || "",
        street: contact.street || "",
        city: contact.city || "",
        state: contact.state || "",
        postal_code: contact.postal_code || "",
        country: contact.country || "",
        preferred_intake: contact.preferred_intake || "",
        degree_levels: normalizeDegreeLevels(contact.degree_levels),
        assignee_id: contact.assignee_id ? String(contact.assignee_id) : "",
        source: contact.source || "",
        tag_ids: (contact.tags || []).map((tag) => Number(tag.id)),
      });
      setInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [contactData, initialized]);

  useEffect(() => {
    if (applicationsInitialized || !contactData?.data || services.length === 0)
      return;

    const contact = contactData.data;

    const mappedApplications = (contact.applications || []).map((app) => {
      const firstCourse = app.courses?.[0];
      const matchedService = services.find(
        (service) =>
          String(service.product_id) ===
            String(firstCourse?.product_id || "") &&
          String(service.partner_id) ===
            String(firstCourse?.partner_id || "") &&
          String(service.partner_branch_id) ===
            String(firstCourse?.partner_branch_id || ""),
      );

      return {
        unique_id: matchedService?.unique_id || "",
        product_id: firstCourse?.product_id
          ? String(firstCourse.product_id)
          : "",
        partner_id: firstCourse?.partner_id
          ? String(firstCourse.partner_id)
          : "",
        partner_branch_id: firstCourse?.partner_branch_id
          ? String(firstCourse.partner_branch_id)
          : "",
        workflow_id: app.workflow_id ? String(app.workflow_id) : "",
        current_stage_id: app.current_stage_id
          ? String(app.current_stage_id)
          : "",
      };
    });

    const timer = setTimeout(() => {
      setApplications(
        mappedApplications.length > 0
          ? mappedApplications
          : [{ ...emptyApplication }],
      );
      setApplicationsInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [contactData, services, applicationsInitialized]);

  const updateMutation = useMutation({
    mutationFn: async (fd) =>
      postWithToken(`/contacts/${contactId}`, fd, accessToken),
    onSuccess: (res) => {
      if (res?.status === "success") {
        toast.success(res.message || "Contact updated successfully");
        queryClient.invalidateQueries({ queryKey: ["/contacts"] });
        queryClient.invalidateQueries({
          queryKey: [`/contacts/${contactId}`, accessToken],
        });
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

  const toggleDegreeLevel = (degreeLevelId) => {
    setFormData((prev) => {
      const normalizedId = Number(degreeLevelId);
      const exists = prev.degree_levels.includes(normalizedId);
      return {
        ...prev,
        degree_levels: exists
          ? prev.degree_levels.filter((id) => id !== normalizedId)
          : [...prev.degree_levels, normalizedId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.first_name.trim())
      return toast.error("First name is required");
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
      if (!app.workflow_id)
        return toast.error(`Application ${i + 1}: Workflow is required`);
      if (!app.current_stage_id)
        return toast.error(`Application ${i + 1}: Stage is required`);
    }

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("first_name", formData.first_name.trim());
    fd.append("last_name", formData.last_name.trim());
    fd.append("email", formData.email.trim());
    fd.append("secondary_email", formData.secondary_email.trim());
    fd.append("phone", formData.phone.trim());
    fd.append("dob", formData.dob || "");
    fd.append("gender", formData.gender || "");
    fd.append("street", formData.street || "");
    fd.append("city", formData.city || "");
    fd.append("state", formData.state || "");
    fd.append("postal_code", formData.postal_code || "");
    fd.append("country", formData.country || "");
    fd.append("preferred_intake", formData.preferred_intake || "");
    fd.append("assignee_id", formData.assignee_id);
    fd.append("source", formData.source);

    formData.tag_ids.forEach((tagId, index) => {
      fd.append(`tag_ids[${index}]`, String(tagId));
    });

    formData.degree_levels.forEach((degreeLevelId, index) => {
      fd.append(`degree_levels[${index}]`, String(degreeLevelId));
    });

    applications.forEach((app, index) => {
      fd.append(`applications[${index}][product_id]`, app.product_id);
      fd.append(`applications[${index}][partner_id]`, app.partner_id);
      fd.append(
        `applications[${index}][partner_branch_id]`,
        app.partner_branch_id,
      );
      fd.append(`applications[${index}][workflow_id]`, app.workflow_id);
      fd.append(
        `applications[${index}][current_stage_id]`,
        app.current_stage_id,
      );
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
        <p className="text-gray-500 text-sm mt-1">
          Update client details and applications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ClientFormFields
          formData={formData}
          setFormData={setFormData}
          users={users}
          tags={tags}
          degreeLevels={degreeLevels}
          toggleTag={toggleTag}
          toggleDegreeLevel={toggleDegreeLevel}
          tagsOpen={tagsOpen}
          setTagsOpen={setTagsOpen}
        />

        <ApplicationFields
          applications={applications}
          setApplications={setApplications}
          services={services}
          addApplication={addApplication}
          removeApplication={removeApplication}
          updateApplication={updateApplication}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end gap-3"
        >
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
