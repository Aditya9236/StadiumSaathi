import React from "react";
import { Gate } from "../../types/stadium";

interface GateCardProps {
  gate: Gate;
}

/**
 * Reusable Card component representing a stadium gate's telemetry.
 * Conforms to WCAG 2.1 AA accessibility guidelines.
 */
export const GateCard = React.memo<GateCardProps>(({ gate }) => {
  const { name, status, currentWaitTimeMinutes, passengerFlowRate, densityPercent } = gate;

  // Determine color coding & textual status based on density percentage
  let statusColorClass = "border-emerald-500 bg-emerald-950/30 text-emerald-300";
  let statusText = "Low Density";
  let badgeColorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  if (densityPercent > 80) {
    statusColorClass = "border-rose-500 bg-rose-950/30 text-rose-300";
    statusText = "Congested / High Density";
    badgeColorClass = "bg-rose-500/20 text-rose-400 border-rose-500/30";
  } else if (densityPercent >= 50) {
    statusColorClass = "border-amber-500 bg-amber-950/30 text-amber-300";
    statusText = "Moderate Density";
    badgeColorClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
  }

  // Handle closed gates explicitly
  const isClosed = status === "CLOSED";
  if (isClosed) {
    statusColorClass = "border-slate-600 bg-slate-900/50 text-slate-400";
    statusText = "Gate Closed";
    badgeColorClass = "bg-slate-800 text-slate-400 border-slate-700";
  }

  return (
    <article
      tabIndex={0}
      className={`rounded-xl border p-5 shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 ${statusColorClass}`}
      aria-label={`Gate telemetry for ${name}. Status: ${status}. Density is ${densityPercent}% (${statusText}). Wait time: ${currentWaitTimeMinutes} minutes.`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-white tracking-wide">{name}</h3>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeColorClass}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {/* Density Metric */}
        <div>
          <div className="flex justify-between text-sm font-medium mb-1">
            <span className="text-slate-300">Crowd Density:</span>
            <span className="font-bold">{densityPercent}%</span>
          </div>
          {/* Progress Bar (Visual representation) */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                densityPercent > 80
                  ? "bg-rose-500"
                  : densityPercent >= 50
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${densityPercent}%` }}
            />
          </div>
          {/* Screen Reader status text indicator */}
          <span className="sr-only">({statusText})</span>
        </div>

        {/* Dynamic Telemetry Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-sm">
          <div>
            <span className="block text-xs text-slate-400 uppercase tracking-wider">Est. Wait</span>
            <span className="text-base font-bold text-white">{currentWaitTimeMinutes} min</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 uppercase tracking-wider">Flow Rate</span>
            <span className="text-base font-bold text-white">{passengerFlowRate} p/min</span>
          </div>
        </div>
      </div>
    </article>
  );
});

GateCard.displayName = "GateCard";
