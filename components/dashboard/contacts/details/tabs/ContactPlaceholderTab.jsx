export default function ContactPlaceholderTab({ title }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">
        This tab is ready. Data integration will be added next.
      </p>
    </div>
  );
}
