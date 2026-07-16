import React from "react";
import { Incident } from "../../types/stadium";

interface IncidentBannerProps {
  incident: Incident | null;
  onDismiss: () => void;
  onDispatch: (incidentId: string) => void;
}

/**
 * IncidentBanner component.
 * Displays active critical notifications on the dashboard.
 * Uses role="alert" to instantly notify assistive technologies.
 */
export const IncidentBanner = React.memo<IncidentBannerProps>(({
  incident,
  onDismiss,
  onDispatch,
}) => {
  if (!incident) return null;

  const { id, category, title, description, severity, status, location } = incident;

  // Determine styles based on severity
  let severityStyles = "border-rose-500 bg-rose-950/60 text-rose-200";
  let badgeStyles = "bg-rose-500/20 text-rose-300 border-rose-500/30";

  if (severity === "HIGH") {
    severityStyles = "border-amber-500 bg-amber-950/60 text-amber-200";
    badgeStyles = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  } else if (severity === "MEDIUM" || severity === "LOW") {
    severityStyles = "border-sky-500 bg-sky-950/60 text-sky-200";
    badgeStyles = "bg-sky-500/20 text-sky-300 border-sky-500/30";
  }

  const isDispatched = status === "DISPATCHED";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-xl border p-5 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${severityStyles}`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeStyles}`}>
            {severity} ALERT: {category}
          </span>
          <span className="text-xs text-slate-400">ID: {id}</span>
          <span className="text-xs font-medium text-slate-300">
            • Location: {location.section} ({location.zoneId.replace("zone-", "")})
          </span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        <p className="text-sm text-slate-200">{description}</p>
        
        {isDispatched && (
          <p className="text-xs font-semibold text-emerald-400" aria-live="polite">
            ✓ Personnel dispatched and en route to coordinates.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 self-end md:self-center">
        {!isDispatched && (
          <button
            onClick={() => onDispatch(id)}
            className="rounded-lg bg-white px-4.5 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label={`Dispatch emergency response team to resolve ${title}`}
          >
            Dispatch Staff
          </button>
        )}

        <button
          onClick={onDismiss}
          className="rounded-lg border border-white/20 bg-transparent px-4.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Dismiss alert"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
});

IncidentBanner.displayName = "IncidentBanner";

