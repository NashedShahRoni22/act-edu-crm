"use client";

import { motion } from "framer-motion";
import {
  Users,
  FileText,
  UserCheck,
  XCircle,
  Snowflake,
  Thermometer,
  Flame,
} from "lucide-react";

const RATING_OPTIONS = [
  {
    value: 1,
    label: "Lost",
    icon: XCircle,
    activeClassName: "text-red-500 bg-red-50",
    idleClassName: "text-gray-400",
  },
  {
    value: 2,
    label: "Cold",
    icon: Snowflake,
    activeClassName: "text-sky-500 bg-sky-50",
    idleClassName: "text-gray-400",
  },
  {
    value: 3,
    label: "Warm",
    icon: Thermometer,
    activeClassName: "text-amber-500 bg-amber-50",
    idleClassName: "text-gray-400",
  },
  {
    value: 4,
    label: "Hot",
    icon: Flame,
    activeClassName: "text-orange-500 bg-orange-50",
    idleClassName: "text-gray-400",
  },
];

export default function ContactSummarySection({ contactSummary }) {
  const stats = [
    {
      icon: Users,
      count: String(contactSummary?.leads?.total || 0),
      label: "Leads",
      subtext: `${contactSummary?.leads?.new_this_month || 0} New this month`,
      color: "bg-blue-500",
    },
    {
      icon: FileText,
      count: String(contactSummary?.prospects?.total || 0),
      label: "Prospects",
      subtext: `${contactSummary?.prospects?.new_this_month || 0} New this month`,
      color: "bg-blue-500",
    },
    {
      icon: UserCheck,
      count: String(contactSummary?.clients?.total || 0),
      label: "Clients",
      subtext: `${contactSummary?.clients?.ongoing || 0} clients ongoing`,
      color: "bg-blue-500",
    },
  ];

  // Map ratings data to RATING_OPTIONS
  const ratingCounts = {
    1: contactSummary?.prospect_ratings?.lost || 0,
    2: contactSummary?.prospect_ratings?.cold || 0,
    3: contactSummary?.prospect_ratings?.warm || 0,
    4: contactSummary?.prospect_ratings?.hot || 0,
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {/* Rating Cards  */}
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-start gap-4">
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}
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

        {/* Prospects Rating Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-6">Ratings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RATING_OPTIONS.map((rating) => {
              const count = ratingCounts[rating.value];
              const Icon = rating.icon;

              return (
                <div
                  key={rating.value}
                  className={`flex flex-col items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium ${rating.activeClassName}`}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  {/* <span className="text-xs">{rating.label}</span> */}
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}
