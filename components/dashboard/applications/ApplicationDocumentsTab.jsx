"use client";

import { useRef, useState } from "react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  CheckCircle,
  FileText,
  X,
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

const APP_BLUE = "#3B4CB8";

// ─── Skeleton ────────────────────────────────────────────────────────────────
function DocumentsSkeleton() {
  return (
    <div className="flex h-full animate-pulse">
      {/* sidebar */}
      <div className="w-64 border-r border-gray-100 p-4 space-y-4 shrink-0">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0" />
            <div className="h-3 flex-1 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      {/* table */}
      <div className="flex-1 p-4 space-y-3">
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

// ─── Upload modal ─────────────────────────────────────────────────────────────
function UploadModal({
  checklist,
  applicationId,
  accessToken,
  onClose,
  onSuccess,
}) {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("document_checklist_id", checklist.checklist_id);
      formData.append("workflow_stage_id", checklist.stage_id);
      return postWithToken(
        `/application/${applicationId}/documents`,
        formData,
        accessToken,
      );
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(err?.message || "Upload failed");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Upload Document
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{checklist.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-5 space-y-4">
          {/* drop zone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors py-8 flex flex-col items-center gap-2"
          >
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">
              {selectedFile ? selectedFile.name : "Click to choose a file"}
            </span>
            {selectedFile && (
              <span className="text-xs text-gray-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* footer */}
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => uploadMutation.mutate()}
            disabled={!selectedFile || uploadMutation.isPending}
            className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: APP_BLUE }}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar checklist item ───────────────────────────────────────────────────
function ChecklistItem({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left group"
    >
      {item.is_completed ? (
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 group-hover:border-blue-400 transition-colors" />
      )}
      <span
        className={`text-xs flex-1 leading-snug ${item.is_completed ? "text-gray-500 line-through" : "text-gray-700"}`}
      >
        {item.name}
        {item.is_mandatory && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
        {item.uploaded_count > 0 ? (
          <>
            <Pencil className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span>{item.uploaded_count}</span>
          </>
        ) : (
          <Upload className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
        )}
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ApplicationDocumentsTab({ applicationId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const [uploadTarget, setUploadTarget] = useState(null); // { checklist_id, name, stage_id }
  const [expandedStages, setExpandedStages] = useState({});
  const [activeTab, setActiveTab] = useState("checklist");

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/applications/${applicationId}/checklist-ui`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!applicationId,
  });

  const sidebar = data?.data?.sidebar || [];
  const table = data?.data?.table || [];

  const toggleStage = (stageId) =>
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));

  // Default: all stages expanded on first load
  const isExpanded = (stageId) => expandedStages[stageId] !== false;

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [`/applications/${applicationId}/checklist-ui`, accessToken],
    });
  };

  if (isLoading) return <DocumentsSkeleton />;

  if (isError) {
    return (
      <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 m-4">
        Failed to load documents.
      </div>
    );
  }

  const totalChecklists = sidebar.reduce(
    (acc, s) => acc + s.checklists.length,
    0,
  );
  const completedChecklists = sidebar.reduce(
    (acc, s) => acc + s.checklists.filter((c) => c.is_completed).length,
    0,
  );

  return (
    <>
      <div className="flex flex-col" style={{ minHeight: 400 }}>
        {/* ── Tabs Header ── */}
        <div className="flex items-center gap-6 px-5 border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`py-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === "checklist"
                ? "border-[#3B4CB8] text-[#3B4CB8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Checklist
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {completedChecklists}/{totalChecklists}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "table"
                ? "border-[#3B4CB8] text-[#3B4CB8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 flex flex-col">
          {activeTab === "checklist" ? (
            <div className="flex flex-col flex-1">
              {/* header */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  Document Checklist
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  The changes &amp; addition of the checklist will only be
                  affected to current application only.
                </p>
              </div>

              {/* stage groups */}
              <div className="flex-1 overflow-y-auto py-2">
                {sidebar.map((stage) => (
                  <div key={stage.stage_id} className="mb-2">
                    {/* stage header */}
                    <button
                      onClick={() => toggleStage(stage.stage_id)}
                      className="w-full flex items-center gap-1.5 px-5 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      {isExpanded(stage.stage_id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {stage.stage_name}
                      </span>
                    </button>

                    {/* checklists */}
                    {isExpanded(stage.stage_id) && (
                      <div className="px-5 pb-2 space-y-1">
                        {stage.checklists.map((cl) => (
                          <ChecklistItem
                            key={cl.checklist_id}
                            item={{ ...cl, stage_id: stage.stage_id }}
                            onClick={(item) => setUploadTarget(item)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {[
                        "Filename / Checklist",
                        "Related Stage",
                        "Added By",
                        "Added On",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide bg-gray-50"
                          style={{ color: APP_BLUE }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-10 text-center text-sm text-gray-400"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      table.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          {/* filename */}
                          <td className="px-5 py-3">
                            <a
                              href={row.full_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 group"
                            >
                              <FileText className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                              <div>
                                <p
                                  className="text-xs font-medium group-hover:underline"
                                  style={{ color: APP_BLUE }}
                                >
                                  {row.file_name}
                                </p>
                                {row.checklist_name && (
                                  <p className="text-xs text-gray-400">
                                    {row.checklist_name}
                                  </p>
                                )}
                              </div>
                            </a>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600">
                            {row.related_stage || "—"}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600">
                            {row.added_by || "—"}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500">
                            {row.added_on || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {uploadTarget && (
        <UploadModal
          checklist={uploadTarget}
          applicationId={applicationId}
          accessToken={accessToken}
          onClose={() => setUploadTarget(null)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}