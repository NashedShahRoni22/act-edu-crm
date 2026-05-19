"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import PartnerFormDialog from "../partners/Partnerformdialog";
import PartnerCard from "../partners/PartnerCard";
import PartnersSkeleton from "../partners/PartnersSkeleton";
import SectionContainer from "../SectionContainer";
import PartnersFilterSidebar from "../partners/PartnersFilterSidebar";
import Pagination from "../shared/Pagination";

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
  const {
    data: partnersData,
    isLoading,
  } = useQuery({
    queryKey: ["/partners", currentPage, debouncedSearchQuery, selectedCategory, selectedType, accessToken],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('master_category_id', selectedCategory);
      if (selectedType && selectedType !== 'all') params.append('partner_type_id', selectedType);
      
      return fetchWithToken({ queryKey: [`/partners?${params.toString()}`, accessToken] });
    },
    enabled: !!accessToken,
  });

  const partners = partnersData?.data?.data || (Array.isArray(partnersData?.data) ? partnersData?.data : []);
  
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
    <SectionContainer title="Partners" description="Manage your partner network">
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
            <PartnersSkeleton />
          ) : partners.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {partners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      partner={partner}
                      onEdit={() => {
                        setEditingPartner(partner);
                        setShowAddDialog(true);
                      }}
                      onDelete={(e) => handleDelete(e, partner.id)}
                    />
                  ))}
                </AnimatePresence>
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
                {searchQuery || selectedCategory !== "all" || selectedType !== "all"
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
