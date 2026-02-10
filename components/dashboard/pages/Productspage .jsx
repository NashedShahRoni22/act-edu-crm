"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  TrendingUp,
  MapPin,
  Building2,
  Eye,
  Edit,
  Share2,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import SectionContainer from "../SectionContainer";

export default function ProductsPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Stats data
  const stats = [
    {
      count: 15,
      label: "Total products",
      subtitle: "Active courses",
      icon: BookOpen,
      bgColor: "bg-[#3B4CB8]",
    },
    {
      count: 196,
      label: "Total Enrolled",
      subtitle: "Students enrolled",
      icon: Users,
      bgColor: "bg-[#1FB3C8]",
    },
    {
      count: 117,
      label: "In Progress",
      subtitle: "Active lerners",
      icon: TrendingUp,
      bgColor: "bg-[#F5C842]",
    },
    {
      count: 11,
      label: "Branches",
      subtitle: "Location",
      icon: MapPin,
      bgColor: "bg-[#2DD4BF]",
    },
  ];

  // Product data
  const products = [
    {
      id: 1,
      title: "Master of Mathematics sciences",
      type: "School",
      syncStatus: "Auto Synced",
      university: "University of Wollongong(UOW)",
      campus: "Wollongong Campus",
      enrolled: 0,
      inProgress: 0,
    },
    {
      id: 2,
      title: "Master of Mathematics sciences",
      type: "School",
      syncStatus: "Auto Synced",
      university: "University of Wollongong(UOW)",
      campus: "Wollongong Campus",
      enrolled: 0,
      inProgress: 0,
    },
    {
      id: 3,
      title: "Master of Mathematics sciences",
      type: "School",
      syncStatus: "Auto Synced",
      university: "University of Wollongong(UOW)",
      campus: "Wollongong Campus",
      enrolled: 0,
      inProgress: 0,
    },
    {
      id: 4,
      title: "Master of Mathematics sciences",
      type: "School",
      syncStatus: "Auto Synced",
      university: "University of Wollongong(UOW)",
      campus: "Wollongong Campus",
      enrolled: 0,
      inProgress: 0,
    },
    {
      id: 5,
      title: "Master of Mathematics sciences",
      type: "School",
      syncStatus: "Auto Synced",
      university: "University of Wollongong(UOW)",
      campus: "Wollongong Campus",
      enrolled: 0,
      inProgress: 0,
    },
    {
      id: 6,
      title: "Master of Mathematics sciences",
      type: "School",
      syncStatus: "Auto Synced",
      university: "University of Wollongong(UOW)",
      campus: "Wollongong Campus",
      enrolled: 0,
      inProgress: 0,
    },
  ];

  return (
      <SectionContainer>
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm">
            Manage educational courses and programs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
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
          className="bg-white rounded-2xl shadow-sm p-6"
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
                    <option value="course">Course</option>
                    <option value="program">Program</option>
                    <option value="certificate">Certificate</option>
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
                    <option value="uow">UOW</option>
                    <option value="unsw">UNSW</option>
                    <option value="sydney">Sydney University</option>
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
                    <option value="pending">Pending</option>
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
                Showing <span className="font-medium text-gray-900">12</span> of{" "}
                <span className="font-medium text-gray-900">12</span> partners
              </p>
            </div>
          </div>
        </motion.div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-[#3B4CB8] w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2">
                      {product.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-3 py-1 bg-white border border-[#3B4CB8] text-[#3B4CB8] rounded-full text-xs font-medium">
                        {product.type}
                      </span>
                      <span className="inline-block px-3 py-1 bg-[#ECFDF5] border border-[#10B981] text-[#059669] rounded-full text-xs font-medium">
                        {product.syncStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-2.5 mb-6">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{product.university}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{product.campus}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#EEF2FF] rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-[#3B4CB8]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.enrolled}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Enrolled</p>
                </div>

                <div className="bg-[#FFFBEB] rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.inProgress}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center p-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
  );
}