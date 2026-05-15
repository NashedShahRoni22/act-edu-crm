"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar, FileText } from "lucide-react";

export default function ApplicationRemindersCard({ applicationReminders }) {
  const reminders = applicationReminders?.data || applicationReminders?.items || [];
  const totalCount = applicationReminders?.total || reminders.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Reminders</h3>
        <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
          {totalCount}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {Array.isArray(reminders) && reminders.length > 0 ? (
          reminders.map((reminder, index) => (
            <div key={reminder.id || index} className="bg-gray-50 rounded-lg p-3 border border-orange-200 border-l-4 border-l-orange-500">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {reminder.title || reminder.subject || "Application reminder"}
                  </h4>
                </div>
              </div>
              
              {reminder.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{reminder.description}</p>
              )}
              
              <div className="space-y-1 text-xs text-gray-600">
                {reminder.application_name && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{reminder.application_name}</span>
                  </div>
                )}
                
                {reminder.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(reminder.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No reminders at the moment</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
