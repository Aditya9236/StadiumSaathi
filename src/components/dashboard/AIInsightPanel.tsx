import React, { useState, useEffect } from "react";
import { Gate, Zone, Incident } from "../../types/stadium";

interface AIInsightPanelProps {
  gates: Gate[];
  zones: Zone[];
  activeIncident: Incident | null;
}

interface Bottleneck {
  location: string;
  issue: string;
  recommendation: string;
}

interface InsightsData {
  mode?: "live" | "fallback";
  criticalAlerts: string[];
  bottlenecks: Bottleneck[];
  staffingAdvice: string[];
  sustainabilityTip: string;
}

/**
 * AIInsightPanel component.
 * Displays real-time Gemini AI-driven routing recommendations and staff dispatch advice.
 * Fully accessible with proper loading states, aria-live announcements, and high contrast styling.
 */
export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  gates,
  zones,
  activeIncident,
}) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = async (isManual = false) => {
    if (!isManual) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/dashboard-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gates, zones, activeIncident }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch operational insights.");
      }

      const data: InsightsData = await response.json();
      setInsights(data);
      console.log(`[AIInsightPanel] Loaded insights. Active Mode: ${data.mode === "live" ? "LIVE (Gemini AI)" : "FALLBACK (Offline Mock)"}`, data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred while loading insights.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch insights initially and when the active incident status changes
  useEffect(() => {
    fetchInsights();
  }, [activeIncident?.id, activeIncident?.status]);

  // Periodically refresh insights every 30 seconds to keep up with telemetry flow
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInsights(true); // silent updates in background
    }, 30000);

    return () => clearInterval(interval);
  }, [gates, zones, activeIncident]);

  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm flex flex-col gap-4"
      aria-labelledby="ai-panel-title"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-bold"
            aria-hidden="true"
          >
            ✦
          </div>
          <h2 id="ai-panel-title" className="text-xl font-bold tracking-wide text-white flex items-center gap-2 flex-wrap">
            <span>AI Operations & Routing Insights</span>
            {insights && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                  insights.mode === "live"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {insights.mode === "live" ? "Live (Gemini AI)" : "Offline (Fallback)"}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-slate-500 font-mono">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchInsights(false)}
            disabled={loading}
            className="rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Manually refresh AI insights"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !insights && (
        <div
          className="space-y-4"
          role="status"
          aria-label="AI telemetry analysis loading skeleton"
        >
          <p className="text-slate-400 text-sm italic mb-2">
            Simulating real-time sensor processing. Gemini API is analyzing current gate queues, stands density, and active safety incident metrics to draft optimal dispatch recommendations...
          </p>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-800/80 rounded-md w-3/4" />
            <div className="h-4 bg-slate-800/80 rounded-md w-5/6" />
            <div className="h-4 bg-slate-800/80 rounded-md w-1/2" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-4 text-sm text-rose-400 font-medium"
          role="alert"
        >
          <span className="font-bold">Operational Alert:</span> {error}
        </div>
      )}

      {/* Insights Content */}
      {insights && (
        <div className="space-y-5" aria-live="polite">
          
          {/* Critical Alerts */}
          {insights.criticalAlerts && insights.criticalAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Critical Notifications
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {insights.criticalAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 text-sm text-rose-200"
                  >
                    <span className="text-rose-500 font-bold" aria-hidden="true">⚠️</span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottlenecks & Redirections */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active Perimeter Bottlenecks
            </h3>
            <div className="space-y-3">
              {insights.bottlenecks && insights.bottlenecks.length > 0 ? (
                insights.bottlenecks.map((b, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{b.location}</span>
                      <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                        Redirection Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{b.issue}</p>
                    <div className="pt-2 border-t border-white/5 text-xs text-sky-400 font-medium">
                      <span className="font-bold text-sky-300">Action: </span>
                      {b.recommendation}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No entry bottlenecks detected.</p>
              )}
            </div>
          </div>

          {/* Staffing Guidance */}
          {insights.staffingAdvice && insights.staffingAdvice.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Operational Staffing Advice
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300 list-inside list-disc pl-1">
                {insights.staffingAdvice.map((advice, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sustainability Offset tip */}
          {insights.sustainabilityTip && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 text-sm" aria-hidden="true">🌱</span>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Green Telemetry Highlight
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.sustainabilityTip}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
