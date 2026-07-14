"use client";

import React, { useState, useEffect } from "react";
import { Gate, Zone, Incident } from "../../types/stadium";
import {
  initialGates,
  initialZones,
  simulateTelemetryUpdate,
  generateRandomIncident,
} from "../../data/stadiumData";
import { GateCard } from "../../components/dashboard/GateCard";
import { AIInsightPanel } from "../../components/dashboard/AIInsightPanel";
import { IncidentBanner } from "../../components/dashboard/IncidentBanner";
import { Locale, t } from "../../lib/translations";
import Link from "next/link";

/** Available locale options */
const LOCALE_OPTIONS: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

/**
 * OrganizerDashboard — The central operations command center for stadium staff.
 *
 * Features:
 * - Live telemetry polling with gate + zone density updates
 * - Simulate Incident, Dispatch Staff, and Mark Resolved actions
 * - Emergency Broadcast composer (message displayed on Fan Portal)
 * - Language selector (en / es / fr) via shared translations module
 * - AI Insight Panel (Gemini-powered or fallback)
 *
 * WCAG 2.1 AA compliant throughout.
 */
export default function OrganizerDashboard() {
  // ─── Locale ─────────────────────────────────────────────────────────────
  const [locale, setLocale] = useState<Locale>("en");
  const tr = t(locale);

  // ─── Client state ────────────────────────────────────────────────────────
  const [gates, setGates] = useState<Gate[]>(initialGates);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // ─── Emergency Broadcast ─────────────────────────────────────────────────
  const [broadcastDraft, setBroadcastDraft] = useState("");
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // ─── Sustainability stats ────────────────────────────────────────────────
  const [sustainability, setSustainability] = useState({
    recycleKg: 1420,
    compostKg: 852,
    landfillKg: 310,
    carbonOffsetKg: 5420,
  });

  // ─── Live Telemetry Polling (10s) ────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = simulateTelemetryUpdate(gates, zones);
      setGates(updated.gates);
      setZones(updated.zones);

      setSustainability((prev) => ({
        recycleKg: prev.recycleKg + Math.floor(Math.random() * 5),
        compostKg: prev.compostKg + Math.floor(Math.random() * 3),
        landfillKg: prev.landfillKg + Math.floor(Math.random() * 2),
        carbonOffsetKg: prev.carbonOffsetKg + Math.floor(Math.random() * 4),
      }));

      if (selectedZone) {
        const freshZone = updated.zones.find((z) => z.id === selectedZone.id);
        if (freshZone) setSelectedZone(freshZone);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [gates, zones, selectedZone]);

  // ─── Incident Actions ────────────────────────────────────────────────────
  const handleSimulateIncident = () => {
    setActiveIncident(generateRandomIncident());
  };

  const handleDispatchIncident = (incidentId: string) => {
    if (activeIncident?.id === incidentId) {
      setActiveIncident({
        ...activeIncident,
        status: "DISPATCHED",
        dispatchedAt: new Date().toISOString(),
      });
    }
  };

  const handleResolveIncident = () => {
    if (activeIncident) {
      setActiveIncident({
        ...activeIncident,
        status: "RESOLVED",
        resolvedAt: new Date().toISOString(),
      });
      setTimeout(() => setActiveIncident(null), 2000);
    }
  };

  const handleDismissIncident = () => setActiveIncident(null);

  // ─── Broadcast ───────────────────────────────────────────────────────────
  const handleSendBroadcast = () => {
    const trimmed = broadcastDraft.trim();
    if (!trimmed) return;
    setActiveBroadcast(trimmed);
    setBroadcastSent(true);
    setBroadcastDraft("");
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  // ─── Derived Metrics ─────────────────────────────────────────────────────
  const openGates = gates.filter((g) => g.status === "OPEN" || g.status === "RESTRICTED");
  const totalFlowRate = openGates.reduce((s, g) => s + g.passengerFlowRate, 0);
  const avgWaitTime = openGates.length
    ? Math.round(openGates.reduce((s, g) => s + g.currentWaitTimeMinutes, 0) / openGates.length)
    : 0;
  const totalOccupancy = zones.reduce((s, z) => s + z.occupancy, 0);
  const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
  const overallDensityPercent = Math.round((totalOccupancy / totalCapacity) * 100);

  const getRedirectionSuggestions = (): string[] => {
    const suggestions = gates.filter((g) => g.status === "OPEN" && g.densityPercent < 50).map((g) => g.name);
    return suggestions.length > 0 ? suggestions.slice(0, 2) : ["Gate D - South Gate"];
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col antialiased">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-[#0c1630] py-5 px-5 md:px-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">⚽</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {tr.appName}
              </h1>
            </div>
            <p className="text-slate-400 text-sm font-medium mt-1">{tr.appTagline}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-700 rounded-lg p-1" role="group" aria-label={tr.language}>
              {LOCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => setLocale(opt.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    locale === opt.code
                      ? "bg-sky-600 text-white shadow"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  aria-pressed={locale === opt.code}
                  aria-label={`Switch to ${opt.label}`}
                >
                  {opt.flag} {opt.code.toUpperCase()}
                </button>
              ))}
            </div>

            <Link
              href="/fan"
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-700/50 hover:border-sky-500 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Open Fan Companion Portal"
            >
              🎟️ Fan Portal
            </Link>

            <span
              className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
              aria-live="polite"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-2" aria-hidden="true" />
              {tr.liveTelemetry}
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">

        {/* Active Broadcast Banner */}
        {activeBroadcast && (
          <div
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 flex items-center justify-between gap-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <span className="text-rose-400 text-lg" aria-hidden="true">📢</span>
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block">{tr.activeBroadcast}</span>
                <p className="text-sm text-slate-200">{activeBroadcast}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveBroadcast(null)}
              className="text-slate-500 hover:text-rose-400 text-sm font-semibold shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
              aria-label="Clear active broadcast"
            >
              {tr.clearBroadcast}
            </button>
          </div>
        )}

        {/* Incident Banner */}
        {activeIncident && (
          <section aria-label="Active Security and Medical Alerts">
            <IncidentBanner
              incident={activeIncident}
              onDismiss={handleDismissIncident}
              onDispatch={handleDispatchIncident}
            />
            {/* Resolve action */}
            {activeIncident.status === "DISPATCHED" && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleResolveIncident}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Mark the incident as resolved"
                >
                  ✓ {tr.resolveIncident}
                </button>
              </div>
            )}
          </section>
        )}

        {/* METRIC OVERVIEW GRID */}
        <section aria-label="Operations Overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Occupancy */}
          <div tabIndex={0} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{tr.totalOccupancy}</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{totalOccupancy.toLocaleString()}</span>
              <span className="text-xs text-slate-400">/ {totalCapacity.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden" aria-hidden="true">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallDensityPercent}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{tr.stadiumCapacity} {overallDensityPercent}% capacity.</p>
          </div>

          {/* Average Wait Time */}
          <div tabIndex={0} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{tr.avgWaitTime}</h2>
            <p className="text-3xl font-extrabold text-white mt-2">{avgWaitTime} <span className="text-lg font-normal text-slate-400">min</span></p>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${avgWaitTime > 30 ? "bg-rose-500" : avgWaitTime > 15 ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" />
              <span className="text-slate-300">
                {avgWaitTime > 30 ? tr.highCongestion : avgWaitTime > 15 ? tr.moderateQueues : tr.fluidFlow}
              </span>
            </div>
          </div>

          {/* Aggregate Gate Flow Rate */}
          <div tabIndex={0} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{tr.entryFlowRate}</h2>
            <p className="text-3xl font-extrabold text-white mt-2">{totalFlowRate} <span className="text-lg font-normal text-slate-400">p/min</span></p>
            <p className="text-xs text-slate-400 mt-4">{tr.acrossActiveGates}: {openGates.length}</p>
          </div>

          {/* Active Incidents */}
          <div tabIndex={0} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{tr.activeSafetyAlerts}</h2>
            <p className="text-3xl font-extrabold text-white mt-2">{activeIncident ? "1" : "0"}</p>
            <div className="mt-4">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${activeIncident ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-400"}`}>
                {activeIncident ? tr.actionRequired : tr.allZonesNormal}
              </span>
            </div>
          </div>
        </section>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* GATES & ZONES — col-span-2 */}
          <section aria-label="Venue Telemetry Controls" className="lg:col-span-2 space-y-6">

            {/* GATE STATUS BOARD */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white tracking-wide border-b border-slate-800 pb-3 mb-4">
                {tr.gateFlowBoard}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gates.map((gate) => (
                  <GateCard key={gate.id} gate={gate} />
                ))}
              </div>
            </div>

            {/* ZONE DENSITY HEATMAP */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white tracking-wide border-b border-slate-800 pb-3 mb-4">
                {tr.zonesDensityMap}
              </h2>
              <p className="text-xs text-slate-400 mb-4 italic">{tr.selectZoneHint}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zones.map((zone) => {
                  const fillRatio = zone.occupancy / zone.capacity;
                  const densityText = zone.densityColor === "RED" ? "Congested" : zone.densityColor === "YELLOW" ? "Moderate" : "Low Density";
                  const borderClass = zone.densityColor === "RED" ? "border-rose-500/40 hover:border-rose-500" : zone.densityColor === "YELLOW" ? "border-amber-500/40 hover:border-amber-500" : "border-slate-800 hover:border-sky-500";
                  const bgClass = zone.densityColor === "RED" ? "bg-rose-950/10" : zone.densityColor === "YELLOW" ? "bg-amber-950/10" : "bg-slate-900/30";
                  const dotClass = zone.densityColor === "RED" ? "bg-rose-500" : zone.densityColor === "YELLOW" ? "bg-amber-500" : "bg-emerald-500";
                  const isSelected = selectedZone?.id === zone.id;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(isSelected ? null : zone)}
                      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${borderClass} ${bgClass} ${isSelected ? "ring-2 ring-sky-500" : ""}`}
                      aria-label={`${zone.name}. Occupancy: ${zone.occupancy} of ${zone.capacity}. Status: ${densityText}.`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{zone.name}</span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
                          <span>{densityText}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{zone.occupancy.toLocaleString()} fans</span>
                          <span>{Math.round(fillRatio * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${dotClass}`}
                            style={{ width: `${Math.round(fillRatio * 100)}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Zone Panel */}
              {selectedZone && (
                <div className="mt-6 rounded-xl border border-sky-500/30 bg-sky-950/10 p-5 space-y-3" role="region" aria-labelledby="zone-detail-title">
                  <h3 id="zone-detail-title" className="text-base font-bold text-sky-300">
                    {tr.zoneAnalysis}: {selectedZone.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                    <div>
                      <span>{tr.currentAttendance}:</span>
                      <p className="text-base font-bold text-white">{selectedZone.occupancy.toLocaleString()} fans</p>
                    </div>
                    <div>
                      <span>{tr.fillPercentage}:</span>
                      <p className="text-base font-bold text-white">{Math.round((selectedZone.occupancy / selectedZone.capacity) * 100)}%</p>
                    </div>
                  </div>
                  {selectedZone.densityColor === "RED" && (
                    <div className="pt-2 border-t border-sky-500/20">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-1">{tr.congestionRedirectionPlan}:</span>
                      <ul className="list-disc list-inside mt-1 text-xs font-bold text-white">
                        {getRedirectionSuggestions().map((gateName, i) => <li key={i}>{gateName}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside aria-label="Operations Control and AI Insights" className="space-y-6">

            {/* AI INSIGHT PANEL */}
            <AIInsightPanel gates={gates} zones={zones} activeIncident={activeIncident} />

            {/* OPS CONTROL ROOM */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4" aria-labelledby="ops-ctrl-title">
              <h2 id="ops-ctrl-title" className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3">
                {tr.opsControlRoom}
              </h2>

              <div className="space-y-3">
                {/* Simulate Incident */}
                <button
                  onClick={handleSimulateIncident}
                  disabled={activeIncident !== null}
                  className={`w-full rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${activeIncident ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/10"}`}
                  aria-label="Simulate an emergency, medical, or facility incident"
                >
                  {tr.simulateIncident}
                </button>

                {/* Dispatch Staff (only when incident is REPORTED) */}
                {activeIncident?.status === "REPORTED" && (
                  <button
                    onClick={() => handleDispatchIncident(activeIncident.id)}
                    className="w-full rounded-lg py-3 px-4 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                    aria-label="Dispatch staff to the incident location"
                  >
                    🚨 {tr.dispatchStaff}
                  </button>
                )}

                {/* Resolve (only when DISPATCHED) */}
                {activeIncident?.status === "DISPATCHED" && (
                  <button
                    onClick={handleResolveIncident}
                    className="w-full rounded-lg py-3 px-4 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Mark the active incident as resolved"
                  >
                    ✓ {tr.resolveIncident}
                  </button>
                )}

                <p className="text-xs text-slate-500 italic text-center">
                  {activeIncident ? tr.resolveActiveAlert : tr.simulateIncidentDesc}
                </p>
              </div>
            </section>

            {/* EMERGENCY BROADCAST COMPOSER */}
            <section className="rounded-xl border border-rose-800/30 bg-slate-900/40 p-6 space-y-4" aria-labelledby="broadcast-title">
              <h2 id="broadcast-title" className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
                <span aria-hidden="true">📢</span> {tr.emergencyBroadcast}
              </h2>

              <div className="space-y-3">
                <label htmlFor="broadcast-input" className="sr-only">{tr.emergencyBroadcast}</label>
                <textarea
                  id="broadcast-input"
                  value={broadcastDraft}
                  onChange={(e) => setBroadcastDraft(e.target.value.slice(0, 300))}
                  placeholder={tr.broadcastPlaceholder}
                  rows={3}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  aria-describedby="broadcast-char-count"
                  maxLength={300}
                />
                <p id="broadcast-char-count" className="text-right text-xs text-slate-500">{broadcastDraft.length}/300</p>

                <button
                  onClick={handleSendBroadcast}
                  disabled={!broadcastDraft.trim() || broadcastSent}
                  className={`w-full rounded-lg py-2.5 px-4 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${broadcastSent ? "bg-emerald-600 text-white" : "bg-rose-600 hover:bg-rose-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"}`}
                  aria-label={broadcastSent ? tr.broadcastSent : tr.sendBroadcast}
                >
                  {broadcastSent ? `✓ ${tr.broadcastSent}` : tr.sendBroadcast}
                </button>
              </div>
            </section>

            {/* SUSTAINABILITY STATS */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4" aria-labelledby="sustain-monitor-title">
              <h2 id="sustain-monitor-title" className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3">
                {tr.sustainabilityMonitor}
              </h2>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{tr.recycledWaste}:</span>
                  <span className="font-mono font-bold text-emerald-400">{sustainability.recycleKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{tr.compostedWaste}:</span>
                  <span className="font-mono font-bold text-emerald-400">{sustainability.compostKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{tr.landfillRefuse}:</span>
                  <span className="font-mono font-bold text-rose-400">{sustainability.landfillKg.toLocaleString()} kg</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-semibold text-white">
                  <span>{tr.carbonOffset}:</span>
                  <span className="font-mono text-sky-400">{sustainability.carbonOffsetKg.toLocaleString()} kg CO2e</span>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#0c1630] py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 FIFA World Cup Operations Companion. All telemetry and data streams are simulated for demonstration purposes.</p>
      </footer>
    </div>
  );
}
