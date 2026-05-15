"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export default function MyTasksCard({ myTasks }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">My Tasks Today</h3>
        <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
          {myTasks?.length || 0}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {myTasks && myTasks.length > 0 ? (
          myTasks.map((task, index) => (
            <div key={task.id || index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              {/* <div className="flex-shrink-0 mt-1">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div> */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  task.completed ? "text-gray-400 line-through" : "text-gray-900"
                }`}>
                  {task.title || task.name || "Untitled task"}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                {task.due_date && (
                  <p className="text-xs text-gray-500 mt-1">{new Date(task.due_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No tasks for today</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
