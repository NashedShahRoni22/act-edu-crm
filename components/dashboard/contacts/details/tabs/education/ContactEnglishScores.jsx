"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";

const ENGLISH_SCORES_PREFIX = "English Test Scores";

function ScoreSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx}>
          <div className="h-4 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContactEnglishScores({
  contactId,
  englishScoresData,
  isEnglishScoresLoading,
  onRefresh,
}) {
  const { accessToken } = useAppContext();

  const [englishScores, setEnglishScores] = useState(
    englishScoresData?.english_scores || {
      toefl: {
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
        overall: "",
      },
      ielts: {
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
        overall: "",
      },
      pte: {
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
        overall: "",
      },
      duolingo: {
        literacy: "",
        comprehension: "",
        conversation: "",
        production: "",
        overall: "",
      },
    }
  );

  const updateEnglishScoresMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        _method: "PUT",
        english_scores: data,
      };

      return postWithToken(
        `/contacts/${contactId}/education/english-scores`,
        JSON.stringify(payload),
        accessToken,
        { "Content-Type": "application/json" }
      );
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("English scores updated successfully");
        onRefresh();
      } else {
        toast.error(res.message || "Failed to update English scores");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update English scores");
    },
  });

  const handleScoreChange = (test, field, value) => {
    setEnglishScores((prev) => ({
      ...prev,
      [test]: {
        ...prev[test],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    updateEnglishScoresMutation.mutate(englishScores);
  };

  if (isEnglishScoresLoading) {
    return <ScoreSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* TOEFL */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">TOEFL</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Listening
            </label>
            <input
              type="number"
              value={englishScores.toefl.listening}
              onChange={(e) =>
                handleScoreChange("toefl", "listening", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Reading
            </label>
            <input
              type="number"
              value={englishScores.toefl.reading}
              onChange={(e) =>
                handleScoreChange("toefl", "reading", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Writing
            </label>
            <input
              type="number"
              value={englishScores.toefl.writing}
              onChange={(e) =>
                handleScoreChange("toefl", "writing", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Speaking
            </label>
            <input
              type="number"
              value={englishScores.toefl.speaking}
              onChange={(e) =>
                handleScoreChange("toefl", "speaking", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Overall
            </label>
            <input
              type="number"
              value={englishScores.toefl.overall}
              onChange={(e) =>
                handleScoreChange("toefl", "overall", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* IELTS */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IELTS</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Listening
            </label>
            <input
              type="number"
              value={englishScores.ielts.listening}
              onChange={(e) =>
                handleScoreChange("ielts", "listening", e.target.value)
              }
              placeholder="Score"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Reading
            </label>
            <input
              type="number"
              value={englishScores.ielts.reading}
              onChange={(e) =>
                handleScoreChange("ielts", "reading", e.target.value)
              }
              placeholder="Score"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Writing
            </label>
            <input
              type="number"
              value={englishScores.ielts.writing}
              onChange={(e) =>
                handleScoreChange("ielts", "writing", e.target.value)
              }
              placeholder="Score"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Speaking
            </label>
            <input
              type="number"
              value={englishScores.ielts.speaking}
              onChange={(e) =>
                handleScoreChange("ielts", "speaking", e.target.value)
              }
              placeholder="Score"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Overall
            </label>
            <input
              type="number"
              value={englishScores.ielts.overall}
              onChange={(e) =>
                handleScoreChange("ielts", "overall", e.target.value)
              }
              placeholder="Score"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* PTE */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PTE</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Listening
            </label>
            <input
              type="number"
              value={englishScores.pte.listening}
              onChange={(e) =>
                handleScoreChange("pte", "listening", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Reading
            </label>
            <input
              type="number"
              value={englishScores.pte.reading}
              onChange={(e) =>
                handleScoreChange("pte", "reading", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Writing
            </label>
            <input
              type="number"
              value={englishScores.pte.writing}
              onChange={(e) =>
                handleScoreChange("pte", "writing", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Speaking
            </label>
            <input
              type="number"
              value={englishScores.pte.speaking}
              onChange={(e) =>
                handleScoreChange("pte", "speaking", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Overall
            </label>
            <input
              type="number"
              value={englishScores.pte.overall}
              onChange={(e) =>
                handleScoreChange("pte", "overall", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Duolingo */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Duolingo</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Literacy
            </label>
            <input
              type="number"
              value={englishScores.duolingo.literacy}
              onChange={(e) =>
                handleScoreChange("duolingo", "literacy", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Comprehension
            </label>
            <input
              type="number"
              value={englishScores.duolingo.comprehension}
              onChange={(e) =>
                handleScoreChange("duolingo", "comprehension", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Conversation
            </label>
            <input
              type="number"
              value={englishScores.duolingo.conversation}
              onChange={(e) =>
                handleScoreChange("duolingo", "conversation", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Production
            </label>
            <input
              type="number"
              value={englishScores.duolingo.production}
              onChange={(e) =>
                handleScoreChange("duolingo", "production", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Overall
            </label>
            <input
              type="number"
              value={englishScores.duolingo.overall}
              onChange={(e) =>
                handleScoreChange("duolingo", "overall", e.target.value)
              }
              placeholder="Score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={updateEnglishScoresMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {updateEnglishScoresMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Scores
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
