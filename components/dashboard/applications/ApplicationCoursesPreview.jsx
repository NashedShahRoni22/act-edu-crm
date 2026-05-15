import Image from "next/image";

export default function ApplicationCoursesPreview({ application }) {
  const courses = Array.isArray(application?.courses)
    ? application.courses
    : [];

  if (!courses.length) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 mb-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">Courses</p>
        <p className="text-xs text-gray-500">
          {courses.length} item{courses.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 p-3 border border-gray-50 rounded-lg bg-gray-50"
          >
            <div className="w-14 h-10 relative rounded-md overflow-hidden shrink-0">
              <Image
                src={
                  c.partner?.logo || "https://picsum.photos/seed/default/80/60"
                }
                alt={c.partner?.name || "partner"}
                fill
                sizes="(max-width: 640px) 56px, 56px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {c.product?.name || "Product"}
                </p>
                <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                  {c.product?.product_type || ""}
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-1 truncate">
                {c.partner?.name || "Partner"}
              </p>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {c.product?.duration && (
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">
                    {c.product.duration}
                  </span>
                )}
                {Array.isArray(c.product?.intake_months) &&
                  c.product.intake_months.length > 0 && (
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">
                      Intakes: {c.product.intake_months.join(", ")}
                    </span>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
