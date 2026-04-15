"use client";

import { useAppContext } from "@/context/context";
import { useQuery } from "@tanstack/react-query";
import { fetchWithToken } from "@/helpers/api";
import { Package, MapPin, Calendar } from "lucide-react";
import { useState } from "react";

function ProductsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerProductsTab({ partnerId }) {
  const { accessToken } = useAppContext();
  const [expandedProductId, setExpandedProductId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/partners/${partnerId}/products`, accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken && !!partnerId,
  });

  if (isLoading) return <ProductsSkeleton />;

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-600">
        Failed to load products.
      </div>
    );
  }

  const products = data?.data || [];

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
        >
          {/* Product Header */}
          <button
            onClick={() =>
              setExpandedProductId(
                expandedProductId === product.id ? null : product.id
              )
            }
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-[#3B4CB8] shrink-0" />
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {product.name}
                </h4>
                {product.is_auto_synced && (
                  <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium shrink-0">
                    Auto-synced
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Type:</span>
                  <span>{product.product_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Revenue:</span>
                  <span>{product.revenue_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Duration:</span>
                  <span>{product.duration}</span>
                </div>
              </div>
            </div>

            <svg
              className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                expandedProductId === product.id ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Product Details */}
          {expandedProductId === product.id && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
              {/* Description */}
              {product.description && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">
                    Description
                  </h5>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}

              {/* Intake Months */}
              {product.intake_months && product.intake_months.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Intake Months
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {product.intake_months.map((month, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Branches */}
              {product.branches && product.branches.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Available Branches ({product.branches.length})
                  </h5>
                  <div className="space-y-2">
                    {product.branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {branch.name}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                            {branch.city && (
                              <span>{branch.city}</span>
                            )}
                            {branch.country && (
                              <span>{branch.country}</span>
                            )}
                            {branch.email && (
                              <a
                                href={`mailto:${branch.email}`}
                                className="text-[#3B4CB8] hover:underline"
                              >
                                {branch.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              {product.note && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">
                    Note
                  </h5>
                  <p className="text-sm text-gray-600">{product.note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
