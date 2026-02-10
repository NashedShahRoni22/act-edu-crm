"use client";

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
  Mail,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import SectionContainer from "../SectionContainer";

export default function PartnersPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  // Stats data
  const stats = [
    {
      count: 12,
      label: "Total Contacts",
      icon: Users,
      bgColor: "bg-[#3B4CB8]",
      growth: "+12%",
    },
    {
      count: 221,
      label: "Total Prospects",
      icon: UserPlus,
      bgColor: "bg-[#1FB3C8]",
      growth: "+12%",
    },
    {
      count: 57,
      label: "Converted",
      icon: TrendingUp,
      bgColor: "bg-[#F5C842]",
      growth: "+12%",
    },
    {
      count: 31,
      label: "In Progress",
      icon: Clock,
      bgColor: "bg-[#2DD4BF]",
      growth: "+12%",
    },
  ];

  // Partner data
  const partners = [
    {
      id: 1,
      name: "Abbotsleigh school",
      email: "receiption@abbotsleigh.nsw.edu.au",
      type: "School",
      owner: "Aust Synced",
      city: "wollongong",
      workflow: "VISA Service",
      totalProspects: 8,
      converted: 3,
      inProgress: 3,
    },
    {
      id: 2,
      name: "Abbotsleigh school",
      email: "receiption@abbotsleigh.nsw.edu.au",
      type: "School",
      owner: "Aust Synced",
      city: "wollongong",
      workflow: "VISA Service",
      totalProspects: 8,
      converted: 3,
      inProgress: 3,
    },
    {
      id: 3,
      name: "Abbotsleigh school",
      email: "receiption@abbotsleigh.nsw.edu.au",
      type: "School",
      owner: "Aust Synced",
      city: "wollongong",
      workflow: "VISA Service",
      totalProspects: 8,
      converted: 3,
      inProgress: 3,
    },
    {
      id: 4,
      name: "Abbotsleigh school",
      email: "receiption@abbotsleigh.nsw.edu.au",
      type: "School",
      owner: "Aust Synced",
      city: "wollongong",
      workflow: "VISA Service",
      totalProspects: 8,
      converted: 3,
      inProgress: 3,
    },
    {
      id: 5,
      name: "Abbotsleigh school",
      email: "receiption@abbotsleigh.nsw.edu.au",
      type: "School",
      owner: "Aust Synced",
      city: "wollongong",
      workflow: "VISA Service",
      totalProspects: 8,
      converted: 3,
      inProgress: 3,
    },
    {
      id: 6,
      name: "Abbotsleigh school",
      email: "receiption@abbotsleigh.nsw.edu.au",
      type: "School",
      owner: "Aust Synced",
      city: "wollongong",
      workflow: "VISA Service",
      totalProspects: 8,
      converted: 3,
      inProgress: 3,
    },
  ];

  return (
      <SectionContainer>
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm">
            Manage your educational institution partnerships
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
          className="bg-white rounded-2xl shadow-sm p-6"
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
                  <option value="school">School</option>
                  <option value="university">University</option>
                  <option value="college">College</option>
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
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50"
                >
                  <option value="all">All Cities</option>
                  <option value="wollongong">Wollongong</option>
                  <option value="sydney">Sydney</option>
                  <option value="melbourne">Melbourne</option>
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
              Showing <span className="font-medium text-gray-900">12</span> of{" "}
              <span className="font-medium text-gray-900">12</span> partners
            </p>
          </div>
        </motion.div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#3B4CB8] w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">A</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">
                      {partner.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs">{partner.email}</span>
                    </div>
                    <span className="inline-block mt-2 px-3 py-1 bg-white border border-[#3B4CB8] text-[#3B4CB8] rounded-full text-xs font-medium">
                      {partner.type}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Owner</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {partner.owner}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">City</p>
                    <div className="flex items-center gap-1 justify-end">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {partner.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Workflow</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {partner.workflow}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#EEF2FF] rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-[#3B4CB8]" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {partner.totalProspects}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Prospects</p>
                </div>

                <div className="bg-[#ECFDF5] rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {partner.converted}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Converted</p>
                </div>

                <div className="bg-[#FFFBEB] rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {partner.inProgress}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
  );
}