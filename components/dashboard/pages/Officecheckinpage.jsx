"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Download,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import SectionContainer from "../SectionContainer";

export default function OfficeCheckInPage() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState("5th Dec");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats data
  const stats = [
    {
      count: 6,
      label: "Total Check-ins",
      bgColor: "bg-primary",
      textColor: "text-primary",
    },
    {
      count: 1,
      label: "Attending",
      bgColor: "bg-progress",
      textColor: "text-progress",
    },
    {
      count: 2,
      label: "Waiting",
      bgColor: "bg-warning",
      textColor: "text-warning",
    },
    {
      count: 2,
      label: "Completed",
      bgColor: "bg-success",
      textColor: "text-success",
    },
  ];

  // Date filters
  const dates = [
    "5th Dec",
    "6th Dec",
    "7th Dec",
    "8th Dec",
    "9th Dec",
    "1st Jan",
    "2nd Jan",
    "3rd Jan",
  ];

  // Status filters
  const statusFilters = [
    { id: "unassigned", label: "Unassigned", icon: AlertCircle, color: "yellow" },
    { id: "waiting", label: "Waiting", icon: Clock, color: "yellow" },
    { id: "attending", label: "Attending", icon: UserCheck, color: "cyan" },
    { id: "completed", label: "Completed", icon: CheckCircle, color: "green" },
  ];

  // Check-in items data
  const checkInItems = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      purpose: "Student Consultation",
      time: "09:30 AM",
      date: "15th Dec",
      status: "unassigned",
      statusColor: "yellow",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      purpose: "Student Consultation",
      time: "09:30 AM",
      date: "15th Dec",
      status: "unassigned",
      statusColor: "yellow",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      purpose: "Student Consultation",
      time: "09:30 AM",
      date: "15th Dec",
      status: "unassigned",
      statusColor: "blue",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      purpose: "Student Consultation",
      time: "09:30 AM",
      date: "15th Dec",
      status: "unassigned",
      statusColor: "yellow",
    },
  ];

  const getStatusBgColor = (color) => {
    switch (color) {
      case "yellow":
        return "bg-warning/10 border-warning/30";
      case "cyan":
        return "bg-progress/10 border-progress/30";
      case "green":
        return "bg-success/10 border-success/30";
      case "blue":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusTextColor = (color) => {
    switch (color) {
      case "yellow":
        return "text-warning";
      case "cyan":
        return "text-progress";
      case "green":
        return "text-success";
      case "blue":
        return "text-primary";
      default:
        return "text-gray-600";
    }
  };

  return (
    <SectionContainer>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xl font-bold">
                    {stat.count}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-6 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add check-in
                </motion.button>

                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search By Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm text-gray-600">Show Completed</span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </motion.button>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedDate === date
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {statusFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedStatus(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    selectedStatus === filter.id
                      ? filter.color === "yellow"
                        ? "bg-warning/10 border-warning text-warning"
                        : filter.color === "cyan"
                        ? "bg-progress/10 border-progress text-progress"
                        : "bg-success/10 border-success text-success"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Check-in List */}
          <div className="px-6 pb-6 space-y-3">
            {checkInItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${getStatusBgColor(
                  item.statusColor
                )}`}
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    item.statusColor === "yellow"
                      ? "border-warning bg-warning/20"
                      : item.statusColor === "cyan"
                      ? "border-progress bg-progress/20"
                      : item.statusColor === "green"
                      ? "border-success bg-success/20"
                      : "border-primary bg-primary/20"
                  }`}
                >
                  <AlertCircle
                    className={`w-6 h-6 ${getStatusTextColor(item.statusColor)}`}
                    strokeWidth={2}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.email}</p>
                </div>

                {/* Details */}
                <div className="hidden md:flex items-center gap-8 text-sm">
                  <div>
                    <span className="text-gray-500">Purpose: </span>
                    <span className="font-medium text-gray-900">
                      {item.purpose}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Time: </span>
                    <span className="font-medium text-gray-900">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Date: </span>
                    <span className="font-medium text-gray-900">{item.date}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusTextColor(
                      item.statusColor
                    )}`}
                  >
                    Unassigned
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
    </SectionContainer>
  );
}