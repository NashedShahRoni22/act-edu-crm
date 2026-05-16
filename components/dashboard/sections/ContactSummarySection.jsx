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
  TrendingUp,
  CircleDot,
} from "lucide-react";

const APP_BLUE = "#3B4CB8";
const APP_BLUE_LIGHT = "#EEF1FC";

const RATING_OPTIONS = [
  {
    value: 1,
    label: "Lost",
    icon: XCircle,
    activeClassName: "text-red-500 bg-red-50",
  },
  {
    value: 2,
    label: "Cold",
    icon: Snowflake,
    activeClassName: "text-sky-500 bg-sky-50",
  },
  {
    value: 3,
    label: "Warm",
    icon: Thermometer,
    activeClassName: "text-amber-500 bg-amber-50",
  },
  {
    value: 4,
    label: "Hot",
    icon: Flame,
    activeClassName: "text-orange-500 bg-orange-50",
  },
];

export default function ContactSummarySection({ contactSummary }) {
  const stats = [
    {
      icon: Users,
      count: String(contactSummary?.leads?.total || 0),
      label: "Leads",
      subtext: `${contactSummary?.leads?.new_this_month || 0} new this month`,
      badgeIcon: <TrendingUp className="w-2.5 h-2.5" />,
    },
    {
      icon: FileText,
      count: String(contactSummary?.prospects?.total || 0),
      label: "Prospects",
      subtext: `${contactSummary?.prospects?.new_this_month || 0} new this month`,
      badgeIcon: <TrendingUp className="w-2.5 h-2.5" />,
    },
    {
      icon: UserCheck,
      count: String(contactSummary?.clients?.total || 0),
      label: "Clients",
      subtext: `${contactSummary?.clients?.ongoing || 0} ongoing`,
      badgeIcon: <CircleDot className="w-2.5 h-2.5" />,
    },
  ];

  const ratingCounts = {
    1: contactSummary?.prospect_ratings?.lost || 0,
    2: contactSummary?.prospect_ratings?.cold || 0,
    3: contactSummary?.prospect_ratings?.warm || 0,
    4: contactSummary?.prospect_ratings?.hot || 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">

      {/* ── First 3 stat cards — Option C ── */}
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative bg-white rounded-xl border border-gray-200 overflow-hidden p-5"
        >
          {/* Ghost icon — faint oversized background */}
          <stat.icon
            className="absolute -right-2 -bottom-2 pointer-events-none"
            style={{ width: 72, height: 72, color: APP_BLUE, opacity: 0.06 }}
            strokeWidth={1.5}
          />

          {/* Big count */}
          <p className="text-4xl font-bold text-primary leading-none mb-1">
            {stat.count}
          </p>

          {/* Label */}
          <p className="text-xs text-gray-400 mb-3">{stat.label}</p>

          {/* Pill badge subtext */}
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: APP_BLUE_LIGHT, color: APP_BLUE }}
          >
            {stat.badgeIcon}
            {stat.subtext}
          </span>
        </motion.div>
      ))}

      {/* ── Ratings card (unchanged) ── */}
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
                <span className="text-sm font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}