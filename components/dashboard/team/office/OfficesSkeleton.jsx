export default function OfficesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-pulse">
        <div className="min-w-0">
          <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full max-w-80 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-full sm:w-36 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-10 w-full max-w-md bg-gray-100 rounded-lg" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-44 bg-gray-200 rounded" />
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <div className="w-9 h-9 rounded-lg bg-gray-200" />
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
