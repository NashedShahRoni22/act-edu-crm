"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  TrendingUp,
  MapPin,
  Building2,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Plus,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ProductViewDialog from "../products/Productviewdialog";
import ProductFormDialog from "../products/ProductFormDialog";
import ProductCard from "../products/ProductCard";
import ProductsSkeleton from "../products/ProductsSkeleton";
import SectionContainer from "../SectionContainer";

export default function ProductsPage() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Fetch products list
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/products", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const products = productsData?.data || [];

  // Fetch partners for filter
  const { data: partnersData } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const partners = partnersData?.data || [];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const typeMatch =
      selectedType === "all" || product.product_type === selectedType;
    const partnerMatch =
      selectedPartner === "all" ||
      product.partner_id === parseInt(selectedPartner);
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "synced" && product.is_auto_synced) ||
      (selectedStatus === "manual" && !product.is_auto_synced);
    return typeMatch && partnerMatch && statusMatch;
  });

  // Calculate stats
  const stats = [
    {
      count: filteredProducts.length,
      label: "Total products",
      subtitle: "Active courses",
      icon: BookOpen,
      bgColor: "bg-[#3B4CB8]",
    },
    {
      count: filteredProducts.reduce(
        (sum, p) => sum + (p.enrolled_count || 0),
        0,
      ),
      label: "Total Enrolled",
      subtitle: "Students enrolled",
      icon: Users,
      bgColor: "bg-[#1FB3C8]",
    },
    {
      count: filteredProducts.reduce(
        (sum, p) => sum + (p.in_progress_count || 0),
        0,
      ),
      label: "In Progress",
      subtitle: "Active learners",
      icon: TrendingUp,
      bgColor: "bg-[#F5C842]",
    },
    {
      count: new Set(filteredProducts.flatMap((p) => p.branch_ids || [])).size,
      label: "Branches",
      subtitle: "Location",
      icon: MapPin,
      bgColor: "bg-[#2DD4BF]",
    },
  ];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/products/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Product deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/products"] });
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    },
    onError: () => toast.error("Failed to delete product"),
  });

  // Handle add
  const handleAdd = () => {
    setEditingProduct(null);
    setShowAddDialog(true);
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddDialog(true);
  };

  // Handle view
  const handleView = (product) => {
    setViewingProduct(product);
  };

  // Handle delete
  const handleDelete = (id, name) => {
    if (
      window.confirm(`Delete product "${name}"? This action cannot be undone.`)
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <SectionContainer>
        <ProductsSkeleton />
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load products</p>
        </div>
      </div>
    );
  }

  return (
    <SectionContainer>
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm">
          Manage educational courses and programs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div
                className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center shrink-0`}
              >
                <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stat.count}
                </h3>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-6 mb-6"
      >
        <div className="flex flex-col gap-4">
          {/* Top Row - Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Left Side - Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
                >
                  <option value="all">All Product Types</option>
                  <option value="Course">Course</option>
                  <option value="Program">Program</option>
                  <option value="Certificate">Certificate</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
                >
                  <option value="all">All Partners</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
                >
                  <option value="all">All Sync Status</option>
                  <option value="synced">Auto Synced</option>
                  <option value="manual">Manual Sync</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#3B4CB8] text-[#3B4CB8] rounded-lg text-sm font-medium hover:bg-[#3B4CB8]/5 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                More Filters
              </motion.button>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Sync All
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Import
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>

          {/* Results Count */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {products.length}
              </span>{" "}
              products
            </p>
          </div>
        </div>
      </motion.div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <ProductCard
                product={product}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteDisabled={deleteMutation.isPending}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <ProductFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        editingProduct={editingProduct}
        onSuccess={() => {
          setShowAddDialog(false);
          setEditingProduct(null);
          queryClient.invalidateQueries({ queryKey: ["/products"] });
        }}
      />

      {/* View Dialog */}
      <ProductViewDialog
        open={!!viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
        product={viewingProduct}
        onEdit={(product) => {
          setViewingProduct(null);
          handleEdit(product);
        }}
      />
    </SectionContainer>
  );
}