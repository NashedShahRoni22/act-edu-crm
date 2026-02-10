export default function SectionContainer({ children }) {
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen overflow-y-auto">
      {children}
    </div>
  )
}
