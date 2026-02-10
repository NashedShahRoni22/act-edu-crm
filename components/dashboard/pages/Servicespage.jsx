"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Eye,
  Heart,
  Plus,
  Search,
  Bookmark,
  ArrowRight,
  GitCompare,
} from "lucide-react";
import { useState } from "react";
import SectionContainer from "../SectionContainer";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Service data
  const services = [
    {
      id: 1,
      title: "10 Weeks Beginners",
      institution: "Verginia School Of English",
      location: "Head Office",
      icon: BookOpen,
      iconBg: "bg-[#3B4CB8]",
      degreeLevel: "Course",
      subjectArea: "English Language",
      duration: "Twelve Months",
      workflow: "UG Education F1",
      requirements: "View Requirements",
      price: "0.00",
      currency: "USD",
      hasPromotion: true,
      promotionText: "No Active Promotions",
    },
    {
      id: 2,
      title: "Advanced English Program",
      institution: "International Language Center",
      location: "Main Campus",
      icon: BookOpen,
      iconBg: "bg-[#1FB3C8]",
      degreeLevel: "Course",
      subjectArea: "English Language",
      duration: "Six Months",
      workflow: "UG Education F1",
      requirements: "View Requirements",
      price: "1,250.00",
      currency: "USD",
      hasPromotion: false,
    },
    {
      id: 3,
      title: "Business English Certificate",
      institution: "Global Business School",
      location: "Downtown Center",
      icon: BookOpen,
      iconBg: "bg-[#F5C842]",
      degreeLevel: "Certificate",
      subjectArea: "Business English",
      duration: "Three Months",
      workflow: "Professional Development",
      requirements: "View Requirements",
      price: "850.00",
      currency: "USD",
      hasPromotion: true,
      promotionText: "20% Off - Limited Time",
    },
  ];

  return (
    <SectionContainer>
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Manage smarter. Perform better.</p>
      </div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* Top Row - Dropdowns and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Category Dropdown */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Choose Service Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
              >
                <option value="all">All Categories</option>
                <option value="language">Language Courses</option>
                <option value="business">Business Programs</option>
                <option value="certificate">Certificates</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
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
          </div>

          {/* Search For Dropdown */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Search For
            </label>
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
              >
                <option value="all">All</option>
                <option value="courses">Courses</option>
                <option value="certificates">Certificates</option>
                <option value="programs">Programs</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
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
          </div>

          {/* Search Input */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-sm"
              >
                Search
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">Filter by:</span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            Invite User
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Filter
          </motion.button>
        </div>
      </motion.div>

      {/* Add New Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New
        </motion.button>
      </div>

      {/* Service Cards */}
      <div className="space-y-4">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
          >
            <div className="p-8">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`${service.iconBg} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <service.icon
                      className="w-8 h-8 text-white"
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title and Institution */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {service.title}
                    </h2>
                    <p className="text-base text-gray-600 font-medium">
                      {service.institution}
                    </p>
                    <p className="text-sm text-gray-500">{service.location}</p>
                  </div>
                </div>

                {/* Promotion Badge */}
                {service.hasPromotion && (
                  <div className="px-4 py-2 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-lg text-xs font-medium">
                    {service.promotionText}
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Degree Level:</p>
                    <p className="text-base font-semibold text-gray-900">
                      {service.degreeLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration:</p>
                    <p className="text-base font-semibold text-gray-900">
                      {service.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Requirements:</p>
                    <button className="text-base font-semibold text-[#3B4CB8] hover:underline">
                      {service.requirements}
                    </button>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Subject Area:</p>
                    <p className="text-base font-semibold text-gray-900">
                      {service.subjectArea}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Workflow:</p>
                    <p className="text-base font-semibold text-gray-900">
                      {service.workflow}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Price:</p>
                <p className="text-3xl font-bold text-gray-900">
                  <span className="text-sm text-gray-500 font-normal mr-1">
                    {service.currency}
                  </span>
                  {service.price}
                </p>
                <button className="flex items-center gap-2 text-[#3B4CB8] text-sm font-semibold hover:underline mt-2">
                  View Free Breakdown
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Full Details
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Add To Interested
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add To Application
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <GitCompare className="w-4 h-4" />
                  Add To Compare
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
