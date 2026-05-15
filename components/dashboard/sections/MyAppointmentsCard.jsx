"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, User, Phone, Mail } from "lucide-react";

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const options = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return date.toLocaleDateString("en-US", options);
}

export default function MyAppointmentsCard({ myAppointments }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">My Appointments</h3>
        <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
          {myAppointments?.length || 0}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {myAppointments && myAppointments.length > 0 ? (
          myAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{appointment.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
                  appointment.status === "Completed" ? "bg-green-100 text-green-700" :
                  appointment.status === "Cancelled" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {appointment.status}
                </span>
              </div>
              
              {appointment.appointable && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {appointment.appointable.first_name} {appointment.appointable.last_name}
                  </span>
                </div>
              )}
              
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateTime(appointment.scheduled_at)}</span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{appointment.duration_minutes} minutes</span>
                </div>
                
                {appointment.appointable?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{appointment.appointable.phone}</span>
                  </div>
                )}
                
                {appointment.appointable?.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate text-xs">{appointment.appointable.email}</span>
                  </div>
                )} */}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No appointments scheduled</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
