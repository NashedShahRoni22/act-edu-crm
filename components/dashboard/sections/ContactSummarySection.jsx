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
  Star,
} from "lucide-react";

const APP_BLUE = "#3B4CB8";
const APP_BLUE_LIGHT = "#EEF1FC";

const RATING_OPTIONS = [
  {
    value: 1,
    label: "Lost",
    icon: XCircle,
    bgClassName: "bg-red-50",
    iconClassName: "text-red-500",
  },
  {
    value: 2,
    label: "Cold",
    icon: Snowflake,
    bgClassName: "bg-sky-50",
    iconClassName: "text-sky-500",
  },
  {
    value: 3,
    label: "Warm",
    icon: Thermometer,
    bgClassName: "bg-amber-50",
    iconClassName: "text-amber-500",
  },
  {
    value: 4,
    label: "Hot",
    icon: Flame,
    bgClassName: "bg-orange-50",
    iconClassName: "text-orange-500",
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
          {/* Ghost icon */}
          <stat.icon
            className="absolute -right-2 -bottom-2 pointer-events-none"
            style={{ width: 72, height: 72, color: APP_BLUE, opacity: 0.06 }}
            strokeWidth={1.5}
          />

          {/* Big count */}
          <p className="text-4xl font-bold text-gray-900 leading-none mb-1">
            {stat.count}
          </p>

          {/* Label */}
          <p className="text-xs text-gray-400 mb-3">{stat.label}</p>

          {/* Pill badge */}
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: APP_BLUE_LIGHT, color: APP_BLUE }}
          >
            {stat.badgeIcon}
            {stat.subtext}
          </span>
        </motion.div>
      ))}

      {/* ── Ratings card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative bg-white rounded-xl p-5 border border-gray-200 overflow-hidden"
      >
        {/* Ghost icon */}
        <Star
          className="absolute -right-2 -bottom-2 pointer-events-none"
          style={{ width: 72, height: 72, color: APP_BLUE, opacity: 0.06 }}
          strokeWidth={1.5}
        />

        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Ratings
        </p>

        <div className="flex items-start">
          {RATING_OPTIONS.map((rating, i) => {
            const count = ratingCounts[rating.value];
            const Icon = rating.icon;
            const isLast = i === RATING_OPTIONS.length - 1;
            return (
              <div key={rating.value} className="flex items-start flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  {/* Colored icon pill */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${rating.bgClassName}`}>
                    <Icon className={`w-4 h-4 ${rating.iconClassName}`} strokeWidth={2} />
                  </div>
                  {/* Count in matching color */}
                  <span className={`text-xl font-semibold leading-none ${rating.iconClassName}`}>
                    {count}
                  </span>
                  {/* Label */}
                  <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    {rating.label}
                  </span>
                </div>
                {!isLast && (
                  <div className="w-px self-stretch bg-gray-100 mx-1 my-1" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}