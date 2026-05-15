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
import { useState, useMemo } from "react";
import SectionContainer from "../SectionContainer";
import CheckInModal from "../office-checkin/CheckInModal";
import CheckInSkeleton from "../office-checkin/CheckInSkeleton";
import CheckInCard from "../office-checkin/CheckInCard";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";

export default function OfficeCheckInPage() {
  const { accessToken } = useAppContext();
  
  // Date calculations
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 8 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 3 + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      
      return {
        apiDate: `${yyyy}-${mm}-${dd}`,
        display: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      };
    });
  }, []);

  // Set today as default
  const [selectedDateObj, setSelectedDateObj] = useState(dates[3]); // index 3 is today

  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [`/check-ins?date=${selectedDateObj.apiDate}`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const checkInItems = data?.data || [];

  // Filter items based on status and search query
  const filteredItems = checkInItems.filter((item) => {
    // Filter by status
    if (selectedStatus !== "all" && item.status?.toLowerCase() !== selectedStatus) {
      return false;
    }
    // Filter by search query (search in name and email)
    if (searchQuery) {
      const fullName = `${item.contact?.first_name || ""} ${item.contact?.last_name || ""}`.toLowerCase();
      const email = item.contact?.email?.toLowerCase() || "";
      if (!fullName.includes(searchQuery.toLowerCase()) && !email.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  });


  // Dynamic stats from checkInItems
  const stats = [
    {
      count: checkInItems.length,
      label: "Total Check-ins",
      bgColor: "bg-primary",
      textColor: "text-primary",
    },
    {
      count: checkInItems.filter((item) => item.status?.toLowerCase() === "unassigned").length,
      label: "Unassigned",
      bgColor: "bg-gray-500",
      textColor: "text-gray-500",
    },
    {
      count: checkInItems.filter((item) => item.status?.toLowerCase() === "waiting").length,
      label: "Waiting",
      bgColor: "bg-warning",
      textColor: "text-warning",
    },
    {
      count: checkInItems.filter((item) => item.status?.toLowerCase() === "attending").length,
      label: "Attending",
      bgColor: "bg-progress",
      textColor: "text-progress",
    },
    {
      count: checkInItems.filter((item) => item.status?.toLowerCase() === "completed").length,
      label: "Completed",
      bgColor: "bg-success",
      textColor: "text-success",
    },
  ];

  // Status filters
  const statusFilters = [
    { id: "all", label: "All", icon: User, color: "gray" },
    { id: "unassigned", label: "Unassigned", icon: AlertCircle, color: "gray" },
    { id: "waiting", label: "Waiting", icon: Clock, color: "yellow" },
    { id: "attending", label: "Attending", icon: UserCheck, color: "cyan" },
    { id: "completed", label: "Completed", icon: CheckCircle, color: "green" },
  ];

  const mapStatusToColor = (status) => {
    if (!status) return "gray";
    switch (status.toLowerCase()) {
      case "unassigned":
        return "gray";
      case "waiting":
        return "yellow";
      case "attending":
        return "cyan";
      case "completed":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <SectionContainer>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}
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
                  onClick={() => setIsCheckInModalOpen(true)}
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
              {dates.map((dateObj) => (
                <button
                  key={dateObj.apiDate}
                  onClick={() => setSelectedDateObj(dateObj)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedDateObj.apiDate === dateObj.apiDate
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {dateObj.display}
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
          {isLoading ? (
            <CheckInSkeleton />
          ) : (
            <div className="px-6 pb-6 space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {checkInItems.length === 0 
                    ? "No check-ins found for this date." 
                    : "No check-ins match your search or filters."}
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const statusColor = mapStatusToColor(item.status);
                  const dateObj = new Date(item.created_at);
                  const displayTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                  const displayDate = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                  
                  return (
                    <CheckInCard
                      key={item.id}
                      item={item}
                      index={index}
                      statusColor={statusColor}
                      displayTime={displayTime}
                      displayDate={displayDate}
                    />
                  );
                })
              )}
            </div>
          )}
        </motion.div>
        
        <CheckInModal 
          isOpen={isCheckInModalOpen} 
          onClose={() => setIsCheckInModalOpen(false)} 
        />
    </SectionContainer>
  );
}