import { Search, SlidersHorizontal, Plus, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function PartnersFilterSidebar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  categories,
  partnerTypes,
  onAdd,
}) {
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full lg:w-64 flex-shrink-0"
    >
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-6 sticky top-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
            Filters
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          </h3>

          <div className="space-y-4">
            {/* Search Option */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Master Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Master Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={handleFilterChange(setSelectedCategory)}
                  className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Partner Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Partner Type</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={handleFilterChange(setSelectedType)}
                  disabled={!selectedCategory || selectedCategory === "all"}
                  className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/40 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="all">All Types</option>
                  {partnerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
          <button
             onClick={onAdd}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3B4CB8] text-white rounded-lg text-sm font-medium hover:bg-[#2F3C94] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
    </motion.div>
  );
}
