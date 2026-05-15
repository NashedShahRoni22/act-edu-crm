"use client";

import { motion } from "framer-motion";

export default function ClientsLeaderboard({ clientsByUsers }) {
  const sortedUsers = [...clientsByUsers].sort((a, b) => b.count - a.count);
  const maxCount = sortedUsers.length > 0 ? sortedUsers[0].count : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white rounded-xl p-6 border border-gray-200 h-96 flex flex-col"
    >
      <h3 className="font-semibold text-gray-900 mb-6">
        Clients By Users
      </h3>

      <div className="space-y-3 overflow-y-auto flex-1">
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user, index) => {
            const percentage = (user.count / maxCount) * 100;
            const colors = ["bg-blue-500", "bg-gray-500", "bg-orange-500", "bg-blue-400"];
            const badgeColors = ["bg-blue-100", "bg-gray-100", "bg-orange-100", "bg-blue-50"];
            const textColors = ["text-blue-600", "text-gray-600", "text-orange-600", "text-blue-500"];
            const color = colors[index % colors.length];
            const badgeColor = badgeColors[index % badgeColors.length];
            const textColor = textColors[index % textColors.length];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 + index * 0.05 }}
              >
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center font-bold text-white text-sm`}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <span className={`text-xs font-bold ${textColor} ${badgeColor} px-2 py-1 rounded-full text-nowrap ml-2`}>
                        {user.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
