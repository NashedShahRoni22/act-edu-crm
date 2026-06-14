"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
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

const buildEmptyFormData = () => ({
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

export default function AddClient() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [formData, setFormData] = useState(buildEmptyFormData());
  const [tagsOpen, setTagsOpen] = useState(false);
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
  const services = servicesData?.data || [];

  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/contacts", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Contact created successfully");
        setFormData(buildEmptyFormData());
        setTagsOpen(false);
        setApplications([{ ...emptyApplication }]);
        queryClient.invalidateQueries({ queryKey: ["/contacts"] });
        router.push("/dashboard/contacts");
      } else {
        toast.error(res.message || "Failed to create contact");
      }
    },
    onError: () => toast.error("Failed to create contact"),
  });

  const addApplication = () =>
    setApplications((prev) => [...prev, { ...emptyApplication }]);

  const removeApplication = (index) => {
    if (applications.length > 1)
      setApplications((prev) => prev.filter((_, i) => i !== index));
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
      const id = Number(tagId);
      return {
        ...prev,
        tag_ids: prev.tag_ids.includes(id)
          ? prev.tag_ids.filter((t) => t !== id)
          : [...prev.tag_ids, id],
      };
    });
  };

  const toggleDegreeLevel = (degreeLevelId) => {
    setFormData((prev) => {
      const id = Number(degreeLevelId);
      return {
        ...prev,
        degree_levels: prev.degree_levels.includes(id)
          ? prev.degree_levels.filter((d) => d !== id)
          : [...prev.degree_levels, id],
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
    if (!formData.dob) return toast.error("Date of birth is required");
    if (!formData.gender) return toast.error("Gender is required");
    if (!formData.assignee_id) return toast.error("Assignee is required");
    if (!formData.source) return toast.error("Source is required");

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      if (!app.unique_id)
        return toast.error(`Application ${i + 1}: Service is required`);
      if (!app.workflow_id)
        return toast.error(`Application ${i + 1}: Workflow is required`);
      if (!app.current_stage_id)
        return toast.error(`Application ${i + 1}: Stage is required`);
    }

    const fd = new FormData();
    fd.append("first_name", formData.first_name.trim());
    fd.append("last_name", formData.last_name.trim());
    fd.append("email", formData.email.trim());
    fd.append("secondary_email", formData.secondary_email.trim());
    fd.append("phone", formData.phone.trim());
    fd.append("dob", formData.dob);
    fd.append("gender", formData.gender);
    fd.append("street", formData.street.trim());
    fd.append("city", formData.city.trim());
    fd.append("state", formData.state.trim());
    fd.append("postal_code", formData.postal_code.trim());
    fd.append("country", formData.country);
    fd.append("assignee_id", formData.assignee_id);
    fd.append("source", formData.source);
    formData.tag_ids.forEach((id, i) => fd.append(`tag_ids[${i}]`, String(id)));
    formData.degree_levels.forEach((id, i) =>
      fd.append(`degree_levels[${i}]`, String(id)),
    );
    applications.forEach((app, i) => {
      fd.append(`applications[${i}][product_id]`, app.product_id);
      fd.append(`applications[${i}][partner_id]`, app.partner_id);
      fd.append(`applications[${i}][partner_branch_id]`, app.partner_branch_id);
      fd.append(`applications[${i}][workflow_id]`, app.workflow_id);
      fd.append(`applications[${i}][current_stage_id]`, app.current_stage_id);
    });

    createMutation.mutate(fd);
  };

  const handleReset = () => {
    setFormData(buildEmptyFormData());
    setTagsOpen(false);
    setApplications([{ ...emptyApplication }]);
  };

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-[#3B4CB8] animate-spin" />
      </div>
    );
  }

  return (
    <SectionContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new contact with application details
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

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end gap-3"
        >
          <button
            type="button"
            onClick={handleReset}
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
