import React, { useState, useEffect } from "react";
import { Gate, Zone, Incident, AIOperationalRecommendation, AIOperationsManagerInsights } from "../../types/stadium";

interface AIInsightPanelProps {
  gates: Gate[];
  zones: Zone[];
  activeIncident: Incident | null;
}

/**
 * AIInsightPanel Component
 *
 * Acting as the "AI Stadium Operations Manager", this panel consumes live telemetry
 * and displays data-backed recommendations detailing priority levels, confidence scores,
 * operational impact, reasoning, and interactive check-off task lists.
 */
export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  gates,
  zones,
  activeIncident,
}) => {
  const [insights, setInsights] = useState<AIOperationsManagerInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track completed steps locally to allow operators to check off completed dispatch tasks.
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

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

      const data: AIOperationsManagerInsights = await response.json();
      setInsights(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred while loading insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [activeIncident?.id, activeIncident?.status]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchInsights(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [gates, zones, activeIncident]);

  const handleStepToggle = (recIdx: number, stepIdx: number) => {
    const key = `${recIdx}-${stepIdx}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-500/25 border-rose-500/50 text-rose-300";
      case "HIGH":
        return "bg-amber-500/25 border-amber-500/50 text-amber-300";
      case "MEDIUM":
        return "bg-sky-500/25 border-sky-500/50 text-sky-300";
      default:
        return "bg-slate-500/25 border-slate-700/80 text-slate-300";
    }
  };

  const getPriorityBorderClass = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "border-rose-500/30 bg-rose-950/5 hover:border-rose-500/50";
      case "HIGH":
        return "border-amber-500/30 bg-amber-950/5 hover:border-amber-500/50";
      case "MEDIUM":
        return "border-sky-500/30 bg-sky-950/5 hover:border-sky-500/50";
      default:
        return "border-slate-800 bg-slate-900/20 hover:border-slate-700";
    }
  };

  const getConfidenceColorClass = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm flex flex-col gap-4"
      aria-labelledby="ai-panel-title"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-bold"
            aria-hidden="true"
          >
            ✦
          </div>
          <h2 id="ai-panel-title" className="text-xl font-bold tracking-wide text-white flex items-center gap-2 flex-wrap">
            <span>AI Operations & Command Hub</span>
            {insights && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                  insights.mode === "live"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {insights.mode === "live" ? "AI Manager Online" : "Rule Engine Fallback"}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-slate-500 font-mono" aria-live="polite">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchInsights(false)}
            disabled={loading}
            className="rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Force operational telemetry analysis refresh"
          >
            {loading ? "Analyzing..." : "Refresh Feed"}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !insights && (
        <div
          className="space-y-4"
          role="status"
          aria-label="AI operations sensor data analysis loading"
        >
          <p className="text-slate-400 text-sm italic mb-2">
            Aggregating gate telemetry, stand occupancies, safety incident boards, and accessibility routes. Gemini operations manager is drafting recommendations...
          </p>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-800/80 rounded-md w-3/4" />
            <div className="h-4 bg-slate-800/80 rounded-md w-5/6" />
            <div className="h-4 bg-slate-800/80 rounded-md w-1/2" />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-4 text-sm text-rose-400 font-medium"
          role="alert"
        >
          <span className="font-bold">Operations Alert:</span> {error}
        </div>
      )}

      {/* Dynamic Content */}
      {insights && (
        <div className="space-y-5" aria-live="polite">
          
          {/* Critical Alerts Banner List */}
          {insights.criticalAlerts && insights.criticalAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Critical Telemetry Violations
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

          {/* AI Recommendations */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Strategic Dispatch Directives
            </h3>
            
            <div className="space-y-4">
              {insights.recommendations && insights.recommendations.length > 0 ? (
                insights.recommendations.map((rec, recIdx) => {
                  const borderClass = getPriorityBorderClass(rec.priorityLevel);
                  const badgeStyles = getPriorityBadgeStyles(rec.priorityLevel);
                  const confidenceColor = getConfidenceColorClass(rec.confidenceScore);

                  return (
                    <article
                      key={recIdx}
                      className={`rounded-lg border p-4 space-y-3 transition-colors duration-200 ${borderClass}`}
                    >
                      {/* Priority, Title, and Confidence Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`rounded border px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase ${badgeStyles}`}>
                            {rec.priorityLevel}
                          </span>
                          <h4 className="font-bold text-white text-sm tracking-wide">
                            {rec.title}
                          </h4>
                        </div>
                        
                        {/* Confidence Meter */}
                        <div className="flex items-center gap-2" title={`Operational Confidence Level: ${rec.confidenceScore}%`}>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">
                            Conf: {rec.confidenceScore}%
                          </span>
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                            <div className={`h-full rounded-full ${confidenceColor}`} style={{ width: `${rec.confidenceScore}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Recommended Action */}
                      <div className="text-xs text-sky-300 font-semibold bg-sky-950/20 border border-sky-500/10 rounded px-2.5 py-1.5">
                        <span className="text-sky-400 uppercase font-bold mr-1">Directive:</span>
                        {rec.recommendedAction}
                      </div>

                      {/* Reasoning */}
                      <p className="text-xs text-slate-300 leading-relaxed italic bg-black/10 p-2 rounded">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block not-italic mb-0.5">Reasoning:</span>
                        {rec.reasoning}
                      </p>

                      {/* Operational Impact */}
                      {rec.operationalImpact && (
                        <div className="text-xs text-slate-400">
                          <strong className="text-slate-300 font-bold">Projected Outcome: </strong>
                          {rec.operationalImpact}
                        </div>
                      )}

                      {/* Suggested Next Steps Checklist */}
                      {rec.suggestedNextSteps && rec.suggestedNextSteps.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Suggested Execution Checklist
                          </span>
                          <ul className="space-y-1.5" aria-label="Actionable next step checklist">
                            {rec.suggestedNextSteps.map((step, stepIdx) => {
                              const isChecked = !!completedSteps[`${recIdx}-${stepIdx}`];
                              return (
                                <li key={stepIdx} className="flex items-start gap-2.5">
                                  <input
                                    type="checkbox"
                                    id={`step-${recIdx}-${stepIdx}`}
                                    checked={isChecked}
                                    onChange={() => handleStepToggle(recIdx, stepIdx)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer"
                                  />
                                  <label
                                    htmlFor={`step-${recIdx}-${stepIdx}`}
                                    className={`text-xs cursor-pointer select-none transition-colors ${
                                      isChecked ? "text-slate-500 line-through" : "text-slate-300 hover:text-white"
                                    }`}
                                  >
                                    {step}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">No entry bottlenecks or directives catalogued.</p>
              )}
            </div>
          </div>

          {/* Sustainability Tip */}
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
