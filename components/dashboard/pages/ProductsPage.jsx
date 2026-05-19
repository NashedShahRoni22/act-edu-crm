"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import ProductViewDialog from "../products/Productviewdialog";
import ProductFormDialog from "../products/ProductFormDialog";
import ProductCard from "../products/ProductCard";
import ProductsSkeleton from "../products/ProductsSkeleton";
import ProductsFilterSidebar from "../products/ProductsFilterSidebar";
import SectionContainer from "../SectionContainer";
import Pagination from "../shared/Pagination";

export default function ProductsPage() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery) setCurrentPage(1); // Reset to page 1 on active search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Build query params for API
  const queryParams = new URLSearchParams();
  queryParams.append("page", currentPage.toString());
  if (debouncedSearchQuery) queryParams.append("search", debouncedSearchQuery);
  if (selectedType !== "all") queryParams.append("product_type", selectedType);
  if (selectedPartner !== "all")
    queryParams.append("partner_id", selectedPartner);
  if (selectedStatus === "synced") queryParams.append("is_auto_synced", "1");
  if (selectedStatus === "manual") queryParams.append("is_auto_synced", "0");

  // Fetch products list
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/products?${queryParams.toString()}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const products = productsData?.data || [];
  const meta = productsData?.meta || {};

  // Pagination info from API
  const paginationInfo = useMemo(
    () => ({
      currentPage: productsData?.current_page || 1,
      lastPage: productsData?.last_page || 1,
      total: productsData?.total || 0,
      from: productsData?.from,
      to: productsData?.to,
      hasNextPage: !!productsData?.next_page_url,
      hasPrevPage: !!productsData?.prev_page_url,
    }),
    [productsData],
  );

  // Fetch partners for filter
  const { data: partnersData } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const partners = partnersData?.data || [];

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

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

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
      {/* Main Layout: Sidebar & Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <ProductsFilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          setSelectedType={handleFilterChange(setSelectedType)}
          selectedPartner={selectedPartner}
          setSelectedPartner={handleFilterChange(setSelectedPartner)}
          selectedStatus={selectedStatus}
          setSelectedStatus={handleFilterChange(setSelectedStatus)}
          partners={partners}
          onAdd={handleAdd}
        />

        {/* Right Content Area: Products */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductsSkeleton />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No products found matching these filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
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

          {/* Pagination */}
          <Pagination
            {...paginationInfo}
            onPageChange={setCurrentPage}
            noun="products"
          />
        </div>
      </div>

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
