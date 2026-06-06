"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  MapPin,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import PartnerFormDialog from "../partners/Partnerformdialog";
import SectionContainer from "../SectionContainer";
import PartnersFilterSidebar from "../partners/PartnersFilterSidebar";
import Pagination from "../shared/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PartnersPage() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // If category changes, reset selected type to 'all' and page to 1
  useEffect(() => {
    setSelectedType("all");
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType]);

  // Fetch master categories
  const { data: categoriesData } = useQuery({
    queryKey: ["/partners/master-categories", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  const categories = categoriesData?.data || [];

  // Fetch partner types based on category
  const { data: typesData } = useQuery({
    queryKey: [`/partners/partner-types/${selectedCategory}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!selectedCategory && selectedCategory !== "all",
  });
  const partnerTypes = typesData?.data || [];

  // Fetch partners list
  const { data: partnersData, isLoading } = useQuery({
    queryKey: [
      "/partners",
      currentPage,
      debouncedSearchQuery,
      selectedCategory,
      selectedType,
      accessToken,
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (selectedCategory && selectedCategory !== "all")
        params.append("master_category_id", selectedCategory);
      if (selectedType && selectedType !== "all")
        params.append("partner_type_id", selectedType);

      return fetchWithToken({
        queryKey: [`/partners?${params.toString()}`, accessToken],
      });
    },
    enabled: !!accessToken,
  });

  const partners =
    partnersData?.data?.data ||
    (Array.isArray(partnersData?.data) ? partnersData?.data : []);

  const paginationData = useMemo(() => {
    if (!partnersData?.data?.current_page) return null;
    return {
      current_page: partnersData.data.current_page,
      last_page: partnersData.data.last_page,
      total: partnersData.data.total,
      per_page: partnersData.data.per_page,
    };
  }, [partnersData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const fd = new FormData();
      fd.append("_method", "DELETE");
      return await postWithToken(`/partners/${id}`, fd, accessToken);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success(res.message || "Partner deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["/partners"] });
      } else {
        toast.error(res.message || "Failed to delete partner");
      }
    },
  });

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this partner?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <SectionContainer
      title="Partners"
      description="Manage your partner network"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <PartnersFilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          categories={categories}
          partnerTypes={partnerTypes}
          onAdd={() => {
            setEditingPartner(null);
            setShowAddDialog(true);
          }}
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">
                      Name
                    </TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">
                      Category
                    </TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600">
                      City
                    </TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                      Products
                    </TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                      Enrolled
                    </TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                      In Progress
                    </TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-32 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-5 w-20 bg-gray-200 rounded-full" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="w-16 h-8 bg-gray-200 rounded-lg ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : partners.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                      <TableHead className="py-3 px-6 font-semibold text-gray-600">
                        Name
                      </TableHead>
                      <TableHead className="py-3 px-6 font-semibold text-gray-600">
                        Category
                      </TableHead>
                      <TableHead className="py-3 px-6 font-semibold text-gray-600">
                        City
                      </TableHead>
                      <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                        Products
                      </TableHead>
                      <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                        Enrolled
                      </TableHead>
                      <TableHead className="py-3 px-6 font-semibold text-gray-600 text-center">
                        In Progress
                      </TableHead>
                      <TableHead className="py-3 px-6 font-semibold text-gray-600 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow
                        key={partner.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#3B4CB8] w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                              {partner.logo ? (
                                <img
                                  src={partner.logo}
                                  alt={partner.name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <span className="text-white text-sm font-bold">
                                  {partner.name?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="max-w-[200px]">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {partner.name}
                              </p>
                              {partner.email && (
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                                  <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                  <span className="truncate">
                                    {partner.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {partner.master_category?.name ? (
                            <span className="inline-block px-3 py-1 bg-white border border-[#3B4CB8] text-[#3B4CB8] rounded-full text-xs font-medium whitespace-nowrap">
                              {partner.master_category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {partner.city ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{partner.city}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2FF] text-[#3B4CB8] rounded-lg">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-semibold text-sm">
                              {partner.products_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ECFDF5] text-[#10B981] rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="font-semibold text-sm">
                              {partner.enrolled_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] text-[#F59E0B] rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-semibold text-sm">
                              {partner.in_progress_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/dashboard/partners/${partner.id}`}
                              className="p-2 text-gray-400 hover:text-[#3B4CB8] hover:bg-[#3B4CB8]/10 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {!partner.is_auto_synced && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingPartner(partner);
                                    setShowAddDialog(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {partner.is_deletable && (
                                  <button
                                    onClick={(e) => handleDelete(e, partner.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginationData && paginationData.last_page > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={paginationData.current_page}
                    lastPage={paginationData.last_page}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Partners Found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ||
                selectedCategory !== "all" ||
                selectedType !== "all"
                  ? "We couldn't find any partners matching your search criteria."
                  : "Get started by adding your first partner."}
              </p>
            </div>
          )}
        </div>
      </div>

      <PartnerFormDialog
        open={showAddDialog}
        onOpenChange={(isOpen) => {
          setShowAddDialog(isOpen);
          if (!isOpen) setEditingPartner(null);
        }}
        editingPartner={editingPartner}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/partners"] });
          if (!editingPartner) setCurrentPage(1);
        }}
      />
    </SectionContainer>
  );
}
