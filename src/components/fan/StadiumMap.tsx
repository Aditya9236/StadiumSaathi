"use client";

import React, { useState } from "react";
import { Gate } from "../../types/stadium";
import { StadiumPOI, stadiumPOIs } from "../../data/stadiumData";

interface StadiumMapProps {
  gates: Gate[];
  stepFreeMode: boolean;
  onNavigateToGate?: (gateId: string) => void;
}

type POIFilter = "CONCESSION" | "RESTROOM" | "FIRST_AID" | "SENSORY_ROOM";

const FILTER_CONFIG: { key: POIFilter; label: string; icon: string; color: string }[] = [
  { key: "CONCESSION", label: "Concessions", icon: "🍔", color: "#f59e0b" },
  { key: "RESTROOM", label: "Restrooms", icon: "🚻", color: "#3b82f6" },
  { key: "FIRST_AID", label: "First Aid", icon: "🏥", color: "#ef4444" },
  { key: "SENSORY_ROOM", label: "Sensory Rooms", icon: "🧘", color: "#a855f7" },
];

/**
 * Gets the density color for a gate.
 */
function gateColor(gate: Gate): string {
  if (gate.status === "CLOSED") return "#64748b";
  if (gate.densityPercent > 80) return "#ef4444";
  if (gate.densityPercent >= 50) return "#f59e0b";
  return "#22c55e";
}

/**
 * Interactive SVG Stadium Map component.
 * Renders gate pins, POI icons, route paths, and filter toggles.
 * All interactive elements are keyboard-accessible buttons.
 */
export const StadiumMap = React.memo<StadiumMapProps>(({ gates, stepFreeMode, onNavigateToGate }) => {
  const [activeFilters, setActiveFilters] = useState<Set<POIFilter>>(
    new Set(["CONCESSION", "RESTROOM", "FIRST_AID", "SENSORY_ROOM"])
  );
  const [hoveredGate, setHoveredGate] = useState<string | null>(null);
  const [hoveredPOI, setHoveredPOI] = useState<string | null>(null);

  const toggleFilter = (filter: POIFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const visiblePOIs = stadiumPOIs.filter((p) => activeFilters.has(p.category));
  // In step-free mode, hide non-accessible POIs
  const filteredPOIs = stepFreeMode ? visiblePOIs.filter((p) => p.accessible) : visiblePOIs;

  const poiIconMap: Record<string, string> = {
    CONCESSION: "🍔",
    RESTROOM: "🚻",
    FIRST_AID: "🏥",
    SENSORY_ROOM: "🧘",
  };

  return (
    <div className="space-y-4">
      {/* Layer Filter Toggles */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Map layer filters">
        {FILTER_CONFIG.map((f) => {
          const isActive = activeFilters.has(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                isActive
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-slate-700 text-slate-500"
              }`}
              aria-pressed={isActive}
              aria-label={`${isActive ? "Hide" : "Show"} ${f.label} on map`}
            >
              <span aria-hidden="true">{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Step-Free indicator */}
      {stepFreeMode && (
        <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs text-purple-300 font-medium" aria-live="polite">
          ♿ Step-Free Mode Active — Only accessible pathways and facilities are displayed. Elevator routes highlighted.
        </div>
      )}

      {/* SVG Map */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <svg
          viewBox="0 0 540 620"
          className="w-full h-auto"
          role="img"
          aria-label="Interactive stadium floor plan showing gates, concessions, restrooms, first-aid, and sensory rooms"
        >
          {/* Stadium outline — oval bowl */}
          <ellipse cx="270" cy="310" rx="245" ry="275" fill="none" stroke="#1e293b" strokeWidth="3" />
          <ellipse cx="270" cy="310" rx="200" ry="230" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

          {/* Field rectangle */}
          <rect x="170" y="210" width="200" height="200" rx="12" fill="#064e3b" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />
          <text x="270" y="315" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="bold" opacity="0.5">PITCH</text>

          {/* Zone Labels around the bowl */}
          <text x="270" y="165" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">NORTH STANDS</text>
          <text x="270" y="475" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">SOUTH STANDS</text>
          <text x="60" y="315" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" transform="rotate(-90, 60, 315)">WEST</text>
          <text x="480" y="315" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" transform="rotate(90, 480, 315)">EAST</text>

          {/* Step-free elevator routes (shown only in step-free mode) */}
          {stepFreeMode && (
            <g opacity="0.7">
              {/* Elevator indicators */}
              <rect x="120" y="180" width="30" height="30" rx="6" fill="#7c3aed" opacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
              <text x="135" y="200" textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="bold">ELV 1</text>

              <rect x="390" y="180" width="30" height="30" rx="6" fill="#7c3aed" opacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
              <text x="405" y="200" textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="bold">ELV 2</text>

              <rect x="120" y="420" width="30" height="30" rx="6" fill="#7c3aed" opacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
              <text x="135" y="440" textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="bold">ELV 3</text>

              <rect x="390" y="420" width="30" height="30" rx="6" fill="#7c3aed" opacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
              <text x="405" y="440" textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="bold">ELV 4</text>

              {/* Ramp path indicators */}
              <line x1="135" y1="210" x2="170" y2="260" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="405" y1="210" x2="370" y2="260" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="135" y1="420" x2="170" y2="370" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="405" y1="420" x2="370" y2="370" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,3" />
            </g>
          )}

          {/* POI markers */}
          {filteredPOIs.map((poi: StadiumPOI) => (
            <g
              key={poi.id}
              onMouseEnter={() => setHoveredPOI(poi.id)}
              onMouseLeave={() => setHoveredPOI(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={poi.coordinates.x}
                cy={poi.coordinates.y}
                r="10"
                fill={
                  poi.category === "CONCESSION" ? "#78350f"
                  : poi.category === "RESTROOM" ? "#1e3a5f"
                  : poi.category === "FIRST_AID" ? "#7f1d1d"
                  : "#4c1d95"
                }
                stroke={
                  poi.category === "CONCESSION" ? "#f59e0b"
                  : poi.category === "RESTROOM" ? "#3b82f6"
                  : poi.category === "FIRST_AID" ? "#ef4444"
                  : "#a855f7"
                }
                strokeWidth="1.5"
                opacity="0.85"
              />
              <text
                x={poi.coordinates.x}
                y={poi.coordinates.y + 4}
                textAnchor="middle"
                fontSize="10"
                aria-hidden="true"
              >
                {poiIconMap[poi.category]}
              </text>

              {/* POI tooltip */}
              {hoveredPOI === poi.id && (
                <g>
                  <rect
                    x={poi.coordinates.x - 80}
                    y={poi.coordinates.y - 50}
                    width="160"
                    height="38"
                    rx="6"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text x={poi.coordinates.x} y={poi.coordinates.y - 35} textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold">
                    {poi.name}
                  </text>
                  <text x={poi.coordinates.x} y={poi.coordinates.y - 22} textAnchor="middle" fill="#94a3b8" fontSize="8">
                    {poi.status}{poi.accessible ? " • ♿" : ""}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Gate markers */}
          {gates.map((gate) => {
            const color = gateColor(gate);
            const isHovered = hoveredGate === gate.id;

            return (
              <g
                key={gate.id}
                onMouseEnter={() => setHoveredGate(gate.id)}
                onMouseLeave={() => setHoveredGate(null)}
                onClick={() => onNavigateToGate?.(gate.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onNavigateToGate?.(gate.id); }}
                tabIndex={0}
                role="button"
                aria-label={`${gate.name}. Status: ${gate.status}. Wait: ${gate.currentWaitTimeMinutes} min. Density: ${gate.densityPercent}%. ${gate.accessible ? "Accessible." : "Not step-free accessible."} Click to navigate.`}
                style={{ cursor: "pointer", outline: "none" }}
                className="focus:outline-none"
              >
                {/* Pulse ring for congested gates */}
                {gate.densityPercent > 80 && (
                  <circle
                    cx={gate.coordinates.x}
                    cy={gate.coordinates.y}
                    r="18"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.4"
                  >
                    <animate attributeName="r" from="14" to="22" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Main pin */}
                <circle
                  cx={gate.coordinates.x}
                  cy={gate.coordinates.y}
                  r={isHovered ? "15" : "13"}
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  opacity="0.9"
                  style={{ transition: "r 0.2s" }}
                />
                <text
                  x={gate.coordinates.x}
                  y={gate.coordinates.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {gate.id.replace("gate-", "").toUpperCase()}
                </text>

                {/* Accessible badge */}
                {gate.accessible && stepFreeMode && (
                  <text
                    x={gate.coordinates.x + 16}
                    y={gate.coordinates.y - 10}
                    fontSize="10"
                    aria-hidden="true"
                  >
                    ♿
                  </text>
                )}

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={gate.coordinates.x - 95}
                      y={gate.coordinates.y - 65}
                      width="190"
                      height="48"
                      rx="8"
                      fill="#0f172a"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <text x={gate.coordinates.x} y={gate.coordinates.y - 48} textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold">
                      {gate.name}
                    </text>
                    <text x={gate.coordinates.x} y={gate.coordinates.y - 34} textAnchor="middle" fill="#94a3b8" fontSize="9">
                      Wait: {gate.currentWaitTimeMinutes}min • Density: {gate.densityPercent}% • {gate.accessible ? "♿ Accessible" : "No step-free"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" /> Low Density</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" aria-hidden="true" /> Moderate</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" aria-hidden="true" /> Congested</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-500 inline-block" aria-hidden="true" /> Closed</span>
        {stepFreeMode && <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block" aria-hidden="true" /> Elevator / Ramp</span>}
      </div>
    </div>
  );
});

StadiumMap.displayName = "StadiumMap";

