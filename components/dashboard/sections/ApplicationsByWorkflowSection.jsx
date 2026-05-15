"use client";

import { motion } from "framer-motion";
import PieChartCard from "./PieChartCard";

export default function ApplicationsByWorkflowSection({ applicationsByWorkflow }) {
  // Transform data for pie chart
  const chartData = (applicationsByWorkflow || []).map((workflow) => ({
    name: workflow.name,
    value: workflow.value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="h-96"
    >
      <PieChartCard
        title="In Progress Applications By Workflow"
        data={chartData}
      />
    </motion.div>
  );
}
