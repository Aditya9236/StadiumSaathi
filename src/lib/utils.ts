/**
 * StadiumSaathi — Core Utility Functions
 *
 * Pure, side-effect-free functions extracted from the dashboard and data layers.
 * Placing logic here keeps it independently testable without importing React or
 * Next.js server-only modules.
 */

// ─── Crowd Density Thresholds ─────────────────────────────────────────────

/** Occupancy ratio at which a zone transitions from GREEN to YELLOW. */
export const DENSITY_YELLOW_THRESHOLD = 0.5;

/** Occupancy ratio at which a zone transitions from YELLOW to RED. */
export const DENSITY_RED_THRESHOLD = 0.85;

/**
 * Returns the density color status for a zone based on occupancy ratio.
 *
 * Thresholds (matching `simulateTelemetryUpdate` in stadiumData.ts):
 *   - ratio >= 0.85 → "RED"   (critical — near capacity)
 *   - ratio >= 0.50 → "YELLOW" (moderate — monitor closely)
 *   - ratio <  0.50 → "GREEN"  (safe — normal flow)
 *
 * @param occupancy - Current fan count in the zone.
 * @param capacity  - Maximum safe capacity of the zone.
 * @returns The density color code.
 */
export function getCrowdDensityStatus(
  occupancy: number,
  capacity: number
): "GREEN" | "YELLOW" | "RED" {
  if (capacity <= 0) return "GREEN";
  const ratio = occupancy / capacity;
  if (ratio >= DENSITY_RED_THRESHOLD) return "RED";
  if (ratio >= DENSITY_YELLOW_THRESHOLD) return "YELLOW";
  return "GREEN";
}

// ─── Gate Capacity Percentage ─────────────────────────────────────────────

/**
 * Calculates the gate capacity utilisation as a percentage (0–100), clamped
 * and rounded to the nearest integer.
 *
 * @param densityPercent - Raw density value (0–100) from the gate telemetry.
 * @returns An integer percentage in the range [0, 100].
 */
export function getGateCapacityPercent(densityPercent: number): number {
  return Math.round(Math.max(0, Math.min(100, densityPercent)));
}

// ─── Incident Severity Classification ────────────────────────────────────

/**
 * Derives a human-readable urgency label from an incident severity level.
 *
 * Classification map:
 *   - "CRITICAL" → "Immediate response required"
 *   - "HIGH"     → "Urgent attention needed"
 *   - "MEDIUM"   → "Monitor and respond soon"
 *   - "LOW"      → "Low priority — log and review"
 *
 * @param severity - The incident severity string from the Incident type.
 * @returns A descriptive urgency label.
 */
export function classifyIncidentSeverity(
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
): string {
  const labels: Record<string, string> = {
    CRITICAL: "Immediate response required",
    HIGH: "Urgent attention needed",
    MEDIUM: "Monitor and respond soon",
    LOW: "Low priority — log and review",
  };
  return labels[severity] ?? "Unknown severity";
}

// ─── Broadcast Message Sanitization ──────────────────────────────────────

const MAX_BROADCAST_LENGTH = 300;
const SCRIPT_TAG_PATTERN = /<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;

/**
 * Sanitizes an emergency broadcast message before display or storage.
 *
 * Security measures:
 * - Strips all HTML/script tags to prevent XSS injection.
 * - Trims whitespace and enforces a maximum character length of 300.
 *
 * @param message - Raw user-supplied broadcast message.
 * @returns A sanitized, length-limited string.
 */
export function sanitizeBroadcastMessage(message: string): string {
  return message
    .replace(SCRIPT_TAG_PATTERN, "")
    .replace(HTML_TAG_PATTERN, "")
    .trim()
    .slice(0, MAX_BROADCAST_LENGTH);
}
