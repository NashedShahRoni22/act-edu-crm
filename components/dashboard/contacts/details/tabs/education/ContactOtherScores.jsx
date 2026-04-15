"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import { toast } from "react-hot-toast";

function ScoreSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="h-14 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}

export default function ContactOtherScores({
  contactId,
  otherScoresData,
  isOtherScoresLoading,
  onRefresh,
}) {
  const { accessToken } = useAppContext();

  const [otherScores, setOtherScores] = useState(
    otherScoresData?.other_scores || {
      sat_i: "",
      sat_ii: "",
      gre: "",
      gmat: "",
    }
  );

  const updateOtherScoresMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        _method: "PUT",
        other_scores: data,
      };

      return postWithToken(
        `/contacts/${contactId}/education/other-scores`,
        JSON.stringify(payload),
        accessToken,
        { "Content-Type": "application/json" }
      );
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Other scores updated successfully");
        onRefresh();
      } else {
        toast.error(res.message || "Failed to update other scores");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update other scores");
    },
  });

  const handleScoreChange = (field, value) => {
    setOtherScores((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateOtherScoresMutation.mutate(otherScores);
  };

  if (isOtherScoresLoading) {
    return <ScoreSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* SAT I */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              SAT I
            </label>
            <p className="text-xs text-gray-600 mb-3">Score Range: 400-1600</p>
            <input
              type="number"
              value={otherScores.sat_i}
              onChange={(e) => handleScoreChange("sat_i", e.target.value)}
              placeholder="Enter SAT I score"
              min="400"
              max="1600"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* SAT II */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              SAT II
            </label>
            <p className="text-xs text-gray-600 mb-3">Score Range: 200-800</p>
            <input
              type="number"
              value={otherScores.sat_ii}
              onChange={(e) => handleScoreChange("sat_ii", e.target.value)}
              placeholder="Enter SAT II score"
              min="200"
              max="800"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* GRE */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              GRE
            </label>
            <p className="text-xs text-gray-600 mb-3">Score Range: 260-340</p>
            <input
              type="number"
              value={otherScores.gre}
              onChange={(e) => handleScoreChange("gre", e.target.value)}
              placeholder="Enter GRE score"
              min="260"
              max="340"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* GMAT */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              GMAT
            </label>
            <p className="text-xs text-gray-600 mb-3">Score Range: 200-800</p>
            <input
              type="number"
              value={otherScores.gmat}
              onChange={(e) => handleScoreChange("gmat", e.target.value)}
              placeholder="Enter GMAT score"
              min="200"
              max="800"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
          disabled={updateOtherScoresMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {updateOtherScoresMutation.isPending ? (
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
