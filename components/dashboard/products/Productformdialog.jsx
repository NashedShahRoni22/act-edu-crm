"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Check, X, Building2, BookOpen, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const emptyForm = {
  name: "",
  partner_id: "",
  branches: [],
  product_type: "Course",
  revenue_type: "1",
  duration: "",
  intake_months: [],
  description: "",
  note: "",
};

const PRODUCT_TYPES = ["Course", "Program", "Certificate", "Workshop"];
const REVENUE_TYPES = [
  { value: "1", label: "Revenue from Client" },
  { value: "2", label: "Commission from Partner" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  onSuccess,
}) {
  const { accessToken } = useAppContext();
  const [formData, setFormData] = useState(emptyForm);
  const [availableBranches, setAvailableBranches] = useState([]);

  // Fetch partners
  const { data: partnersData, isLoading: loadingPartners } = useQuery({
    queryKey: ["/products", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && open,
  });

  const partners = partnersData?.data || [];
  // Update available branches when partner is selected
  useEffect(() => {
    if (formData.partner_id) {
      setAvailableBranches(
        partners.find((p) => p.id === parseInt(formData.partner_id))
          ?.branches || [],
      );
    } else {
      setAvailableBranches([]);
    }
    // Reset selected branches whenever partner changes
    setFormData((prev) => ({ ...prev, branches: [] }));
  }, [formData.partner_id, partners]);

  // Load product data when editing
  useEffect(() => {
    if (editingProduct && open) {
      const loadProductData = async () => {
        try {
          const response = await fetchWithToken({
            queryKey: [`/products/${editingProduct.id}`, accessToken],
          });
          if (response?.data) {
            const productData = response.data;
            setFormData({
              name: productData.name || "",
              partner_id: productData.partner_id || "",
              branches: productData.branch_ids || [],
              product_type: productData.product_type || "Course",
              revenue_type: productData.revenue_type || "1",
              duration: productData.duration || "",
              intake_months: productData.intake_months || [],
              description: productData.description || "",
              note: productData.note || "",
            });
          }
        } catch (error) {
          toast.error("Failed to load product details");
        }
      };
      loadProductData();
    } else if (!editingProduct && open) {
      setFormData(emptyForm);
    }
  }, [editingProduct, open, accessToken]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (fd) => await postWithToken("/products", fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Product created successfully");
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to create product");
      }
    },
    onError: () => toast.error("Failed to create product"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }) =>
      await postWithToken(`/products/${id}`, fd, accessToken),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Product updated successfully");
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to update product");
      }
    },
    onError: () => toast.error("Failed to update product"),
  });

  // Handle branch toggle
  const toggleBranch = (branchId) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.includes(branchId)
        ? prev.branches.filter((id) => id !== branchId)
        : [...prev.branches, branchId],
    }));
  };

  // Handle month toggle
  const toggleMonth = (month) => {
    setFormData((prev) => ({
      ...prev,
      intake_months: prev.intake_months.includes(month)
        ? prev.intake_months.filter((m) => m !== month)
        : [...prev.intake_months, month],
    }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.partner_id) {
      toast.error("Partner is required");
      return;
    }
    if (formData.branches.length === 0) {
      toast.error("Select at least one branch");
      return;
    }
    if (!formData.product_type) {
      toast.error("Product type is required");
      return;
    }
    if (!formData.revenue_type) {
      toast.error("Revenue type is required");
      return;
    }

    const fd = new FormData();
    if (editingProduct) fd.append("_method", "PUT");

    fd.append("name", formData.name.trim());
    fd.append("partner_id", formData.partner_id);
    fd.append("product_type", formData.product_type);
    fd.append("revenue_type", formData.revenue_type);
    fd.append("duration", formData.duration.trim());
    fd.append("note", formData.note.trim());
    fd.append("description", formData.description.trim());

    formData.branches.forEach((branchId, index) => {
      fd.append(`branches[${index}]`, branchId);
    });

    formData.intake_months.forEach((month, index) => {
      fd.append(`intake_months[${index}]`, month);
    });

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Update product information and settings."
              : "Create a new product with all details."}
          </DialogDescription>
        </DialogHeader>

        {loadingPartners ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g., Master of Computer Science"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.partner_id}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, partner_id: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  >
                    <option value="">Select Partner</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.product_type}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        product_type: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  >
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.revenue_type}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        revenue_type: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                    required
                  >
                    {REVENUE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, duration: e.target.value }))
                    }
                    placeholder="e.g., 1 year 2 months 6 weeks"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                  />
                </div>
              </div>
            </div>

            {/* Branches */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Branches <span className="text-red-500">*</span>
              </h3>
              {availableBranches.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  {formData.partner_id
                    ? "No branches available for selected partner"
                    : "Select a partner to see available branches"}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableBranches.map((branch, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.branches.includes(branch.id)}
                        onChange={() => toggleBranch(branch.id)}
                        className="w-4 h-4 text-[#3B4CB8] border-gray-300 rounded focus:ring-2 focus:ring-[#3B4CB8]/50"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 block truncate">
                          {branch.name}
                        </span>
                        {branch.city && (
                          <span className="text-xs text-gray-500">
                            {branch.city}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Intake Months */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Intake Months
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {MONTHS.map((month) => (
                  <label
                    key={month}
                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.intake_months.includes(month)
                        ? "border-[#3B4CB8] bg-[#3B4CB8]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.intake_months.includes(month)}
                      onChange={() => toggleMonth(month)}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.intake_months.includes(month)
                          ? "text-[#3B4CB8]"
                          : "text-gray-700"
                      }`}
                    >
                      {month.substring(0, 3)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description & Note */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, note: e.target.value }))
                  }
                  rows={2}
                  placeholder="Internal notes (not visible to clients)..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] resize-none"
                />
              </div>
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </>
                )}
              </motion.button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
