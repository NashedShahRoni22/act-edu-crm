"use client";

import { motion } from "framer-motion";

export default function WorkflowStagesSection({ 
  applicationsByStages, 
  workflows, 
  selectedWorkflowId, 
  onWorkflowChange 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">
          Application By Workflow Stages
        </h3>
        <select 
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={selectedWorkflowId || ""}
          onChange={(e) => onWorkflowChange(Number(e.target.value))}
        >
          {workflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name || `Workflow ${workflow.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1">
        {applicationsByStages?.stages && applicationsByStages.stages.length > 0 ? (
          <>
            {applicationsByStages.stages.map((stage, index) => {
              const maxCount = applicationsByStages.max_total || 100;
              const percentage = (stage.total / maxCount) * 100;
              
              const stageColors = [
                "bg-blue-500",
                "bg-cyan-500",
                "bg-green-500",
                "bg-emerald-500",
                "bg-teal-500",
              ];
              const color = stageColors[index % stageColors.length];

              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {stage.name || `Stage ${index + 1}`}
                    </span>
                    <span className="text-lg font-bold text-blue-600">{stage.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                      className={`${color} h-3 rounded-full`}
                    ></motion.div>
                  </div>
                </motion.div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
