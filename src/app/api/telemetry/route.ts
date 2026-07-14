import { NextRequest, NextResponse } from "next/server";
import {
  initialGates,
  initialZones,
  initialTransitRoutes,
  initialSustainabilityStats,
  simulateTelemetryUpdate,
  simulateTransitUpdate,
  generateRandomIncident,
} from "../../../data/stadiumData";
import type { Gate, Zone, Incident, TransitRoute, SustainabilityStats } from "../../../types/stadium";

// ─── In-Memory Telemetry State ───────────────────────────────────────────
// Module-scoped state persists across requests within the same server process.

let gates: Gate[] = structuredClone(initialGates);
let zones: Zone[] = structuredClone(initialZones);
let transit: TransitRoute[] = structuredClone(initialTransitRoutes);
let sustainability: SustainabilityStats = { ...initialSustainabilityStats };
let incidents: Incident[] = [];
let lastTick = Date.now();

/**
 * Auto-advances telemetry if more than 10 seconds have elapsed since last tick.
 */
function tickIfNeeded() {
  const now = Date.now();
  if (now - lastTick >= 10_000) {
    const updated = simulateTelemetryUpdate(gates, zones);
    gates = updated.gates;
    zones = updated.zones;
    transit = simulateTransitUpdate(transit);

    // Fluctuate sustainability
    sustainability = {
      recycleKg: sustainability.recycleKg + Math.floor(Math.random() * 5),
      compostKg: sustainability.compostKg + Math.floor(Math.random() * 3),
      landfillKg: sustainability.landfillKg + Math.floor(Math.random() * 2),
      carbonOffsetTotalKg: sustainability.carbonOffsetTotalKg + Math.floor(Math.random() * 4),
      fanParticipationRate: Math.min(100, sustainability.fanParticipationRate + (Math.random() - 0.4) * 0.5),
    };

    lastTick = now;
  }
}

// ─── GET /api/telemetry ──────────────────────────────────────────────────

export async function GET() {
  tickIfNeeded();

  return NextResponse.json({
    gates,
    zones,
    incidents,
    transit,
    sustainability,
  });
}

// ─── POST /api/telemetry ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "SIMULATE_INCIDENT") {
      const newIncident = generateRandomIncident();

      // Optionally override with provided data
      if (body.category) newIncident.category = body.category;
      if (body.description) newIncident.description = body.description;
      if (body.zoneId) newIncident.location.zoneId = body.zoneId;

      incidents.push(newIncident);

      return NextResponse.json(
        { status: "success", incident: newIncident },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action parameter. Must be SIMULATE_INCIDENT." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

// ─── PATCH /api/telemetry ────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, incidentId, assignedStaffId } = body;

    if (action === "DISPATCH") {
      const incident = incidents.find((i) => i.id === incidentId);
      if (!incident) {
        return NextResponse.json(
          { error: `Incident ${incidentId} not found.` },
          { status: 404 }
        );
      }

      incident.status = "DISPATCHED";
      incident.dispatchedAt = new Date().toISOString();
      if (assignedStaffId) incident.assignedStaffId = assignedStaffId;

      return NextResponse.json({
        status: "success",
        incidentId: incident.id,
        newStatus: "DISPATCHED",
        dispatchedAt: incident.dispatchedAt,
      });
    }

    if (action === "RESOLVE") {
      const incident = incidents.find((i) => i.id === incidentId);
      if (!incident) {
        return NextResponse.json(
          { error: `Incident ${incidentId} not found.` },
          { status: 404 }
        );
      }

      incident.status = "RESOLVED";
      incident.resolvedAt = new Date().toISOString();

      return NextResponse.json({
        status: "success",
        incidentId: incident.id,
        newStatus: "RESOLVED",
        resolvedAt: incident.resolvedAt,
      });
    }

    return NextResponse.json(
      { error: "Invalid action parameter. Must be DISPATCH or RESOLVE." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
