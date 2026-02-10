"use client";

import { motion } from "framer-motion";
import {
  Users,
  FileText,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Frown,
  Heart,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import SectionContainer from "../SectionContainer";

export default function DashboardPage() {
  const [agendaPlannerExpanded, setAgendaPlannerExpanded] = useState(true);

  // Stats data
  const stats = [
    {
      icon: Users,
      count: "54",
      label: "Leads",
      subtext: "2 New this month",
      color: "bg-blue-500",
    },
    {
      icon: FileText,
      count: "482",
      label: "Prospects",
      subtext: "4 New this month",
      color: "bg-blue-500",
    },
    {
      icon: UserCheck,
      count: "771",
      label: "Clients",
      subtext: "12 clients ongoing",
      color: "bg-blue-500",
    },
  ];

  // Prospects rating data
  const ratings = [
    { icon: ThumbsUp, count: 5, color: "text-green-500" },
    { icon: ThumbsDown, count: 3, color: "text-gray-400" },
    { icon: Meh, count: 2, color: "text-yellow-500" },
    { icon: Frown, count: 5, color: "text-orange-500" },
    { icon: Heart, count: 469, color: "text-red-500" },
  ];

  // Clients by users data
  const clientsByUsers = [
    { name: "Shahid Bin Khair", count: 564, color: "bg-blue-500" },
    { name: "Shahid Bin Khair", count: 564, color: "bg-red-500" },
    { name: "Shahid Bin Khair", count: 564, color: "bg-cyan-400" },
    { name: "Shahid Bin Khair", count: 564, color: "bg-pink-400" },
    { name: "Shahid Bin Khair", count: 564, color: "bg-purple-400" },
    { name: "Shahid Bin Khair", count: 564, color: "bg-green-500" },
  ];

  // Workflow data
  const workflowData = [
    { name: "ON SHORE EDUCATION WO...", count: 522, color: "bg-blue-500" },
    { name: "ON SHORE EDUCATION WO...", count: 522, color: "bg-yellow-400" },
    { name: "ON SHORE EDUCATION WO...", count: 522, color: "bg-cyan-400" },
    { name: "ON SHORE EDUCATION WO...", count: 522, color: "bg-green-500" },
  ];

  return (
    <SectionContainer>
      {/* <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6"> */}
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome To ACT Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview & Stats - All Branches
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stat.count}
                  </h3>
                  <span className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* My Appointment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">My Appointment</h3>
            <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
              7,400
            </span>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">All clear of</p>
            <p className="text-sm text-gray-500">appointment</p>
          </div>
        </motion.div>

        {/* My Task For Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">My Task For Today</h3>
            <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
              9,008
            </span>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No tasks at the</p>
            <p className="text-sm text-gray-500">moment.</p>
          </div>
        </motion.div>

        {/* Agenda Planner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Agenda Planner</h3>
            <button
              onClick={() => setAgendaPlannerExpanded(!agendaPlannerExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <motion.div
                animate={{ rotate: agendaPlannerExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </motion.div>
            </button>
          </div>
          {agendaPlannerExpanded && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No agenda items</p>
            </div>
          )}
        </motion.div>

        {/* Prospects Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 md:col-span-2 xl:col-span-1"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Prospects Rating</h3>
          <div className="flex items-center justify-center gap-6">
            {ratings.map((rating, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <rating.icon
                  className={`w-6 h-6 ${rating.color}`}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-gray-900">
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section - 4 Cards in Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Check-in Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Check-in Queue</h3>
            <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
              7,400
            </span>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No office check-in</p>
            <p className="text-sm text-gray-500">at the moment.</p>
          </div>
        </motion.div>

        {/* Application Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Application Reminders
            </h3>
            <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
              9,008
            </span>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No reminders at</p>
            <p className="text-sm text-gray-500">the moment.</p>
          </div>
        </motion.div>

        {/* Clients By Users - Spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 md:col-span-2"
        >
          <h3 className="font-semibold text-gray-900 mb-6">Clients By Users</h3>

          <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Multi-colored donut segments */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="20"
                  strokeDasharray="60 251"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                  strokeDasharray="50 251"
                  strokeDashoffset="-60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="20"
                  strokeDasharray="40 251"
                  strokeDashoffset="-110"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="20"
                  strokeDasharray="35 251"
                  strokeDashoffset="-150"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="20"
                  strokeDasharray="33 251"
                  strokeDashoffset="-185"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="20"
                  strokeDasharray="33 251"
                  strokeDashoffset="-218"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {clientsByUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-sm ${user.color}`}></div>
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {user.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Large Bottom Section - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* In Progress Applications By Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-6">
            In Progress Applications By Workflow
          </h3>

          <div className="flex items-center gap-6">
            {/* Pie Chart */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Multi-colored donut segments */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="20"
                  strokeDasharray="60 251"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                  strokeDasharray="50 251"
                  strokeDashoffset="-60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="20"
                  strokeDasharray="40 251"
                  strokeDashoffset="-110"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="20"
                  strokeDasharray="35 251"
                  strokeDashoffset="-150"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="20"
                  strokeDasharray="33 251"
                  strokeDashoffset="-185"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="20"
                  strokeDasharray="33 251"
                  strokeDashoffset="-218"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {workflowData.map((workflow, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-sm ${workflow.color}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {workflow.count}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {workflow.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Client Application By Status & Application By Workflow Stages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">
              Application By Workflow Stages
            </h3>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option>Accomodation Service</option>
              <option>Education Service</option>
              <option>Visa Service</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  In Progress
                </span>
                <span className="text-lg font-bold text-blue-600">522</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Pending", count: 45, color: "yellow" },
                { label: "Approved", count: 320, color: "green" },
                { label: "Rejected", count: 12, color: "red" },
                { label: "On Hold", count: 28, color: "orange" },
              ].map((status, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">{status.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {status.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      {/* </div> */}
    </SectionContainer>
  );
}
