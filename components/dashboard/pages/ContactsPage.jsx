"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  UserCheck,
  Target,
  Download,
  Upload,
  SlidersHorizontal,
  Eye,
  Edit,
  MessageSquare,
  MoreVertical,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { useState } from "react";
import SectionContainer from "../SectionContainer";

export default function ContactsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");

  // Stats data
  const stats = [
    {
      count: 12,
      label: "Total Contacts",
      icon: Users,
      bgColor: "bg-[#3B4CB8]",
      iconBg: "bg-[#3B4CB8]",
    },
    {
      count: 3,
      label: "Leads",
      icon: UserPlus,
      bgColor: "bg-[#1FB3C8]",
      iconBg: "bg-[#1FB3C8]",
    },
    {
      count: 7,
      label: "Clients",
      icon: UserCheck,
      bgColor: "bg-[#F5C842]",
      iconBg: "bg-[#F5C842]",
    },
    {
      count: 2,
      label: "Prospects",
      icon: Target,
      bgColor: "bg-[#2DD4BF]",
      iconBg: "bg-[#2DD4BF]",
    },
  ];

  // Contact data
  const contacts = [
    {
      id: 1,
      name: "Monica Sharma",
      initials: "MS",
      status: "Lead",
      phone: "+61424525629",
      email: "monicasharma@gmail.com",
      added: "2026-01-10",
      source: "Website",
      color: "bg-gray-800",
    },
    {
      id: 2,
      name: "Monica Sharma",
      initials: "MS",
      status: "Lead",
      phone: "+61424525629",
      email: "monicasharma@gmail.com",
      added: "2026-01-10",
      source: "Website",
      color: "bg-[#3B4CB8]",
    },
    {
      id: 3,
      name: "Monica Sharma",
      initials: "MS",
      status: "Lead",
      phone: "+61424525629",
      email: "monicasharma@gmail.com",
      added: "2026-01-10",
      source: "Website",
      color: "bg-[#1FB3C8]",
    },
    {
      id: 4,
      name: "Monica Sharma",
      initials: "MS",
      status: "Lead",
      phone: "+61424525629",
      email: "monicasharma@gmail.com",
      added: "2026-01-10",
      source: "Website",
      color: "bg-[#F5C842]",
    },
    {
      id: 5,
      name: "Monica Sharma",
      initials: "MS",
      status: "Lead",
      phone: "+61424525629",
      email: "monicasharma@gmail.com",
      added: "2026-01-10",
      source: "Website",
      color: "bg-[#9333EA]",
    },
    {
      id: 6,
      name: "Monica Sharma",
      initials: "MS",
      status: "Lead",
      phone: "+61424525629",
      email: "monicasharma@gmail.com",
      added: "2026-01-10",
      source: "Website",
      color: "bg-[#F97316]",
    },
  ];

  return (
      <SectionContainer>
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm">
            Manage and organize your contacts efficiently
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
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.iconBg} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
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
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="lead">Lead</option>
                  <option value="client">Client</option>
                  <option value="prospect">Prospect</option>
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
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Sources</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="direct">Direct</option>
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
              <span className="font-medium text-gray-900">12</span> contacts
            </p>
          </div>
        </motion.div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`${contact.color} w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-lg font-bold">
                      {contact.initials}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {contact.name}
                    </h3>
                    <span className="inline-block mt-1 px-2.5 py-1 bg-[#FEF3C7] text-[#92400E] rounded-md text-xs font-medium">
                      {contact.status}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Added: {contact.added}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Source: <span className="font-medium text-gray-900">{contact.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
  );
}