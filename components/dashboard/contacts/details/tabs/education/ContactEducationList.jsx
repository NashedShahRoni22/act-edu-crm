"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postWithToken, deleteWithToken, fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function EducationSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-lg p-4">
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ContactEducationList({
  contactId,
  educationData,
  isEducationLoading,
  degreeLevelsData,
  subjectAreasData,
  onRefresh,
}) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    degree_title: "",
    institution: "",
    degree_level_id: "",
    start_date: "",
    end_date: "",
    subject_area_id: "",
    subject_id: "",
    score_type: "Percentage",
    score: "",
  });

  const degreeLevels = degreeLevelsData || [];
  const subjectAreas = subjectAreasData || [];

  // Fetch subjects based on selected subject area
  const { data: subjectsData } = useQuery({
    queryKey: [
      formData.subject_area_id
        ? `/lookups/subject-areas/${formData.subject_area_id}/subjects`
        : "/lookups/subjects",
      accessToken,
    ],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!formData.subject_area_id,
  });

  const subjects = subjectsData?.data || [];

  // Create education mutation
  const createEducationMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append("degree_title", data.degree_title);
      fd.append("institution", data.institution);
      fd.append("degree_level_id", data.degree_level_id);
      if (data.start_date) fd.append("start_date", data.start_date);
      if (data.end_date) fd.append("end_date", data.end_date);
      if (data.subject_area_id) fd.append("subject_area_id", data.subject_area_id);
      if (data.subject_id) fd.append("subject_id", data.subject_id);
      fd.append("score_type", data.score_type);
      if (data.score) fd.append("score", data.score);

      return postWithToken(`/contacts/${contactId}/education`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Education record added successfully");
        setDialogOpen(false);
        resetForm();
        onRefresh();
      } else {
        toast.error(res.message || "Failed to add education record");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add education record");
    },
  });

  // Delete education mutation
  const deleteEducationMutation = useMutation({
    mutationFn: (educationId) =>
      deleteWithToken(
        `/contacts/${contactId}/education/${educationId}`,
        accessToken
      ),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Education record deleted successfully");
        onRefresh();
      } else {
        toast.error(res.message || "Failed to delete education record");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete education record");
    },
  });

  const resetForm = () => {
    setFormData({
      degree_title: "",
      institution: "",
      degree_level_id: "",
      start_date: "",
      end_date: "",
      subject_area_id: "",
      subject_id: "",
      score_type: "Percentage",
      score: "",
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.degree_title.trim()) {
      toast.error("Degree title is required");
      return;
    }
    if (!formData.institution.trim()) {
      toast.error("Institution is required");
      return;
    }
    if (!formData.degree_level_id) {
      toast.error("Degree level is required");
      return;
    }

    createEducationMutation.mutate(formData);
  };

  const getDegreeLevelName = (levelId) => {
    return degreeLevels.find((d) => d.id === levelId)?.name || "-";
  };

  const getSubjectAreaName = (areaId) => {
    return subjectAreas.find((a) => a.id === areaId)?.name || "-";
  };

  const educationRecords = Array.isArray(educationData) ? educationData : [];

  if (isEducationLoading) {
    return <EducationSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Education Records
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </motion.button>
      </div>

      {/* Education Records List */}
      {educationRecords.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            No education records yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {educationRecords.map((education) => (
            <motion.div
              key={education.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {education.degree_title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {education.institution}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <span>
                      <strong>Level:</strong> {getDegreeLevelName(education.degree_level_id)}
                    </span>
                    {education.start_date && (
                      <span>
                        <strong>Start:</strong> {formatDate(education.start_date)}
                      </span>
                    )}
                    {education.end_date && (
                      <span>
                        <strong>End:</strong> {formatDate(education.end_date)}
                      </span>
                    )}
                    {education.subject_area_id && (
                      <span>
                        <strong>Area:</strong>{" "}
                        {getSubjectAreaName(education.subject_area_id)}
                      </span>
                    )}
                    {education.score && (
                      <span>
                        <strong>Score:</strong> {education.score}{" "}
                        {education.score_type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() =>
                      deleteEducationMutation.mutate(education.id)
                    }
                    disabled={deleteEducationMutation.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Education Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[50vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Add Education Record
            </DialogTitle>
            <DialogDescription>
              Fill in the education details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Degree Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Degree Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.degree_title}
                onChange={(e) => handleChange("degree_title", e.target.value)}
                placeholder="e.g., Bachelor of Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleChange("institution", e.target.value)}
                placeholder="e.g., Harvard University"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Degree Level & Score Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Degree Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.degree_level_id}
                  onChange={(e) => handleChange("degree_level_id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="">Select Degree Level</option>
                  {degreeLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Score Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.score_type}
                  onChange={(e) => handleChange("score_type", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="GPA">GPA</option>
                </select>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Subject Area */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Subject Area
              </label>
              <select
                value={formData.subject_area_id}
                onChange={(e) => {
                  handleChange("subject_area_id", e.target.value);
                  handleChange("subject_id", "");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select Subject Area</option>
                {subjectAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            {formData.subject_area_id && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => handleChange("subject_id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Score ({formData.score_type})
              </label>
              <input
                type="number"
                value={formData.score}
                onChange={(e) => handleChange("score", e.target.value)}
                placeholder="e.g., 95 or 3.8"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={createEducationMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50"
            >
              {createEducationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Education"
              )}
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
