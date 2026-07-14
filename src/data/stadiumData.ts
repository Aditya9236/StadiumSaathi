import { Gate, Zone, Incident, IncidentCategory, IncidentSeverity, TransitRoute, SustainabilityStats } from "../types/stadium";

/**
 * Initial mock data for the 6 stadium gates.
 */
export const initialGates: Gate[] = [
  {
    id: "gate-a",
    name: "Gate A - North Plaza",
    status: "OPEN",
    currentWaitTimeMinutes: 15,
    passengerFlowRate: 35,
    accessible: true,
    coordinates: { x: 150, y: 50 },
    densityPercent: 35,
  },
  {
    id: "gate-b",
    name: "Gate B - North-East Concourse",
    status: "OPEN",
    currentWaitTimeMinutes: 45,
    passengerFlowRate: 15,
    accessible: true,
    coordinates: { x: 350, y: 150 },
    densityPercent: 72,
  },
  {
    id: "gate-c",
    name: "Gate C - East Plaza",
    status: "OPEN",
    currentWaitTimeMinutes: 55,
    passengerFlowRate: 10,
    accessible: false,
    coordinates: { x: 450, y: 350 },
    densityPercent: 88,
  },
  {
    id: "gate-d",
    name: "Gate D - South Gate",
    status: "OPEN",
    currentWaitTimeMinutes: 5,
    passengerFlowRate: 50,
    accessible: true,
    coordinates: { x: 300, y: 550 },
    densityPercent: 15,
  },
  {
    id: "gate-e",
    name: "Gate E - West Plaza",
    status: "OPEN",
    currentWaitTimeMinutes: 20,
    passengerFlowRate: 28,
    accessible: true,
    coordinates: { x: 50, y: 300 },
    densityPercent: 48,
  },
  {
    id: "gate-f",
    name: "Gate F - VIP Club Entrance",
    status: "RESTRICTED",
    currentWaitTimeMinutes: 2,
    passengerFlowRate: 8,
    accessible: true,
    coordinates: { x: 100, y: 100 },
    densityPercent: 12,
  },
];

/**
 * Initial mock data for the 4 major stadium zones.
 */
export const initialZones: Zone[] = [
  {
    id: "zone-north",
    name: "North Stands (Concourse A-B)",
    occupancy: 8200,
    capacity: 10000,
    densityColor: "YELLOW",
    stepFreeRoutesAvailable: true,
  },
  {
    id: "zone-south",
    name: "South Stands (Concourse C-D)",
    occupancy: 9400,
    capacity: 10000,
    densityColor: "RED",
    stepFreeRoutesAvailable: true,
  },
  {
    id: "zone-east",
    name: "East Stands (Concourse E)",
    occupancy: 4100,
    capacity: 8000,
    densityColor: "GREEN",
    stepFreeRoutesAvailable: false,
  },
  {
    id: "zone-west",
    name: "West Stands (Concourse F)",
    occupancy: 6300,
    capacity: 8000,
    densityColor: "YELLOW",
    stepFreeRoutesAvailable: true,
  },
];

/**
 * Structure for incident templates.
 */
export interface IncidentTemplate {
  category: IncidentCategory;
  title: string;
  description: string;
  severity: IncidentSeverity;
}

/**
 * Predefined incident templates for simulation.
 */
export const incidentTemplates: IncidentTemplate[] = [
  {
    category: "MEDICAL",
    title: "Medical: Heat Exhaustion",
    description: "Fan experiencing symptoms of dehydration and heat exhaustion in Section 104.",
    severity: "HIGH",
  },
  {
    category: "SECURITY",
    title: "Security: Access Intrusion",
    description: "Unauthorized spectator attempted to bypass perimeter fence near Gate E.",
    severity: "CRITICAL",
  },
  {
    category: "FACILITY",
    title: "Facility: Elevator Malfunction",
    description: "Elevator #3 in West Stand reported out of service. Technician notified.",
    severity: "MEDIUM",
  },
];

/**
 * Simulates real-time updates for gates and zones by introducing realistic random variations.
 * @param currentGates - List of current gate states
 * @param currentZones - List of current zone states
 * @returns Mutated gate and zone states
 */
export function simulateTelemetryUpdate(
  currentGates: Gate[],
  currentZones: Zone[]
): { gates: Gate[]; zones: Zone[] } {
  // Update Gates
  const updatedGates = currentGates.map((gate) => {
    // Random fluctuation in density (-8% to +8%) bound between 0% and 100%
    const change = Math.floor(Math.random() * 17) - 8;
    const densityPercent = Math.max(0, Math.min(100, gate.densityPercent + change));

    // Calculate wait time proportionally: 0% -> 0min, 100% -> 60min
    const currentWaitTimeMinutes = Math.round((densityPercent / 100) * 60);

    // Flow rate fluctuates inversely with density
    const passengerFlowRate = Math.max(5, Math.round((100 - densityPercent) * 0.6));

    return {
      ...gate,
      densityPercent,
      currentWaitTimeMinutes,
      passengerFlowRate,
    };
  });

  // Update Zones
  const updatedZones = currentZones.map((zone) => {
    // Occupancy fluctuates by -150 to +150 fans, bound by capacity and 0
    const fluctuation = Math.floor(Math.random() * 301) - 150;
    const occupancy = Math.max(0, Math.min(zone.capacity, zone.occupancy + fluctuation));

    // Recalculate density color
    const ratio = occupancy / zone.capacity;
    let densityColor: "GREEN" | "YELLOW" | "RED" = "GREEN";
    if (ratio >= 0.85) {
      densityColor = "RED";
    } else if (ratio >= 0.5) {
      densityColor = "YELLOW";
    }

    return {
      ...zone,
      occupancy,
      densityColor,
    };
  });

  return { gates: updatedGates, zones: updatedZones };
}

/**
 * Generates a mock incident instance based on a random template.
 * @returns A structured Incident object
 */
export function generateRandomIncident(): Incident {
  const randomIndex = Math.floor(Math.random() * incidentTemplates.length);
  const template = incidentTemplates[randomIndex];
  
  const zones = ["zone-north", "zone-south", "zone-east", "zone-west"];
  const randomZone = zones[Math.floor(Math.random() * zones.length)];
  
  const sections = ["Section 104", "Concourse B, Row 12", "Section 218", "Gate D Concourse"];
  const randomSection = sections[Math.floor(Math.random() * sections.length)];

  return {
    id: `inc-${Math.floor(Math.random() * 9000) + 1000}`,
    category: template.category,
    title: template.title,
    description: template.description,
    severity: template.severity,
    status: "REPORTED",
    location: {
      zoneId: randomZone,
      section: randomSection,
      coordinates: {
        x: Math.floor(Math.random() * 400) + 50,
        y: Math.floor(Math.random() * 400) + 50,
      },
    },
    reportedAt: new Date().toISOString(),
  };
}

// ─── Transit Routes ──────────────────────────────────────────────────────

/**
 * Initial mock transit routes servicing the stadium.
 */
export const initialTransitRoutes: TransitRoute[] = [
  {
    id: "shuttle-downtown",
    name: "Downtown Express Shuttle",
    type: "SHUTTLE",
    closestGateId: "gate-a",
    nextDepartureMinutes: 8,
    delayMinutes: 0,
    status: "ON_TIME",
    carbonOffsetKg: 1.2,
  },
  {
    id: "shuttle-airport",
    name: "Airport Connector Shuttle",
    type: "SHUTTLE",
    closestGateId: "gate-d",
    nextDepartureMinutes: 22,
    delayMinutes: 5,
    status: "DELAYED",
    carbonOffsetKg: 2.8,
  },
  {
    id: "train-metro-blue",
    name: "Metro Blue Line — Central Station",
    type: "TRAIN",
    closestGateId: "gate-b",
    nextDepartureMinutes: 4,
    delayMinutes: 0,
    status: "ON_TIME",
    carbonOffsetKg: 3.1,
  },
  {
    id: "train-metro-green",
    name: "Metro Green Line — Suburbs North",
    type: "TRAIN",
    closestGateId: "gate-e",
    nextDepartureMinutes: 12,
    delayMinutes: 0,
    status: "ON_TIME",
    carbonOffsetKg: 2.4,
  },
  {
    id: "bus-route-7",
    name: "City Bus Route 7 — Eastside",
    type: "BUS",
    closestGateId: "gate-c",
    nextDepartureMinutes: 15,
    delayMinutes: 10,
    status: "DELAYED",
    carbonOffsetKg: 1.5,
  },
  {
    id: "rideshare-zone-s",
    name: "Rideshare Pick-up — South Lot",
    type: "RIDESHARE",
    closestGateId: "gate-d",
    nextDepartureMinutes: 3,
    delayMinutes: 0,
    status: "ON_TIME",
    carbonOffsetKg: 0.4,
  },
];

// ─── Sustainability Stats ────────────────────────────────────────────────

/**
 * Initial sustainability statistics for the match day.
 */
export const initialSustainabilityStats: SustainabilityStats = {
  recycleKg: 1420.5,
  compostKg: 820.2,
  landfillKg: 310.8,
  carbonOffsetTotalKg: 5420.0,
  fanParticipationRate: 78.5,
};

// ─── Point-of-Interest Data ─────────────────────────────────────────────

/**
 * Represents a point of interest (POI) inside the stadium.
 */
export interface StadiumPOI {
  id: string;
  name: string;
  category: "CONCESSION" | "RESTROOM" | "FIRST_AID" | "SENSORY_ROOM";
  status: string;
  coordinates: { x: number; y: number };
  accessible: boolean;
}

/**
 * Static POI locations plotted on the interactive SVG map.
 */
export const stadiumPOIs: StadiumPOI[] = [
  { id: "con-1", name: "Taco Stand Norte", category: "CONCESSION", status: "Open — ~5 min queue", coordinates: { x: 180, y: 95 }, accessible: true },
  { id: "con-2", name: "Burger Bar East", category: "CONCESSION", status: "Open — ~12 min queue", coordinates: { x: 410, y: 280 }, accessible: true },
  { id: "con-3", name: "Pizza Slice South", category: "CONCESSION", status: "Open — ~3 min queue", coordinates: { x: 260, y: 510 }, accessible: true },
  { id: "con-4", name: "Drinks & Ice Cream West", category: "CONCESSION", status: "Open — ~2 min queue", coordinates: { x: 70, y: 380 }, accessible: true },
  { id: "rest-1", name: "Restroom — North Level 1", category: "RESTROOM", status: "Open", coordinates: { x: 200, y: 130 }, accessible: true },
  { id: "rest-2", name: "Restroom — East Level 2", category: "RESTROOM", status: "Open", coordinates: { x: 430, y: 200 }, accessible: false },
  { id: "rest-3", name: "Restroom — South Level 1", category: "RESTROOM", status: "Open — Busy", coordinates: { x: 340, y: 490 }, accessible: true },
  { id: "rest-4", name: "Restroom — West Level 1", category: "RESTROOM", status: "Open", coordinates: { x: 60, y: 250 }, accessible: true },
  { id: "fa-1", name: "First Aid Station — North", category: "FIRST_AID", status: "Staffed", coordinates: { x: 230, y: 70 }, accessible: true },
  { id: "fa-2", name: "First Aid Station — South", category: "FIRST_AID", status: "Staffed", coordinates: { x: 350, y: 530 }, accessible: true },
  { id: "sr-1", name: "Sensory Room — West Suite", category: "SENSORY_ROOM", status: "Available (3 seats)", coordinates: { x: 55, y: 340 }, accessible: true },
  { id: "sr-2", name: "Sensory Room — East Suite", category: "SENSORY_ROOM", status: "Available (1 seat)", coordinates: { x: 460, y: 310 }, accessible: true },
];

// ─── Transit Simulation ─────────────────────────────────────────────────

/**
 * Simulates transit departure time changes.
 * Countdowns tick down, cycling back to a new random window upon reaching 0.
 */
export function simulateTransitUpdate(routes: TransitRoute[]): TransitRoute[] {
  return routes.map((route) => {
    let nextDep = route.nextDepartureMinutes - 1;
    let delay = route.delayMinutes;
    let status = route.status;

    if (nextDep <= 0) {
      // New departure window
      nextDep = Math.floor(Math.random() * 20) + 3;
      delay = Math.random() > 0.7 ? Math.floor(Math.random() * 12) : 0;
      status = delay > 0 ? "DELAYED" : "ON_TIME";
    }

    // Small chance of suspension
    if (Math.random() < 0.02) {
      status = "SUSPENDED";
      delay = 0;
    } else if (status === "SUSPENDED" && Math.random() > 0.5) {
      status = "ON_TIME";
    }

    return {
      ...route,
      nextDepartureMinutes: Math.max(0, nextDep),
      delayMinutes: delay,
      status: status as TransitRoute["status"],
    };
  });
}
