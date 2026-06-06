"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import ProductViewDialog from "../products/Productviewdialog";
import ProductFormDialog from "../products/ProductFormDialog";
import ProductCard from "../products/ProductCard";
import ProductsSkeleton from "../products/ProductsSkeleton";
import ProductsFilterSidebar from "../products/ProductsFilterSidebar";
import SectionContainer from "../SectionContainer";
import Pagination from "../shared/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                      <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Product
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Partner
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Duration
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Enrolled
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        In Progress
                      </TableHead>
                      <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-gray-200 rounded" />
                              <div className="h-5 w-20 bg-gray-100 rounded-full" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="h-4 w-28 bg-gray-200 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="h-4 w-16 bg-gray-200 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="h-6 w-12 bg-blue-100 rounded-lg mx-auto" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="h-6 w-12 bg-yellow-100 rounded-lg mx-auto" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {Array.from({ length: 3 }).map((__, btnIdx) => (
                              <div
                                key={btnIdx}
                                className="w-8 h-8 bg-gray-200 rounded-lg"
                              />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No products found matching these filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                        <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Product
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Partner
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Location
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Duration
                        </TableHead>
                        <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Enrolled
                        </TableHead>
                        <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          In Progress
                        </TableHead>
                        <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Product */}
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#3B4CB8] w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                <BookOpen
                                  className="w-5 h-5 text-white"
                                  strokeWidth={2}
                                />
                              </div>
                              <div className="max-w-[220px]">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {product.name}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="inline-block px-2 py-0.5 bg-white border border-[#3B4CB8] text-[#3B4CB8] rounded-full text-xs font-medium">
                                    {product.product_type}
                                  </span>
                                  {product.is_auto_synced ? (
                                    <span className="inline-block px-2 py-0.5 bg-[#ECFDF5] border border-[#10B981] text-[#059669] rounded-full text-xs font-medium">
                                      Auto Synced
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-xs font-medium">
                                      Manual
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Partner */}
                          <TableCell className="px-6 py-4">
                            {product.partner_name ? (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate max-w-[160px]">
                                  {product.partner_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>

                          {/* Location */}
                          <TableCell className="px-6 py-4">
                            {product.branches_display ? (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate max-w-[160px]">
                                  {product.branches_display}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>

                          {/* Duration */}
                          <TableCell className="px-6 py-4">
                            {product.duration ? (
                              <p className="text-sm text-gray-600">
                                {product.duration}
                              </p>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>

                          {/* Enrolled */}
                          <TableCell className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2FF] text-[#3B4CB8] rounded-lg">
                              <Users className="w-3.5 h-3.5" />
                              <span className="font-semibold text-sm">
                                {product.enrolled_count}
                              </span>
                            </div>
                          </TableCell>

                          {/* In Progress */}
                          <TableCell className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] text-[#F59E0B] rounded-lg">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="font-semibold text-sm">
                                {product.in_progress_count}
                              </span>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleView(product)}
                                className="p-2 text-gray-400 hover:text-[#3B4CB8] hover:bg-[#3B4CB8]/10 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {product.is_editable && (
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {product.is_deletable && (
                                <button
                                  onClick={() =>
                                    handleDelete(product.id, product.name)
                                  }
                                  disabled={deleteMutation.isPending}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Pagination
                {...paginationInfo}
                onPageChange={setCurrentPage}
                noun="products"
              />
            </div>
          )}
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
