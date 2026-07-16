import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimiter";
import {
   initialGates,
   initialZones,
 } from "../../../data/stadiumData";

const MAX_INPUT_LENGTH = 500;

/**
 * Regex filter for common prompt injection tokens.
 */
const INJECTION_PATTERNS = /override system rules|ignore guidelines|developer console|system prompt|ignore previous|disregard instructions/gi;

/**
 * Compiles a navigation-specific prompt with telemetry context.
 */
function compileNavigationPrompt(
  sourceGateId: string,
  destinationZoneId: string,
  stepFreeRequired: boolean,
  sensorySafeRequired: boolean,
  locale: string
): string {
  const sourceGate = initialGates.find((g) => g.id === sourceGateId);
  const targetZone = initialZones.find((z) => z.id === destinationZoneId);

  const accessibilityConstraint = stepFreeRequired
    ? "REQUIREMENT: The path MUST be step-free. Do not suggest stairs or escalators. Guide them through elevators and ramps only."
    : "Standard routes allowed.";

  const sensoryConstraint = sensorySafeRequired
    ? "REQUIREMENT: Avoid noisy or visually overwhelming routes. Prefer quiet corridors and sensory rooms when possible."
    : "";

  return `
You are StadiumSaathi, the official, highly accessible AI Navigation Advisor for the FIFA World Cup 2026.
You generate structured step-by-step navigation instructions.

--- VENUE CONTEXT & TELEMETRY ---
Source Gate: ${sourceGate ? `${sourceGate.name} (Wait time: ${sourceGate.currentWaitTimeMinutes} mins, Density: ${sourceGate.densityPercent}%)` : "Unknown Gate"}
Destination Zone: ${targetZone ? `${targetZone.name} (Occupancy: ${targetZone.occupancy}/${targetZone.capacity}, Status: ${targetZone.densityColor})` : "Unknown Zone"}
Locale: "${locale}"

ACCESSIBILITY MODE:
${accessibilityConstraint}
${sensoryConstraint}

--- SYSTEM DIRECTIONS ---
1. Analyze the wait times and zone density. If there is congestion, add a warnings entry.
2. Provide a list of 3-5 logical, step-by-step directions to walk from the Source Gate to the Destination Zone.
3. Keep each step brief and clear. Do not speak in conversational dialogue.
4. Translate all directions and labels completely to locale "${locale}".
5. Estimate a total travel time in minutes.

Return your response as valid JSON with this exact schema:
{
  "routeSteps": ["Step 1...", "Step 2...", ...],
  "estimatedTravelTimeMinutes": <number>,
  "warnings": ["Warning 1...", ...]
}

Return ONLY the JSON. No markdown fences, no explanation text.
`;
}

/**
 * Fallback static response when Gemini API is unavailable.
 */
function getStaticFallback(locale: string) {
  const steps: Record<string, string[]> = {
    en: [
      "Enter through the designated gate and proceed past security.",
      "Follow the main concourse signs toward your zone.",
      "Use Elevator 3 (near Concourse B) to reach Level 2 if step-free access is needed.",
      "Continue along the corridor and follow section markers.",
      "Arrive at your designated seating area."
    ],
    es: [
      "Entre por la puerta designada y pase por seguridad.",
      "Siga las señales del pasillo principal hacia su zona.",
      "Use el ascensor 3 (cerca del Convestíbulo B) para llegar al Nivel 2 si necesita acceso sin escalones.",
      "Continúe por el pasillo y siga los marcadores de sección.",
      "Llegue a su área de asientos designada."
    ],
    fr: [
      "Entrez par la porte désignée et passez la sécurité.",
      "Suivez les panneaux du hall principal vers votre zone.",
      "Utilisez l'ascenseur 3 (près du Hall B) pour accéder au Niveau 2 si un accès sans marches est nécessaire.",
      "Continuez le long du couloir et suivez les marqueurs de section.",
      "Arrivez à votre zone de sièges désignée."
    ],
  };

  return {
    routeSteps: steps[locale] || steps["en"],
    estimatedTravelTimeMinutes: 8,
    warnings: locale === "en"
      ? ["Static fallback routing — AI service unavailable."]
      : locale === "es"
      ? ["Ruta estática de respaldo — servicio de IA no disponible."]
      : ["Routage statique de secours — service IA indisponible."],
  };
}

// ─── POST /api/ai-recommendation ─────────────────────────────────────────
//
// Security measures applied to this route:
//   1. Rate limiting  — max 10 requests per minute per client IP (in-memory
//      sliding-window via src/lib/rateLimiter.ts). Returns HTTP 429 when exceeded.
//   2. Payload size   — combined inputs are rejected when they exceed MAX_INPUT_LENGTH,
//      preventing oversized payload attacks.
//   3. Injection guard — INJECTION_PATTERNS regex blocks common prompt-injection
//      tokens in the inputs.
//   4. Server-side key — GEMINI_API_KEY is read from process.env and never
//      forwarded to the client.

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
    const { sourceGateId, destinationZoneId, stepFreeRequired, sensorySafeRequired, locale } = body;

    // Validate required fields
    if (!sourceGateId || !destinationZoneId || !locale) {
      return NextResponse.json(
        { error: "Missing required fields: sourceGateId, destinationZoneId, locale." },
        { status: 400 }
      );
    }

    // Input sanitization
    const combinedInput = `${sourceGateId}${destinationZoneId}${locale}`;
    if (combinedInput.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: "Input parameters exceed maximum allowed length." },
        { status: 400 }
      );
    }
    if (INJECTION_PATTERNS.test(combinedInput)) {
      return NextResponse.json(
        { error: "Input contains disallowed patterns." },
        { status: 400 }
      );
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      // Return static fallback
      return NextResponse.json(getStaticFallback(locale || "en"));
    }

    // Compile prompt
    const prompt = compileNavigationPrompt(
      sourceGateId,
      destinationZoneId,
      stepFreeRequired ?? false,
      sensorySafeRequired ?? false,
      locale
    );

    // Call Gemini API — key sent via header, never exposed to client
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiResponse.status);
      return NextResponse.json(getStaticFallback(locale || "en"));
    }

    const geminiData = await geminiResponse.json();
    const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(getStaticFallback(locale || "en"));
    }

    // Parse JSON from Gemini response
    try {
      // Strip markdown code fences if present
      const cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        routeSteps: parsed.routeSteps || [],
        estimatedTravelTimeMinutes: parsed.estimatedTravelTimeMinutes || 10,
        warnings: parsed.warnings || [],
      });
    } catch {
      // If parsing fails, wrap the raw text as a single step
      return NextResponse.json({
        routeSteps: [textContent],
        estimatedTravelTimeMinutes: 10,
        warnings: ["AI response was not structured. Displaying raw directions."],
      });
    }
  } catch {
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Returning default static routing." },
      { status: 500 }
    );
  }
}
