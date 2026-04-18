"use client";

import { useAppContext } from "@/context/context";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  TrendingUp,
  Clock,
  Download,
  Upload,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import PartnerFormDialog from "../partners/Partnerformdialog";
import PartnerCard from "../partners/PartnerCard";
import PartnersSkeleton from "../partners/PartnersSkeleton";
import SectionContainer from "../SectionContainer";

export default function PartnersPage() {
  const { accessToken } = useAppContext();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Fetch master categories
  const { data: categoriesData } = useQuery({
    queryKey: ["/partners/master-categories", accessToken],
    queryFn: () => fetchWithToken("/partners/master-categories", accessToken),
    enabled: !!accessToken,
  });

  const categories = categoriesData?.data || [];

  // Fetch partners list
  const {
    data: partnersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/partners", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const partners = partnersData?.data || [];

  // Filter partners
  const filteredPartners = partners.filter((partner) => {
    const typeMatch =
      selectedType === "all" || partner.master_category?.name === selectedType;
    const cityMatch =
      selectedCity === "all" ||
      partner.city?.toLowerCase() === selectedCity.toLowerCase();
    return typeMatch && cityMatch;
  });

  // Calculate stats
  const stats = [
    {
      count: filteredPartners.length,
      label: "Total Partners",
      icon: Users,
      bgColor: "bg-[#3B4CB8]",
      growth: "+12%",
    },
    {
      count: filteredPartners.reduce(
        (sum, p) => sum + (p.products_count || 0),
        0,
      ),
      label: "Total Products",
      icon: UserPlus,
      bgColor: "bg-[#1FB3C8]",
      growth: "+12%",
    },
    {
      count: filteredPartners.reduce(
        (sum, p) => sum + (p.enrolled_count || 0),
        0,
      ),
      label: "Enrolled",
      icon: TrendingUp,
      bgColor: "bg-[#F5C842]",
      growth: "+12%",
    },
    {
      count: filteredPartners.reduce(
        (sum, p) => sum + (p.in_progress_count || 0),
        0,
      ),
      label: "In Progress",
      icon: Clock,
      bgColor: "bg-[#2DD4BF]",
      growth: "+12%",
    },
  ];

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
    onError: () => toast.error("Failed to delete partner"),
  });

  // Handle add
  const handleAdd = () => {
    setEditingPartner(null);
    setShowAddDialog(true);
  };

  // Handle edit
  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setShowAddDialog(true);
  };

  // Handle delete
  const handleDelete = (id, name) => {
    if (
      window.confirm(`Delete partner "${name}"? This action cannot be undone.`)
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <SectionContainer>
        <PartnersSkeleton />
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Failed to load partners</p>
        </div>
      </div>
    );
  }

  return (
    <SectionContainer>
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm">
          Manage your educational institution partnerships
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
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Growth Badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                {stat.growth}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stat.count}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
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
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left Side - Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
              >
                <option value="all">All Partner Types</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
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
              Add Partner
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {filteredPartners.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">{partners.length}</span>{" "}
            partners
          </p>
        </div>
      </motion.div>

      {/* Partner Cards Grid */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No partners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner, index) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              index={0.5 + index * 0.05}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <PartnerFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        editingPartner={editingPartner}
        onSuccess={() => {
          setShowAddDialog(false);
          setEditingPartner(null);
          queryClient.invalidateQueries({ queryKey: ["/partners"] });
        }}
      />
    </SectionContainer>
  );
}
