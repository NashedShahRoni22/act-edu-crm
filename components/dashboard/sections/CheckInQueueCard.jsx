"use client";

import { motion } from "framer-motion";
import { Building2, Clock, User } from "lucide-react";

export default function CheckInQueueCard({ checkInQueue }) {
  const checkins = checkInQueue?.data || checkInQueue?.items || [];
  const totalCount = checkInQueue?.total || checkins.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Check-in Queue</h3>
        <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
          {totalCount}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {Array.isArray(checkins) && checkins.length > 0 ? (
          checkins.map((checkin, index) => (
            <div key={checkin.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {checkin.contact?.name || checkin.contact_name || `Check-in ${index + 1}`}
                </h4>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 flex-shrink-0">
                  {checkin.status || "Pending"}
                </span>
              </div>
              
              <div className="space-y-1.5 text-xs text-gray-600">
                {checkin.office && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{checkin.office.name || checkin.office}</span>
                  </div>
                )}
                
                {checkin.check_in_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(checkin.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
                
                {checkin.host_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Host: {checkin.host_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No check-ins in queue</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
