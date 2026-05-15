"use client";

import { motion } from "framer-motion";
import BarChartCard from "./BarChartCard";

export default function TopProductsLeaderboard({ topProducts }) {
  const products = topProducts?.products || [];
  const chartData = products.map((product) => ({
    name: product.product_name,
    value: product.total,
    partner_name: product.partner_name,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="h-96"
    >
      <BarChartCard
        title="Top Products"
        data={chartData}
        dataKey="value"
        color="#22c55e"
      />
    </motion.div>
  );
}
