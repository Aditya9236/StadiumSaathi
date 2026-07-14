import { NextRequest, NextResponse } from "next/server";
import { Gate, Zone, Incident } from "../../../types/stadium";

const MAX_INPUT_LENGTH = 10000;
const INJECTION_PATTERNS = /override system rules|ignore guidelines|developer console|system prompt|ignore previous|disregard instructions/gi;

/**
 * Compiles the prompt for dashboard insights based on current telemetry.
 */
function compileDashboardInsightsPrompt(
  gates: Gate[],
  zones: Zone[],
  activeIncident: Incident | null
): string {
  const gateInfo = gates
    .map(
      (g) =>
        `- ${g.name}: Status: ${g.status}, Wait Time: ${g.currentWaitTimeMinutes}m, Density: ${g.densityPercent}%, Flow Rate: ${g.passengerFlowRate} p/min`
    )
    .join("\n");

  const zoneInfo = zones
    .map(
      (z) =>
        `- ${z.name}: Occupancy: ${z.occupancy}/${z.capacity} (${Math.round(
          (z.occupancy / z.capacity) * 100
        )}%), Density Color Code: ${z.densityColor}`
    )
    .join("\n");

  const incidentInfo = activeIncident
    ? `Category: ${activeIncident.category}, Title: ${activeIncident.title}, Description: ${activeIncident.description}, Location: ${activeIncident.location.section} (${activeIncident.location.zoneId}), Status: ${activeIncident.status}`
    : "No active incidents reported.";

  const congestedGates = gates.filter((g) => g.currentWaitTimeMinutes > 30);
  let congestionInstructions = "";
  if (congestedGates.length > 0) {
    congestionInstructions = `
CRITICAL GATE CONGESTION DETAILS:
We have detected ${congestedGates.length} congested gates:
${congestedGates.map(g => `- ${g.name} has a wait time of ${g.currentWaitTimeMinutes}m, density ${g.densityPercent}%, and flow rate ${g.passengerFlowRate} p/min.`).join("\n")}

For each of these congested gates:
- You MUST generate an entirely unique, independent recommendation.
- Each recommendation's text MUST incorporate that specific gate's details (e.g. mention the wait time, density, or flow rate) and redirect to a DIFFERENT less congested gate (e.g. if you recommend diverting Gate B to Gate D, recommend diverting Gate C to Gate E or Gate A).
- NEVER use the exact same recommendation or redirection target text for multiple gates. The text MUST be contextually unique.
`;
  }

  return `
You are StadiumSaathi, the intelligent operational AI system for the FIFA World Cup 2026.
Analyze the following stadium live telemetry and provide structured operations insights.

--- LIVE TELEMETRY STATE ---

GATES:
${gateInfo}

STANDS & ZONES:
${zoneInfo}

ACTIVE INCIDENTS:
${incidentInfo}
${congestionInstructions}

--- INSTRUCTIONS ---
1. Identify any critical bottlenecks (e.g. gates with wait time > 30 mins, zones with > 85% occupancy, or critical incidents).
2. Recommend concrete actions:
   - For each entry bottleneck, provide a custom, independent recommendation based on its specific location and telemetry. Do not repeat the exact same redirection target for all congested gates. Dynamically identify and suggest the best adjacent or lower-wait gate for redirection.
   - Staff deployment (e.g. security dispatch, facility cleaning, medical readiness).
3. Include a small positive sustainability observation or tip based on gate/zone crowd flows or transit availability.
4. Keep all descriptions concise, professional, and operational.
5. Return the response strictly as valid JSON matching this schema:
{
  "criticalAlerts": ["Alert 1...", "Alert 2..."],
  "bottlenecks": [
    {
      "location": "string",
      "issue": "string",
      "recommendation": "string"
    }
  ],
  "staffingAdvice": ["Advice 1...", "Advice 2..."],
  "sustainabilityTip": "string"
}

Do not include any markdown backticks or explanation text outside the JSON structure.
`;
}

/**
 * Finds the open gate with the lowest queue time to suggest as redirection.
 */
function findBestAlternateGate(gates: Gate[], currentGateId: string, excludedGateIds: Set<string> = new Set()): Gate {
  const candidates = gates.filter(
    (g) => g.status === "OPEN" && g.id !== currentGateId && g.id !== "gate-f" && !excludedGateIds.has(g.id)
  );
  if (candidates.length === 0) {
    // If all candidates are excluded, try without exclusion check
    const backupCandidates = gates.filter(
      (g) => g.status === "OPEN" && g.id !== currentGateId && g.id !== "gate-f"
    );
    if (backupCandidates.length === 0) {
      return gates.find((g) => g.id === "gate-d") || gates[0];
    }
    backupCandidates.sort((a, b) => a.currentWaitTimeMinutes - b.currentWaitTimeMinutes);
    return backupCandidates[0];
  }
  candidates.sort((a, b) => a.currentWaitTimeMinutes - b.currentWaitTimeMinutes);
  return candidates[0];
}

/**
 * Fallback static insights based on typical stadium telemetry values.
 */
function getStaticFallbackInsights(gates: Gate[], zones: Zone[], activeIncident: Incident | null) {
  const alerts: string[] = [];
  const bottlenecks: { location: string; issue: string; recommendation: string }[] = [];
  const staffing: string[] = [];

  // Check gates
  const excluded = new Set<string>();
  gates.forEach((g) => {
    if (g.currentWaitTimeMinutes > 30) {
      const altGate = findBestAlternateGate(gates, g.id, excluded);
      excluded.add(altGate.id);
      bottlenecks.push({
        location: g.name,
        issue: `Wait times have reached ${g.currentWaitTimeMinutes} minutes due to high flow density (${g.densityPercent}%).`,
        recommendation: `Diverting traffic from ${g.name} is recommended. Redirect incoming guests to ${altGate.name} (approx. ${altGate.currentWaitTimeMinutes} min wait time, currently running at ${altGate.densityPercent}% density).`,
      });
    }
  });

  // Check zones
  zones.forEach((z) => {
    const fillPercent = Math.round((z.occupancy / z.capacity) * 100);
    if (fillPercent >= 85) {
      alerts.push(`High occupancy warning in ${z.name} (${fillPercent}% capacity).`);
      staffing.push(`Deploy additional security personnel to ${z.name} to monitor flow at exit portals.`);
    }
  });

  // Check incidents
  if (activeIncident) {
    alerts.push(`Active Incident: ${activeIncident.title} (Status: ${activeIncident.status})`);
    if (activeIncident.status === "REPORTED") {
      staffing.push(`Action Required: Dispatch staff to ${activeIncident.location.section} immediately.`);
    }
  }

  // Default fallback items if nothing is critical
  if (bottlenecks.length === 0) {
    bottlenecks.push({
      location: "General Entryways",
      issue: "Flow rates are currently stable across all operational perimeter gates.",
      recommendation: "Maintain standard operations and gate monitoring.",
    });
  }
  if (staffing.length === 0) {
    staffing.push("Current staffing levels are optimal for all active stadium stands.");
  }

  return {
    mode: "fallback",
    criticalAlerts: alerts,
    bottlenecks,
    staffingAdvice: staffing,
    sustainabilityTip: "Encourage fans exiting near Gate A to board the Downtown Express Shuttle to optimize transit efficiency and maximize CO2 reduction.",
  };
}

// ─── POST /api/dashboard-insights ────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gates, zones, activeIncident } = body;

    if (!gates || !zones) {
      return NextResponse.json(
        { error: "Missing gates or zones telemetry data in request." },
        { status: 400 }
      );
    }

    // Input sanitization / validation
    const stringified = JSON.stringify(body);
    if (stringified.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: "Payload exceeds size limits." },
        { status: 400 }
      );
    }
    if (INJECTION_PATTERNS.test(stringified)) {
      return NextResponse.json(
        { error: "Input contains disallowed patterns." },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      console.log("[API/dashboard-insights] Fallback mode active: Using static rule-based analysis (No API key found).");
      return NextResponse.json(getStaticFallbackInsights(gates, zones, activeIncident));
    }

    console.log("[API/dashboard-insights] Live mode active: Calling Gemini API for insights.");

    const prompt = compileDashboardInsightsPrompt(gates, zones, activeIncident);

    // Call Gemini API
    const fetchUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    };

    const geminiResponse = await fetch(
      fetchUrl,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text().catch(() => "Unable to read error body");
      console.error("Gemini API error in dashboard insights:", geminiResponse.status, errorBody);
      console.log("[API/dashboard-insights] Fallback mode active: Gemini API returned error status.");
      return NextResponse.json(getStaticFallbackInsights(gates, zones, activeIncident));
    }

    const geminiData = await geminiResponse.json();
    const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.log("[API/dashboard-insights] Fallback mode active: Gemini returned empty content.");
      return NextResponse.json(getStaticFallbackInsights(gates, zones, activeIncident));
    }

    // Parse JSON
    try {
      const cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        mode: "live",
        criticalAlerts: parsed.criticalAlerts || [],
        bottlenecks: parsed.bottlenecks || [],
        staffingAdvice: parsed.staffingAdvice || [],
        sustainabilityTip: parsed.sustainabilityTip || "",
      });
    } catch {
      console.log("[API/dashboard-insights] Fallback mode active: Failed to parse Gemini JSON output.");
      return NextResponse.json(getStaticFallbackInsights(gates, zones, activeIncident));
    }
  } catch (err) {
    console.error("Error generating dashboard insights:", err);
    return NextResponse.json(
      { error: "Failed to generate dashboard insights." },
      { status: 500 }
    );
  }
}
