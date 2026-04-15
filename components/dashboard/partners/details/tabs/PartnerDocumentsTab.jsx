"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Download, File, FileText, FileJson, Image as ImageIcon } from "lucide-react";
import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

function DocumentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  } else if (mimeType === "application/pdf") {
    return <FileText className="w-5 h-5 text-red-500" />;
  } else if (mimeType.includes("json")) {
    return <FileJson className="w-5 h-5 text-yellow-500" />;
  } else {
    return <File className="w-5 h-5 text-gray-500" />;
  }
}

export default function PartnerDocumentsTab({ partnerId }) {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partner/${partnerId}/documents`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return await postWithToken(`/partner/${partnerId}/documents`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Document uploaded successfully");
        setDialogOpen(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        queryClient.invalidateQueries({
          queryKey: [`/partner/${partnerId}/documents`, accessToken],
        });
      } else {
        toast.error(res.message || "Failed to upload document");
      }
    },
    onError: () => toast.error("Failed to upload document"),
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    uploadDocumentMutation.mutate(selectedFile);
  };

  if (isLoading) return <DocumentsSkeleton />;

  if (isError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
        Failed to load documents.
      </div>
    );
  }

  const documents = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-500">
            {documents.length} document{documents.length === 1 ? "" : "s"}
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Add a new document for this partner.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">
                  Select File <span className="text-red-500">*</span>
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3B4CB8]/40 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedFile ? (
                      <>
                        <span className="text-green-600">✓</span> {selectedFile.name}
                      </>
                    ) : (
                      <>
                        Click to upload or drag and drop
                        <br />
                        <span className="text-xs text-gray-500">
                          Any file type allowed
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  required
                />
              </div>

              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-900">File Details:</p>
                  <p className="text-blue-700 mt-1">
                    Size: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3B4CB8] hover:bg-[#2F3C94] text-white"
                disabled={uploadDocumentMutation.isPending || !selectedFile}
                onClick={handleUpload}
              >
                {uploadDocumentMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!documents.length ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No documents found for this partner.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  {getFileIcon(document.mime_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <a
                        href={document.full_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-[#3B4CB8] hover:text-[#2F3C94] underline wrap-break-word"
                      >
                        {document.file_name}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(document.file_size)} • {formatDate(document.created_at)}
                      </p>
                    </div>
                    <a
                      href={document.full_url}
                      download={document.file_name}
                      className="shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </a>
                  </div>

                  {document.added_by && (
                    <p className="text-xs text-gray-500">
                      Uploaded by {document.added_by.first_name}{" "}
                      {document.added_by.last_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
