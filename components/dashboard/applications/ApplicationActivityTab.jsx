"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken, putWithToken } from "@/helpers/api";
import { CheckCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const APP_BLUE = "#3B4CB8";

function TimelineSkeleton() {
  return (
    <div className="space-y-0 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function StageIcon({ status, isCurrent }) {
  if (status === "completed") {
    return (
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (isCurrent) {
    return (
      <div
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: APP_BLUE, backgroundColor: "white" }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: APP_BLUE }} />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center shrink-0" />
  );
}

export default function ApplicationActivityTab({ applicationId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/applications/${applicationId}/timeline`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!applicationId,
  });

  const changeStagesMutation = useMutation({
    mutationFn: async (newStageId) => {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("new_stage_id", newStageId);
      return postWithToken(`/applications/${applicationId}/change-stage`, formData, accessToken);
    },
    onSuccess: () => {
      toast.success("Stage updated successfully");
      queryClient.invalidateQueries({ queryKey: [`/applications/${applicationId}/timeline`, accessToken] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update stage");
    },
  });

  const markAsCompleteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("_method", "PUT");
      return postWithToken(`/applications/${applicationId}/complete`, formData, accessToken);
    },
    onSuccess: () => {
      toast.success("Application marked as complete");
      queryClient.invalidateQueries({ queryKey: [`/applications/${applicationId}/timeline`, accessToken] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark as complete");
    },
  });

  if (isLoading) return <TimelineSkeleton />;

  if (isError) {
    return (
      <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        Failed to load activity.
      </div>
    );
  }

  const timeline = data?.data?.timeline || [];
  const progress = data?.data?.progress_percentage ?? null;
  const allStages = data?.data?.stages || [];

  const completedStageIds = new Set(
    timeline.filter((item) => item.status?.toLowerCase() === "completed").map((item) => item.stage_id)
  );

  const firstIncompleteIndex = timeline.findIndex(
    (item) => item.status?.toLowerCase() !== "completed"
  );

  // The current stage is the row marked current; the next stage is the row after it.
  const currentStageIndex = timeline.findIndex((item) => item.status?.toLowerCase() === "current");
  const nextPendingStage = currentStageIndex >= 0 ? timeline[currentStageIndex + 1] : null;
  const isFinalStageCurrent = currentStageIndex >= 0 && currentStageIndex === timeline.length - 1;

  if (!timeline.length) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
        No activity found.
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      {progress !== null && (
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Progress</span>
            <span className="text-xs font-semibold text-gray-700">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: APP_BLUE }}
            />
          </div>
        </div>
      )}

      {/* Timeline rows */}
      <div>
        {timeline.map((item, index) => {
          const isCompleted = item.status?.toLowerCase() === "completed";
          const isCurrent = index === firstIncompleteIndex;
          const isLast = index === timeline.length - 1;

          return (
            <div key={`${item.stage_id}-${index}`}>
              {/* Stage row */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-colors"
                style={isCurrent ? { backgroundColor: "#EEF1FC" } : {}}
              >
                {/* Left: connector line + icon */}
                <div className="flex flex-col items-center self-stretch shrink-0" style={{ width: 24 }}>
                  {/* Top connector */}
                  <div
                    className="w-px flex-1"
                    style={{
                      backgroundColor: index === 0 ? "transparent" : isCompleted ? "#22c55e" : "#e5e7eb",
                      minHeight: 8,
                    }}
                  />
                  <StageIcon status={item.status?.toLowerCase()} isCurrent={isCurrent} />
                  {/* Bottom connector */}
                  <div
                    className="w-px flex-1"
                    style={{
                      backgroundColor: isLast ? "transparent" : isCompleted ? "#22c55e" : "#e5e7eb",
                      minHeight: 8,
                    }}
                  />
                </div>

                {/* Stage name */}
                <span
                  className="text-sm flex-1"
                  style={{
                    color: isCurrent ? APP_BLUE : isCompleted ? "#374151" : "#9ca3af",
                    fontWeight: isCurrent || isCompleted ? 500 : 400,
                  }}
                >
                  {item.stage_name || "Stage"}
                </span>

                {/* Log date badge for completed */}
                {isCompleted && item.log_date && (
                  <span className="text-xs text-gray-400 shrink-0">{item.log_date}</span>
                )}

                {/* Move to next button — shown only on the current (first incomplete) stage */}
                {item.status?.toLowerCase() === "current" && nextPendingStage && (
                  <button
                    onClick={() => changeStagesMutation.mutate(nextPendingStage.stage_id)}
                    disabled={changeStagesMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity disabled:opacity-50 shrink-0"
                    style={{ backgroundColor: APP_BLUE }}
                  >
                    {changeStagesMutation.isPending ? (
                      "Moving..."
                    ) : (
                      <>
                        Move to next
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Log text row (activity log) */}
              {isCurrent && item.log_text && (
                <div className="flex items-start gap-3 px-4 py-2.5 bg-white border-b border-gray-100">
                  <div className="shrink-0 mt-0.5" style={{ width: 24 }}>
                    {/* small activity dot */}
                    <div className="mx-auto w-2.5 h-2.5 rounded-full" style={{ backgroundColor: APP_BLUE }} />
                  </div>
                  <p className="text-xs text-gray-500 leading-5">{item.log_text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mark as Done — only when all complete */}
      {isFinalStageCurrent && (
        <div className="m-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">All stages completed</p>
              <p className="text-xs text-green-700 mt-0.5">Finalize by marking as done</p>
            </div>
          </div>
          <button
            onClick={() => markAsCompleteMutation.mutate()}
            disabled={markAsCompleteMutation.isPending}
            className="px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
          >
            {markAsCompleteMutation.isPending ? "Marking..." : "Mark as Done"}
          </button>
        </div>
      )}
    </div>
  );
}