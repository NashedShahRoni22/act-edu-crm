"use client";

import { motion } from "framer-motion";
import BarChartCard from "./BarChartCard";

export default function TopPartnersLeaderboard({ topPartners }) {
  const chartData = (topPartners || []).map((partner) => ({
    name: partner.name,
    value: partner.value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="h-96"
    >
      <BarChartCard
        title="Top Partners"
        data={chartData}
        dataKey="value"
        color="#ef4444"
      />
    </motion.div>
  );
}
