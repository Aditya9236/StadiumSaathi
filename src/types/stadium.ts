/**
 * TypeScript Data Interfaces for StadiumSaathi
 * Aligned with docs/SRS.md specifications.
 */

/**
 * Represents a Stadium Gate entry point.
 */
export interface Gate {
  id: string; // e.g., "gate-a"
  name: string; // e.g., "Gate A - North Plaza"
  status: "OPEN" | "CLOSED" | "RESTRICTED";
  currentWaitTimeMinutes: number; // Simulated queue wait time
  passengerFlowRate: number; // People entering per minute
  accessible: boolean; // Is step-free accessible
  coordinates: { x: number; y: number }; // Plotting coordinates on SVG
  densityPercent: number; // Current crowd density percentage (0-100%)
}

/**
 * Represents a seating or concourse zone in the stadium.
 */
export interface Zone {
  id: string; // e.g., "zone-100"
  name: string; // e.g., "Lower Bowl North"
  occupancy: number; // Current count of fans
  capacity: number; // Max safe capacity
  densityColor: "GREEN" | "YELLOW" | "RED"; // Calculated bottleneck level
  stepFreeRoutesAvailable: boolean;
}

/**
 * Severity level of operational incidents.
 */
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Category of stadium incidents.
 */
export type IncidentCategory = "MEDICAL" | "SECURITY" | "FACILITY" | "CROWD" | "SUSTAINABILITY";

/**
 * Represents an operational incident tracked in the dashboard.
 */
export interface Incident {
  id: string; // Unique GUID/ID
  category: IncidentCategory;
  title: string; // e.g., "Water spill on concourse"
  description: string;
  severity: IncidentSeverity;
  status: "REPORTED" | "DISPATCHED" | "RESOLVED";
  location: {
    zoneId: string;
    section: string; // e.g., "Concourse 112, Row 15"
    coordinates: { x: number; y: number };
  };
  reportedAt: string; // Serialized date string for hydration safety
  dispatchedAt?: string;
  resolvedAt?: string;
  assignedStaffId?: string; // ID of staff assigned to resolve
}

/**
 * Represents a public transportation service servicing the venue.
 */
export interface TransitRoute {
  id: string; // e.g., "shuttle-red"
  name: string; // e.g., "Downtown Express Shuttle"
  type: "SHUTTLE" | "TRAIN" | "RIDESHARE" | "BUS";
  closestGateId: string; // Connected gate
  nextDepartureMinutes: number; // ETA
  delayMinutes: number; // Status
  status: "ON_TIME" | "DELAYED" | "SUSPENDED";
  carbonOffsetKg: number; // Saved carbon per rider compared to driving
}

/**
 * Sustainability statistics generated on match-day.
 */
export interface SustainabilityStats {
  recycleKg: number;
  compostKg: number;
  landfillKg: number;
  carbonOffsetTotalKg: number;
  fanParticipationRate: number; // Percentage of fans logged sorting correctly
}

/**
 * Request payload for the Structured Navigation Advisor.
 */
export interface NavigationRequest {
  sourceGateId: string;
  destinationZoneId: string;
  stepFreeRequired: boolean;
  sensorySafeRequired: boolean;
  locale: "en" | "es" | "fr";
}

/**
 * Structured response from the Navigation Advisor.
 */
export interface NavigationResponse {
  routeSteps: string[]; // Steps e.g. ["Walk through Gate A", "Use Elevator 2 to Level 1"]
  estimatedTravelTimeMinutes: number;
  warnings: string[]; // e.g. ["Crowd congestion near Section 112"]
}

/**
 * Translation payload for input strings.
 */
export interface TranslationRequest {
  text: string;
  targetLocale: "en" | "es" | "fr";
}
