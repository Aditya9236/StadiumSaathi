import { NextRequest, NextResponse } from "next/server";
import { Gate, Zone, Incident } from "../../../types/stadium";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimiter";

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
You are StadiumSaathi, the official AI Stadium Operations Manager for the FIFA World Cup 2026.
Analyze the following stadium live telemetry and provide structured operations insights and recommendations covering Crowd Management, Smart Navigation, Accessibility, Transportation, Sustainability, Multilingual support, and Safety.

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
2. Recommend concrete actions.
3. Include a small positive sustainability observation or tip based on gate/zone crowd flows or transit availability.
4. Keep all descriptions concise, professional, and operational.
5. Return the response strictly as valid JSON matching this schema:
{
  "criticalAlerts": ["Alert 1...", "Alert 2..."],
  "recommendations": [
    {
      "title": "string (Short descriptive title of the issue/area)",
      "recommendedAction": "string (The concrete operational action)",
      "reasoning": "string (Data-backed explanation)",
      "priorityLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "confidenceScore": number (An integer from 0 to 100 representing confidence in this response),
      "operationalImpact": "string (Expected operational outcome/KPI impact)",
      "suggestedNextSteps": ["string (Actionable next step task 1)", "string (Actionable next step task 2)", ...]
    }
  ],
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
  const recommendations: any[] = [];

  // Check gates
  const excluded = new Set<string>();
  gates.forEach((g) => {
    if (g.currentWaitTimeMinutes > 30) {
      const altGate = findBestAlternateGate(gates, g.id, excluded);
      excluded.add(altGate.id);
      recommendations.push({
        title: `Gate Congestion: ${g.name}`,
        recommendedAction: `Redirect incoming fans from ${g.name} to ${altGate.name}.`,
        reasoning: `${g.name} has exceeded a 30-minute queue wait time (${g.currentWaitTimeMinutes} mins) with a density of ${g.densityPercent}%. ${altGate.name} is currently underutilized at ${altGate.currentWaitTimeMinutes} min wait.`,
        priorityLevel: "HIGH",
        confidenceScore: 92,
        operationalImpact: "Distributes gate arrival load and decreases overall stadium entry queue times.",
        suggestedNextSteps: [
          `Update electronic signage at North Plaza directing fans to ${altGate.name}.`,
          `Dispatch mobile staff volunteers to point-of-diversion to guide arriving fans.`,
          `Trigger multilingual app notification for tickets entering through ${g.name}.`
        ]
      });
    }
  });

  // Check zones
  zones.forEach((z) => {
    const fillPercent = Math.round((z.occupancy / z.capacity) * 100);
    if (fillPercent >= 85) {
      alerts.push(`High occupancy warning in ${z.name} (${fillPercent}% capacity).`);
      recommendations.push({
        title: `Zone Crowd Density: ${z.name}`,
        recommendedAction: `Deploy extra crowd control staff to ${z.name} exit gates.`,
        reasoning: `${z.name} is running at ${fillPercent}% capacity. Crowd density is classified as RED.`,
        priorityLevel: "CRITICAL",
        confidenceScore: 95,
        operationalImpact: "Prevents bottlenecks at exit concourses and guarantees clear evacuation routes.",
        suggestedNextSteps: [
          `Deploy 4 additional safety stewards to exit gates of ${z.name}.`,
          `Keep all secondary egress gates in ${z.name} unlocked and monitored.`,
          `Review zone video feeds from Operations room.`
        ]
      });
    }
  });

  // Check incidents
  if (activeIncident) {
    alerts.push(`Active Incident: ${activeIncident.title} (Status: ${activeIncident.status})`);
    if (activeIncident.status === "REPORTED") {
      recommendations.push({
        title: `Unresolved Incident: ${activeIncident.title}`,
        recommendedAction: `Immediately dispatch first response team to ${activeIncident.location.section}.`,
        reasoning: `An incident categorized as ${activeIncident.category} with severity ${activeIncident.severity} has been logged at ${activeIncident.location.section}. No responder is currently dispatched.`,
        priorityLevel: activeIncident.severity === "CRITICAL" ? "CRITICAL" : activeIncident.severity === "HIGH" ? "HIGH" : "MEDIUM",
        confidenceScore: 98,
        operationalImpact: "Ensures immediate incident resolution and maintains zone safety.",
        suggestedNextSteps: [
          `Dispatch closest ${activeIncident.category.toLowerCase()} responder to ${activeIncident.location.section}.`,
          `Monitor responder response time through the control board.`,
          `Acknowledge and mark incident as DISPATCHED.`
        ]
      });
    }
  }

  // Default fallback items if nothing is critical
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Stable Stadium Operations",
      recommendedAction: "Maintain standard monitoring parameters across all perimeter gates.",
      reasoning: "All sensor readings for gate queues and zone capacities are within safe bounds.",
      priorityLevel: "LOW",
      confidenceScore: 99,
      operationalImpact: "Ensures steady, continuous flow of stadium entry and seating.",
      suggestedNextSteps: [
        "Continue real-time telemetry feed polling.",
        "Perform scheduled staff check-ins."
      ]
    });
  }

  return {
    mode: "fallback",
    criticalAlerts: alerts,
    recommendations,
    sustainabilityTip: "Encourage fans exiting near Gate A to board the Downtown Express Shuttle to optimize transit efficiency and maximize CO2 reduction.",
  };
}

// ─── POST /api/dashboard-insights ────────────────────────────────────────
//
// Security measures applied to this route:
//   1. Rate limiting  — max 10 requests per minute per client IP (in-memory
//      sliding-window via src/lib/rateLimiter.ts). Returns HTTP 429 when exceeded.
//   2. Payload size   — payload is rejected when JSON body exceeds MAX_INPUT_LENGTH
//      characters, preventing oversized request attacks.
//   3. Injection guard — INJECTION_PATTERNS regex blocks common prompt-injection
//      tokens (e.g. "ignore previous instructions") in the telemetry payload.
//   4. Server-side key — GEMINI_API_KEY is read from process.env and never
//      forwarded to the client response.

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
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
        recommendations: parsed.recommendations || [],
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
