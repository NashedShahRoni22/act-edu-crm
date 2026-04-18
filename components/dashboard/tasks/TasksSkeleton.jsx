export default function TasksSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-pulse">
        <div className="min-w-0">
          <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full max-w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-full sm:w-32 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-9 w-24 bg-gray-100 rounded-lg" />
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="h-10 w-full md:w-64 bg-gray-100 rounded-lg" />
            <div className="h-10 w-24 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left"><div className="h-3 w-12 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-left"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-left"><div className="h-3 w-14 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-left"><div className="h-3 w-12 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-left"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3 text-right"><div className="h-3 w-16 bg-gray-200 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-100 rounded-full" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-100 rounded-full" /></td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <div className="w-8 h-8 rounded-lg bg-gray-200" />
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
