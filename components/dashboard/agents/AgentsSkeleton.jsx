export default function AgentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg" />
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-10 w-20 bg-gray-200 rounded-lg" />
            ))}
          </div>

          {/* Search + Import */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="h-10 w-64 bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "Name",
                  "Type",
                  "Structure",
                  "Phone",
                  "City",
                  "Office",
                  "Clients",
                  "Applications",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-32 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>

                  {/* Structure */}
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </td>

                  {/* City */}
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>

                  {/* Office */}
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>

                  {/* Clients */}
                  <td className="px-6 py-4">
                    <div className="h-6 w-12 bg-blue-100 rounded-full" />
                  </td>

                  {/* Applications */}
                  <td className="px-6 py-4">
                    <div className="h-6 w-12 bg-green-100 rounded-full" />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {Array.from({ length: 3 }).map((_, btnIdx) => (
                        <div
                          key={btnIdx}
                          className="w-10 h-10 bg-gray-200 rounded-lg"
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
