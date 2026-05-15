"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { useAppContext } from "@/context/context";
import SectionContainer from "../SectionContainer";
import { motion } from "framer-motion";
import OfficeCheckInReportsSkeleton from "./OfficeCheckInReportsSkeleton";
import {
  Calendar,
  Clock,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OfficeCheckInReportsPage() {
  const { accessToken } = useAppContext();
  
  // Set default date range - last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(formatDateForInput(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDateForInput(today));

  const queryString = `/reports/check-ins/analytics?start_date=${startDate}&end_date=${endDate}`;

  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: [queryString, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });

  const analyticsData = reportsData?.data || {};
  const kpis = analyticsData?.kpis || {};
  const chartData = analyticsData?.chart_data || [];

  const handleDateChange = () => {
    refetch();
  };

  const stats = [
    {
      label: "Total Check-ins",
      value: kpis.total_check_ins || 0,
      color: "bg-blue-50",
      icon: Users,
    },
    {
      label: "Avg Waiting Time",
      value: kpis.waiting_time?.average || "-",
      color: "bg-orange-50",
      icon: Clock,
    },
    {
      label: "Avg Meeting Time",
      value: kpis.attending_time?.average || "-",
      color: "bg-purple-50",
      icon: TrendingUp,
    },
    {
      label: "Avg Rating",
      value: kpis.rating?.average !== "NaN" ? kpis.rating?.average : "-",
      color: "bg-yellow-50",
      icon: Star,
    },
  ];

  if (isLoading) {
    return <OfficeCheckInReportsSkeleton />;
  }

  return (
    <SectionContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Office Check-In Analytics</h1>
          <p className="text-gray-600">View check-in performance metrics and trends</p>
        </div>

        {/* Date Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Start Date:</label>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">End Date:</label>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleDateChange}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              Apply
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Waiting Time Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Waiting Time</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Minimum:</span>
                <span className="font-medium text-gray-900">{kpis.waiting_time?.min || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="font-medium text-gray-900">{kpis.waiting_time?.average || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maximum:</span>
                <span className="font-medium text-gray-900">{kpis.waiting_time?.max || "-"}</span>
              </div>
            </div>
          </div>

          {/* Meeting Time Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Meeting Time</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Minimum:</span>
                <span className="font-medium text-gray-900">{kpis.attending_time?.min || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="font-medium text-gray-900">{kpis.attending_time?.average || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maximum:</span>
                <span className="font-medium text-gray-900">{kpis.attending_time?.max || "-"}</span>
              </div>
            </div>
          </div>

          {/* Rating Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Rating Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating:</span>
                <span className="font-medium text-gray-900">
                  {kpis.rating?.average !== "NaN" ? parseFloat(kpis.rating?.average).toFixed(2) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Ratings:</span>
                <span className="font-medium text-gray-900">{kpis.rating?.total || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Check-in Trends</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Check-ins"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Data Table */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Check-ins</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Total Wait Time</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Total Meeting Time</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.count}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.formatted_wait_time}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.formatted_meeting_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {chartData.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-12 text-center"
          >
            <p className="text-gray-500">No check-in data available for the selected date range</p>
          </motion.div>
        )}
      </motion.div>
    </SectionContainer>
  );
}
