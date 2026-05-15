"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function BarChartCard({ title, data = [], dataKey = "value", color = "#3b82f6" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-8">{title}</h3>
      
      <div className="flex-1 overflow-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" radius={8} />
              <XAxis 
                dataKey="name" 
                interval={0}
                angle={-35}
                textAnchor="end"
                height={70}
                tickMargin={14}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                stroke="#d1d5db"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#6b7280" }}
                stroke="#d1d5db"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#f9fafb", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                }}
                cursor={{ fill: `${color}15` }}
              />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                name={title}
                fill="url(#colorGradient)"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
