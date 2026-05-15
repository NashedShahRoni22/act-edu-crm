"use client";

import PieChartCard from "./PieChartCard";
import BarChartCard from "./BarChartCard";

// Example data for pie chart
const partnerDistributionData = [
  { name: "Partner A", value: 45 },
  { name: "Partner B", value: 32 },
  { name: "Partner C", value: 28 },
  { name: "Partner D", value: 18 },
  { name: "Partner E", value: 12 },
];

// Example data for bar chart
const applicationTrendData = [
  { name: "Week 1", value: 120 },
  { name: "Week 2", value: 150 },
  { name: "Week 3", value: 135 },
  { name: "Week 4", value: 180 },
  { name: "Week 5", value: 165 },
  { name: "Week 6", value: 200 },
];

export default function ChartsExampleSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <PieChartCard 
        title="Partner Distribution"
        data={partnerDistributionData}
      />
      <BarChartCard 
        title="Application Trend"
        data={applicationTrendData}
        dataKey="value"
        color="#3b82f6"
      />
    </div>
  );
}
