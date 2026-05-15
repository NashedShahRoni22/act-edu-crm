"use client";

import { motion } from "framer-motion";
import PieChartCard from "./PieChartCard";

export default function ApplicationsByStatusSection({ applicationsByStatus = [] }) {
  // Transform data for pie chart
  const chartData = (applicationsByStatus || []).map((status) => ({
    name: status.name,
    value: status.value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85 }}
      className="h-96"
    >
      <PieChartCard
        title="Applications By Status"
        data={chartData}
      />
    </motion.div>
  );
}
