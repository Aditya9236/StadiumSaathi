"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StadiumMap } from "../../components/fan/StadiumMap";
import { initialGates, initialZones, simulateTelemetryUpdate } from "../../data/stadiumData";
import { Gate, Zone, NavigationResponse } from "../../types/stadium";
import { Locale, t } from "../../lib/translations";

/** Available locale options for the language switcher */
const LOCALE_OPTIONS: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

/** Valid gate IDs for input validation */
const VALID_GATE_IDS = new Set(["gate-a", "gate-b", "gate-c", "gate-d", "gate-e", "gate-f"]);
/** Valid zone IDs for input validation */
const VALID_ZONE_IDS = new Set(["zone-north", "zone-south", "zone-east", "zone-west"]);

/**
 * FanPortal — The fan-facing companion page for the StadiumSaathi system.
 *
 * Features:
 * - Interactive SVG stadium map with POI layers and gate pins
 * - Step-free/accessible route highlighting toggle
 * - AI Navigation Advisory (structured Gemini prompt → step-by-step directions)
 * - Language switcher: English, Spanish, French
 * - Emergency broadcast banner display
 *
 * WCAG 2.1 AA compliant: semantic HTML, ARIA labels, keyboard navigation.
 */
export default function FanPortal() {
  // ─── Locale & Translations ────────────────────────────────────────────────
  const [locale, setLocale] = useState<Locale>("en");
  const tr = t(locale);

  // ─── Telemetry State (polling /api/telemetry) ────────────────────────────
  const [gates, setGates] = useState<Gate[]>(initialGates);
  const [zones] = useState<Zone[]>(initialZones);

  // Poll telemetry every 10s to keep map in sync with dashboard
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = simulateTelemetryUpdate(gates, zones);
      setGates(updated.gates);
    }, 10000);
    return () => clearInterval(timer);
  }, [gates, zones]);

  // ─── Step-Free Toggle ────────────────────────────────────────────────────
  const [stepFreeMode, setStepFreeMode] = useState(false);

  // ─── Broadcast Banner (simulate incoming emergency from organizer) ────────
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  // Simulate an incoming broadcast after 8s for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setBroadcastMessage(
        locale === "es"
          ? "Atención: El flujo de peatones en la Puerta B es alto. Por favor, dirígete a la Puerta D para una entrada más rápida."
          : locale === "fr"
          ? "Attention : Le flux piétonnier à la Porte B est élevé. Veuillez vous diriger vers la Porte D pour une entrée plus rapide."
          : "Attention: Pedestrian flow at Gate B is high. Please head to Gate D for faster entry."
      );
    }, 8000);
    return () => clearTimeout(timer);
  }, [locale]);

  // ─── AI Navigation Advisor State ─────────────────────────────────────────
  const [selectedGateId, setSelectedGateId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [needStepFree, setNeedStepFree] = useState(false);
  const [needSensory, setNeedSensory] = useState(false);
  const [navResult, setNavResult] = useState<NavigationResponse | null>(null);
  const [navLoading, setNavLoading] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);

  /** Pre-fill gate field when user clicks a gate on the map */
  const handleMapGateSelect = useCallback((gateId: string) => {
    setSelectedGateId(gateId);
    setNavResult(null);
    setNavError(null);
    // Scroll to form
    document.getElementById("nav-advisor-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  /** Input validation + AI call */
  const handleGetDirections = async (e: React.FormEvent) => {
    e.preventDefault();
    setNavError(null);
    setNavResult(null);

    // Validate
    if (!VALID_GATE_IDS.has(selectedGateId)) {
      setNavError("Please select a valid entry gate.");
      return;
    }
    if (!VALID_ZONE_IDS.has(selectedZoneId)) {
      setNavError("Please select a valid destination zone.");
      return;
    }

    setNavLoading(true);
    try {
      const res = await fetch("/api/ai-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceGateId: selectedGateId,
          destinationZoneId: selectedZoneId,
          stepFreeRequired: needStepFree || stepFreeMode,
          sensorySafeRequired: needSensory,
          locale,
        }),
      });

      if (!res.ok) throw new Error(tr.navError);
      const data: NavigationResponse = await res.json();
      setNavResult(data);
    } catch {
      setNavError(tr.navError);
    } finally {
      setNavLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060B26] text-slate-100 antialiased font-sans">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-[#0c1630]/80 backdrop-blur-sm py-5 px-5 md:px-10 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">⚽</span>
              <span className="text-xl font-extrabold tracking-tight text-white">{tr.appName}</span>
              <span className="ml-2 hidden sm:inline rounded-full bg-sky-500/15 border border-sky-500/25 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                Fan Portal
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5 hidden md:block">{tr.fanPortalTagline}</p>
          </div>

          <div className="flex items-center gap-3">
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
                  aria-label={`Switch language to ${opt.label}`}
                >
                  {opt.flag} {opt.code.toUpperCase()}
                </button>
              ))}
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={tr.backToPortal}
            >
              {tr.backToPortal}
            </Link>
          </div>
        </div>
      </header>

      {/* ── EMERGENCY BROADCAST BANNER ──────────────────────────────────────── */}
      {broadcastMessage && (
        <div
          className="bg-rose-600/95 border-b border-rose-500 px-5 py-3 flex items-center justify-between gap-4"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="flex items-center gap-3 text-white">
            <span className="text-lg animate-pulse" aria-hidden="true">📢</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest block">{tr.emergencyNotice}</span>
              <p className="text-sm font-medium">{broadcastMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setBroadcastMessage(null)}
            className="shrink-0 text-white/70 hover:text-white text-xl leading-none focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label="Dismiss emergency broadcast"
          >
            ×
          </button>
        </div>
      )}

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1a2a5e] to-[#0B132B] border-b border-slate-800 py-10 px-5 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.08),transparent_60%)]" aria-hidden="true" />
        <div className="max-w-6xl mx-auto relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" aria-hidden="true" />
            FIFA World Cup 2026 • Live Venue Data
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            {tr.fanPortalTitle}
          </h1>
          <p className="text-slate-400 text-base max-w-xl">{tr.fanPortalTagline}</p>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10" id="main-content">

        {/* ── INTERACTIVE MAP SECTION ───────────────────────────────────────── */}
        <section aria-labelledby="map-section-title">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 id="map-section-title" className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-sky-400" aria-hidden="true">🗺️</span>
              {tr.interactiveMap}
            </h2>

            {/* Step-Free Toggle */}
            <button
              onClick={() => setStepFreeMode((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                stepFreeMode
                  ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                  : "bg-white/5 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
              }`}
              aria-pressed={stepFreeMode}
              aria-label={stepFreeMode ? "Disable step-free routing mode" : "Enable step-free routing mode"}
            >
              <span aria-hidden="true">♿</span>
              {tr.stepFreeRouting}
              <span className={`h-2 w-2 rounded-full ${stepFreeMode ? "bg-purple-400 animate-pulse" : "bg-slate-600"}`} aria-hidden="true" />
            </button>
          </div>

          {stepFreeMode && (
            <div className="mb-4 rounded-lg bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 text-sm text-purple-300 font-medium" aria-live="polite">
              ♿ {tr.stepFreeActive}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-6">
            <StadiumMap
              gates={gates}
              stepFreeMode={stepFreeMode}
              onNavigateToGate={handleMapGateSelect}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 text-center">
            Click any gate on the map to pre-fill the navigation form below.
          </p>
        </section>

        {/* ── AI NAVIGATION ADVISOR ─────────────────────────────────────────── */}
        <section aria-labelledby="nav-advisor-title" className="scroll-mt-24">
          <h2 id="nav-advisor-title" className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 text-sm font-bold" aria-hidden="true">✦</span>
            {tr.navigationAdvisor}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── FORM CARD ─────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <form
                id="nav-advisor-form"
                onSubmit={handleGetDirections}
                noValidate
                aria-label="Navigation advisor form"
                className="space-y-5"
              >
                {/* Gate Selector */}
                <div>
                  <label htmlFor="gate-select" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    {tr.yourGate}
                  </label>
                  <select
                    id="gate-select"
                    value={selectedGateId}
                    onChange={(e) => { setSelectedGateId(e.target.value); setNavResult(null); }}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    aria-required="true"
                    aria-describedby="gate-hint"
                  >
                    <option value="">{tr.selectGate}</option>
                    {gates.map((g) => (
                      <option key={g.id} value={g.id} disabled={g.status === "CLOSED"}>
                        {g.name} {g.status === "CLOSED" ? "(Closed)" : g.accessible ? "♿" : ""}
                        {g.status !== "CLOSED" ? ` — ~${g.currentWaitTimeMinutes}m wait` : ""}
                      </option>
                    ))}
                  </select>
                  <p id="gate-hint" className="mt-1 text-xs text-slate-500">
                    Wait times are updated live from telemetry.
                  </p>
                </div>

                {/* Zone/Section Selector */}
                <div>
                  <label htmlFor="zone-select" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    {tr.yourSection}
                  </label>
                  <select
                    id="zone-select"
                    value={selectedZoneId}
                    onChange={(e) => { setSelectedZoneId(e.target.value); setNavResult(null); }}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    aria-required="true"
                  >
                    <option value="">{tr.selectSection}</option>
                    {initialZones.map((z) => {
                      const fill = Math.round((z.occupancy / z.capacity) * 100);
                      const badge = z.densityColor === "RED" ? "🔴" : z.densityColor === "YELLOW" ? "🟡" : "🟢";
                      return (
                        <option key={z.id} value={z.id}>
                          {badge} {z.name} ({fill}% full)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Accessibility Checkboxes */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-slate-300 mb-1">Accessibility Options</legend>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="step-free-check"
                      checked={needStepFree}
                      onChange={(e) => setNeedStepFree(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">
                      ♿ {tr.needStepFreeAccess}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="sensory-check"
                      checked={needSensory}
                      onChange={(e) => setNeedSensory(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">
                      🧘 {tr.needSensoryFriendly}
                    </span>
                  </label>
                </fieldset>

                {/* Validation Error */}
                {navError && (
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300" role="alert">
                    ⚠️ {navError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={navLoading || !selectedGateId || !selectedZoneId}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 text-sm transition-all duration-200 shadow-lg shadow-sky-600/20 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label={navLoading ? tr.gettingDirections : tr.getDirections}
                >
                  {navLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                      {tr.gettingDirections}
                    </span>
                  ) : (
                    `🧭 ${tr.getDirections}`
                  )}
                </button>
              </form>
            </div>

            {/* ── DIRECTIONS RESULT CARD ────────────────────────────────────── */}
            <div
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm flex flex-col gap-4"
              aria-live="polite"
              aria-label="Navigation directions result"
            >
              {!navResult && !navLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center gap-3">
                  <span className="text-4xl" aria-hidden="true">🧭</span>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Select your entry gate and destination section, then click <strong className="text-slate-300">Get Directions</strong> for your personalized AI-powered route.
                  </p>
                </div>
              )}

              {navLoading && (
                <div className="space-y-3 animate-pulse" role="status" aria-label="Loading directions">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-5/6" />
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-4 bg-slate-800 rounded w-4/5" />
                </div>
              )}

              {navResult && (
                <div className="space-y-5">
                  {/* Travel Time Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-1.5">
                      <span className="text-sky-400 font-bold text-lg">{navResult.estimatedTravelTimeMinutes}</span>
                      <span className="text-sky-300 text-sm">{tr.minutes}</span>
                    </div>
                    <span className="text-xs text-slate-400">{tr.estimatedWalkTime}</span>
                  </div>

                  {/* Step-by-step Directions */}
                  <ol className="space-y-3" aria-label="Step-by-step route directions">
                    {navResult.routeSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold"
                          aria-label={`Step ${idx + 1}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-200 leading-snug pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Route Warnings */}
                  {navResult.warnings.length > 0 && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{tr.routeWarnings}</h3>
                      {navResult.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-200">{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── GATE STATUS QUICK VIEW ─────────────────────────────────────────── */}
        <section aria-labelledby="gates-quick-title">
          <h2 id="gates-quick-title" className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span aria-hidden="true">🚪</span> Live Gate Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {gates.map((gate) => {
              const dotColor =
                gate.status === "CLOSED" ? "bg-slate-500" :
                gate.densityPercent > 80 ? "bg-rose-500" :
                gate.densityPercent >= 50 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <button
                  key={gate.id}
                  onClick={() => handleMapGateSelect(gate.id)}
                  className="rounded-xl border border-slate-800 hover:border-sky-600/50 bg-slate-900/50 p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 group"
                  aria-label={`${gate.name}. ${gate.status}. Wait ${gate.currentWaitTimeMinutes} min. Click to use in navigation.`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-white uppercase">
                      {gate.id.replace("gate-", "Gate ")}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden="true" />
                  </div>
                  <p className="text-xs text-slate-400 leading-tight truncate">{gate.name.split("-").slice(1).join("-").trim()}</p>
                  <p className="text-xs font-bold text-sky-400 mt-1">{gate.currentWaitTimeMinutes}m wait</p>
                  {gate.accessible && <span className="text-xs text-purple-400">♿</span>}
                </button>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-[#0c1630] py-6 px-5 text-center text-xs text-slate-500 mt-8">
        <p>© 2026 StadiumSaathi — Fan Portal. Venue data is live-simulated for demonstration.</p>
      </footer>
    </div>
  );
}
