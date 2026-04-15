"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import ContactEducationList from "./education/ContactEducationList";
import ContactEnglishScores from "./education/ContactEnglishScores";
import ContactOtherScores from "./education/ContactOtherScores";

const EDUCATION_TABS = [
  { id: "education", label: "Education", component: ContactEducationList },
  { id: "english", label: "English Scores", component: ContactEnglishScores },
  { id: "other", label: "Other Scores", component: ContactOtherScores },
];

export default function ContactEducationTab({ contactId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("education");

  // Fetch education records
  const { data: educationData, isLoading: isEducationLoading, refetch: refetchEducation } = useQuery({
    queryKey: [`/contacts/${contactId}/education`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!contactId,
  });

  // Fetch degree levels
  const { data: degreeLevelsData } = useQuery({
    queryKey: ["/degree-levels", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  // Fetch subject areas
  const { data: subjectAreasData } = useQuery({
    queryKey: ["/subject-areas", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  // Fetch english scores
  const { data: englishScoresData, isLoading: isEnglishScoresLoading } = useQuery({
    queryKey: [`/contacts/${contactId}/education/english-scores`, accessToken],
    queryFn: async () => {
      try {
        return await fetchWithToken({
          queryKey: [`/contacts/${contactId}/education/english-scores`, accessToken],
        });
      } catch (error) {
        return { data: null };
      }
    },
    enabled: !!accessToken && !!contactId,
  });

  // Fetch other scores
  const { data: otherScoresData, isLoading: isOtherScoresLoading } = useQuery({
    queryKey: [`/contacts/${contactId}/education/other-scores`, accessToken],
    queryFn: async () => {
      try {
        return await fetchWithToken({
          queryKey: [`/contacts/${contactId}/education/other-scores`, accessToken],
        });
      } catch (error) {
        return { data: null };
      }
    },
    enabled: !!accessToken && !!contactId,
  });

  const handleRefearchAll = () => {
    queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/education`, accessToken] });
    queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/education/english-scores`, accessToken] });
    queryClient.invalidateQueries({ queryKey: [`/contacts/${contactId}/education/other-scores`, accessToken] });
  };

  const TabComponent = EDUCATION_TABS.find((tab) => tab.id === activeTab)?.component;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {EDUCATION_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.98 }}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="educationTab"
                  className="absolute inset-0 bg-[#3B4CB8] rounded-lg"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      {TabComponent && (
        <TabComponent
          contactId={contactId}
          educationData={educationData?.data}
          isEducationLoading={isEducationLoading}
          degreeLevelsData={degreeLevelsData?.data}
          subjectAreasData={subjectAreasData?.data}
          englishScoresData={englishScoresData?.data}
          isEnglishScoresLoading={isEnglishScoresLoading}
          otherScoresData={otherScoresData?.data}
          isOtherScoresLoading={isOtherScoresLoading}
          onRefresh={handleRefearchAll}
        />
      )}
    </motion.div>
  );
}
