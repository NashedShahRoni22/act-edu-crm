"use client";

import { useState } from "react";
import { Edit2, Calendar } from "lucide-react";

import UpdateFeeModal from "./modals/UpdateFeeModal";
import UpdateForecastModal from "./modals/UpdateForecastModal";
import UpdateIntakeModal from "./modals/UpdateIntakeModal";

const APP_BLUE = "#3B4CB8";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return null;
  return value;
}

/** Parses "YYYY-MM-DD" into { month, day, year } display parts */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return {
    month: d.toLocaleString("en-US", { month: "long" }),
    day: d.getDate(),
    year: d.getFullYear(),
  };
}

// ─── Date input field ────────────────────────────────────────────────────────
function DateField({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <span className={`text-sm ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value || "Select date"}
        </span>
        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
      </div>
      <p className="text-[11px] text-gray-400 mt-1">Date must be in YYYY-MM-DD (2012-12-22) format.</p>
    </div>
  );
}

// ─── START / END date card pair ───────────────────────────────────────────────
function StartEndCards({ startDate, endDate }) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  return (
    <div className="grid grid-cols-2 gap-3 my-3">
      {[
        { label: "START", parsed: start, accent: APP_BLUE },
        { label: "END", parsed: end, accent: "#ef4444" },
      ].map(({ label, parsed, accent }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{label}</p>
          {parsed ? (
            <>
              <p className="text-xs text-gray-500">{parsed.month}</p>
              <p className="text-3xl font-bold leading-tight" style={{ color: accent }}>{parsed.day}</p>
              <p className="text-xs text-gray-500">{parsed.year}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-3">—</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Row: label + value, with optional color ──────────────────────────────────
function InfoRow({ label, value, valueColor }) {
  const display = formatValue(value);
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span
        className="text-sm"
        style={{ color: valueColor && display !== null ? valueColor : "#6b7280" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium"
        style={{ color: valueColor && display !== null ? valueColor : "#111827" }}
      >
        {display ?? "—"}
      </span>
    </div>
  );
}

// ─── Section block (Product Fees / Sales Forecast) ────────────────────────────
function SectionBlock({ title, badge, onEdit, children }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
          {badge && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: APP_BLUE }}
            >
              {badge}
            </span>
          )}
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ApplicationInformations({ application, contactId }) {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isFeeOpen, setIsFeeOpen] = useState(false);

  const financialInfo = application?.financial_info || {};
  const intakeInfo = application?.intake_info || {};
  const applicationId = application?.id;
  const resolvedContactId = contactId || application?.contact?.id;

  const fees = financialInfo?.product_fees || {};
  const forecast = financialInfo?.sales_forecast || {};

  return (
    <section className="w-1/3 space-y-0">
      {/* ── Card ── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">

        {/* ── Intake section ── */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Intake Information</p>
            <button
              type="button"
              onClick={() => setIsIntakeOpen(true)}
              disabled={!applicationId}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded disabled:opacity-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <DateField label="Applied Intake:" value={formatValue(intakeInfo.applied_intake_date)} />
          <StartEndCards
            startDate={intakeInfo.start_date}
            endDate={intakeInfo.end_date}
          />
        </div>

        {/* ── Product Fees ── */}
        <div className="px-4">
          <SectionBlock title="Product Fees" onEdit={() => setIsFeeOpen(true)}>
            <InfoRow label="Total Fee" value={fees.total_fee} />
            <InfoRow label="Discount" value={fees.discount} valueColor="#ef4444" />
            <InfoRow label="Net Fee" value={fees.net_fee} valueColor={APP_BLUE} />
            {/* {fees.fee_details && (
              <InfoRow label="Fee Details" value={fees.fee_details} />
            )} */}
          </SectionBlock>

          {/* ── Sales Forecast ── */}
          <SectionBlock
            title="Sales Forecast"
            badge={forecast.currency || "AUD"}
            onEdit={() => setIsForecastOpen(true)}
          >
            <InfoRow label="Partner Revenue" value={forecast.partner_revenue} />
            <InfoRow label="Client Revenue" value={forecast.client_revenue} />
            <InfoRow label="Discount" value={forecast.discount} valueColor="#ef4444" />
            <InfoRow label="Net Revenue" value={forecast.net_revenue} valueColor={APP_BLUE} />
          </SectionBlock>

          {/* ── Expected Win Date ── */}
          <div className="py-3">
            <DateField
              label="Expected Win Date:"
              value={formatValue(financialInfo?.expected_win_date)}
            />
          </div>
        </div>
      </div>


      {/* ── Modals ── */}
      <UpdateIntakeModal
        open={isIntakeOpen}
        onOpenChange={setIsIntakeOpen}
        applicationId={applicationId}
        contactId={resolvedContactId}
        intakeInfo={intakeInfo}
      />
      <UpdateForecastModal
        open={isForecastOpen}
        onOpenChange={setIsForecastOpen}
        applicationId={applicationId}
        contactId={resolvedContactId}
        forecastInfo={forecast}
      />
      <UpdateFeeModal
        open={isFeeOpen}
        onOpenChange={setIsFeeOpen}
        applicationId={applicationId}
        contactId={resolvedContactId}
        feeInfo={fees}
      />
    </section>
  );
}