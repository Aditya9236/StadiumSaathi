# Software Requirements Specification (SRS)
## Project: StadiumSaathi
### Version: 1.0.0 (Hackathon MVP)
### Event: FIFA World Cup 2026

---

## MVP Scope vs Future Roadmap

StadiumSaathi is designed as a high-fidelity prototype and operational companion for the FIFA World Cup 2026. This section outlines the boundary between what is fully implemented in the current Hackathon MVP and what is defined for the future production roadmap.

| Feature / Dimension | Hackathon MVP Scope (Implemented) | Future Production Roadmap (Architecture Only) |
| :--- | :--- | :--- |
| **User Access** | Anonymous public access with mock roles selected via a UI toggle. | Full AuthN/AuthZ flow (OAuth 2.0 / OIDC) with RBAC (Role-Based Access Control). |
| **Data Storage** | Ephemeral, in-memory typed Mock Data Objects in Next.js server memory. | Production SQL (PostgreSQL) for structure/analytics + NoSQL (MongoDB/Firestore) for chats/audit logs. |
| **Real-time Feeds** | Simulated telemetry generator yielding gate waits, crowd levels, and incidents. | Live IoT integration (RFID gates, camera feeds, public transit API WebSockets). |
| **GenAI Execution** | Server-side Gemini API calls via Next.js API Routes (`gemini-1.5-flash`) for structured navigation recommendations. No open-ended conversational chat. | Fine-tuned models, semantic caching layer, guardrail proxies, and vector search (Vertex AI). |
| **Deployment** | Quick-deploy to Vercel edge runtime with environment variables. | Multi-region Google Cloud Run container deployment with CI/CD via GitHub Actions / Cloud Build. |
| **Security Controls** | Server-side API keys, basic query character limits, and regex input sanitization. | Rate limiting (Redis), WAF (Cloud Armor), CSRF protection, and immutable audit logs. |
| **Scalability** | Single stadium demo optimized for a specific FIFA 2026 match-day scenario. | Multi-stadium, multi-tenant scalable architecture across US, Canada, and Mexico venues. |

---

## 1. Stakeholder Analysis

To provide a context-rich experience, StadiumSaathi accommodates six primary stakeholder personas. While the MVP focuses on two core interfaces—the **Fan Mobile Companion** and the **Organizer Dashboard**—the requirements of all six roles are modeled and simulated within the platform's workflow.

| Persona | Role Description | Key Goals in Stadium | Primary Pain Points | MVP Interface / Context |
| :--- | :--- | :--- | :--- | :--- |
| **Fan** | Ticket holder attending matches. Includes international travelers and people with accessibility needs. | Navigating to seat, locating restrooms/concessions, finding fast security gates, transit egress, getting multilingual aid. | Long lines, language barriers, confusing stadium layout, lack of step-free route information. | **Fan Mobile Companion UI** with interactive SVG map, step-free routing, structured navigation advisor, and translation tool. |
| **Organizer** | High-level tournament ops manager coordinating the event. | Monitoring overall stadium health, tracking crowd flow, deploying staff to incidents, making announcements. | Siloed information, delayed communication of incidents, slow coordination across teams. | **Organizer Dashboard UI** with crowd heatmaps, active incident feed, and broadcast launcher. |
| **Volunteer** | Temporary event staff assisting fans with directions and basic info. | Guiding fans to correct gates, resolving basic navigation questions, translating instructions. | Difficulty communicating with non-native speakers, changing transit schedules. | Modeled as a user profile. AI translation tools on the Fan app are accessible to volunteers to assist fans. |
| **Stadium Staff** | Facility workers handling concessions, cleaning, and maintenance. | Maintaining cleanliness, keeping restrooms and food stalls stocked, reporting facility damage/spills. | Unclear reporting channels for facilities issues, lack of coordinates for cleanup sites. | Simulated as targets for dispatcher commands. Incidents (e.g., "Liquid spill in Zone B") are dispatched to them. |
| **Security Personnel** | Safety officers monitoring gates, barriers, and crowds. | Managing queue flow at gates, resolving crowd bottlenecks, responding to safety hazards. | Sudden crowd surges, lack of communication about gate closures or redirection rules. | Highlighted in crowd heatmaps. Dashboard allows organizers to coordinate with security to redirect queues. |
| **Medical Team** | First responders stationed at first-aid pods. | Rapid deployment to medical emergencies, providing on-site care, managing patient extraction. | Difficulty locating victims in dense crowds, delay in initial dispatch notification. | Integrated into incident workflow. Emergency incident triggers instant medical dispatch in mock feed. |

---

## 2. User Stories and Acceptance Criteria (MVP Features)

### 2.1 Organizer Dashboard (ORG)

#### **User Story ORG-1: Live Crowd Heatmap**
*   **As an** Organizer,
*   **I want to** view a real-time heatmap of stadium zones and gates,
*   **So that** I can detect crowd bottlenecks and coordinate redirection policies.
*   **Acceptance Criteria**:
    *   **AC-1.1**: The dashboard must display a high-fidelity visual layout of stadium zones (e.g., North/South concourses, Gates A-D) colored by density (Green = Low, Yellow = Moderate, Red = Congested).
    *   **AC-1.2**: Data must update dynamically (every 5-10 seconds) using the mock telemetry generator.
    *   **AC-1.3**: Clicking a congested zone must display details including current wait times, active occupancy, and recommended gates for redirection.

#### **User Story ORG-2: Incident Feed & Dispatcher**
*   **As an** Organizer,
*   **I want to** view a live ticker of stadium incidents and dispatch staff to resolve them,
*   **So that** venue safety and operational efficiency are maintained.
*   **Acceptance Criteria**:
    *   **AC-2.1**: The incident feed must display incoming logs (e.g., medical emergency, trash overflow, gate malfunction) with severity levels (Low, Medium, High) and coordinates.
    *   **AC-2.2**: The dashboard must include a "Dispatch Staff" action that updates the incident state from `Reported` to `Dispatched` and logs the timestamp.
    *   **AC-2.3**: Organizers must be able to trigger a mock incident via a "Simulate Incident" button to instantly test the end-to-end alerting flow.

#### **User Story ORG-3: Sustainability Monitor**
*   **As an** Organizer,
*   **I want to** track aggregate waste diversion rates (recycle, compost, landfill) and fan carbon offset contributions,
*   **So that** I can monitor compliance with the FIFA World Cup 2026 green mandates.
*   **Acceptance Criteria**:
    *   **AC-3.1**: The dashboard must display dynamic charts showing real-time waste diversion stats (percentage of compostable vs. recyclable vs. landfill trash collected).
    *   **AC-3.2**: A live counter must track simulated carbon offset points generated by fans using green transit options.

#### **User Story ORG-4: Multilingual Emergency Broadcast**
*   **As an** Organizer,
*   **I want to** publish urgent announcements in English and have them broadcast to fans in their preferred language,
*   **So that** critical safety messages are understood by international attendees.
*   **Acceptance Criteria**:
    *   **AC-4.1**: An input panel must allow entering an English broadcast message (e.g., "Gate B is closed due to crowd congestion. Please exit via Gate C").
    *   **AC-4.2**: The system must route this message through the server-side translation middleware to prepare Spanish and French versions.
    *   **AC-4.3**: Pushed broadcasts must instantly appear in the Fan Companion App matching the fan's selected UI locale.

---

### 2.2 Fan Navigation (FAN)

#### **User Story FAN-1: Interactive Stadium Map**
*   **As a** Fan,
*   **I want to** view a responsive, interactive map of the stadium,
*   **So that** I can easily locate concession stands, restrooms, first-aid, and my ticketed seating zone.
*   **Acceptance Criteria**:
    *   **AC-1.1**: The map must be an interactive vector SVG displaying stadium levels, gates, concessions, and pathways.
    *   **AC-1.2**: Filters must allow toggling layers on/off (Concessions, Restrooms, First Aid, Sensory Rooms).
    *   **AC-1.3**: Tapping an asset icon must display a tooltip with its name, status (e.g., "Restroom: Open", "Concession: 5min queue"), and a "Navigate" button.

#### **User Story FAN-2: Step-Free Route Planner**
*   **As a** mobility-impaired Fan,
*   **I want to** generate navigation routes that avoid stairs, escalators, and steep ramps,
*   **So that** I can navigate the stadium safely using only step-free pathways and elevators.
*   **Acceptance Criteria**:
    *   **AC-2.1**: The navigation UI must offer a toggle for "Step-Free Routing" (Accessibility Mode).
    *   **AC-2.2**: When active, the route calculation logic must exclude staircases and escalators, highlighting elevator shafts and ramp-only corridors on the SVG map.
    *   **AC-2.3**: Visual routing lines must be color-blind friendly and include screen-reader text describing the step-free path.

#### **User Story FAN-3: Structured AI Navigation Advisor**
*   **As a** Fan,
*   **I want to** select my starting location, destination, and accessibility preferences in a form panel to receive an AI-generated navigation routing recommendation,
*   **So that** I can get specific, optimized navigation instructions without navigating open chat conversations.
*   **Acceptance Criteria**:
    *   **AC-3.1**: The UI must provide structured dropdown fields for Source, Destination, and Accessibility requirements (e.g., step-free, sensory-safe, shortest-walk).
    *   **AC-3.2**: The backend must query live telemetry (gate waits, zone density, active incidents) and compile it as static context for the Gemini API.
    *   **AC-3.3**: The AI must return a structured navigation step list that is displayed as clear markdown text (no open-ended chat inputs allowed).

#### **User Story FAN-4: Eco-Sort Assistant**
*   **As a** sustainability-conscious Fan,
*   **I want to** search for a waste item by name in a structured interface,
*   **So that** I receive a clear classification (Compost, Recycle, or Landfill) and disposal explanation.
*   **Acceptance Criteria**:
    *   **AC-4.1**: The app must provide a dedicated search box labeled "Eco-Sort Waste Helper".
    *   **AC-4.2**: The user must input the item name (e.g., "biodegradable hot dog wrapper", "aluminum soda can") and submit.
    *   **AC-4.3**: The AI must process this single query and output the category (Compost, Recycle, or Landfill) alongside a brief explanation of why it goes there based on FIFA 2026 zero-waste rules.

#### **User Story FAN-5: Real-Time Transit Board**
*   **As a** Fan preparing to exit the stadium,
*   **I want to** view a transit board showing real-time departures near my closest gate,
*   **So that** I can select the fastest route home and avoid post-match crowds.
*   **Acceptance Criteria**:
    *   **AC-5.1**: The transit screen must detect the fan's current gate and show local transit options (Shuttles, Trains, Rideshare queues) within a 5-minute walking radius.
    *   **AC-5.2**: Departure times and delay statuses (e.g., "On Time", "10-min Delay") must update dynamically based on the mock telemetry.

---

### 2.3 Multilingual Layer (MLT)

#### **User Story MLT-1: App UI Localization**
*   **As an** international Fan,
*   **I want to** toggle the entire app language between English, Spanish, and French,
*   **So that** I can easily read all buttons, headers, and UI alerts.
*   **Acceptance Criteria**:
    *   **AC-1.1**: A language selector dropdown must be present in the main header of both client and dashboard screens.
    *   **AC-1.2**: Switching languages must immediately update all UI copy without triggering a full page reload (using React localization state/i18n client context).

#### **User Story MLT-2: Translation Utility**
*   **As a** Fan or Volunteer,
*   **I want to** paste custom stadium signs, notices, or dialog texts into a translation input box,
*   **So that** I can get an immediate translation in my preferred language.
*   **Acceptance Criteria**:
    *   **AC-2.1**: The UI must provide a text input block where users can type or paste text and select their target language (EN, ES, FR).
    *   **AC-2.2**: The backend `/api/translate` endpoint must process this and return translated text. If the translation service fails, the original text is returned gracefully with a notice.

---

## 3. TypeScript Data Interfaces (MVP Mock Data Structure)

To guarantee strict type safety across our client components, server routes, and mock data generators, the following unified TypeScript interfaces define the schema of our venue operations. These represent our MVP's in-memory data structures.

```typescript
// docs/interfaces.ts

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
  id: string; // Unique GUID
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
  reportedAt: Date;
  dispatchedAt?: Date;
  resolvedAt?: Date;
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
```

---

## 4. Testing Strategy

The Hackathon MVP enforces a three-pronged testing strategy to ensure correct core operations, high accessibility, and consistent behavior without the overhead of heavy enterprise CI/CD testing runners.

```
                  ┌──────────────────────────────┐
                  │       TESTING STRATEGY       │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   UNIT TESTING   │   │  ACCESSIBILITY   │   │  MANUAL TESTING  │
│  (Core Logic)    │   │  (WCAG 2.1 AA)   │   │  (User Journeys) │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

### 4.1 Unit Testing (Core Logic)
*   **Scope**: Validate mathematical functions and helper operations.
*   **Targets**:
    *   *Density Color Calculator*: Ensure correct thresholds (e.g., Occupancy > 85% maps to "RED").
    *   *Prompt Compiler*: Verify that the system instructions and telemetry state compile into a valid string.
    *   *Eco-Sort Router*: Verify text categorization mappings for trash items.
*   **Execution**: Run manually via local scripts:
    ```bash
    npm run test:unit
    ```

### 4.2 Accessibility Testing (WCAG 2.1 AA)
*   **Scope**: Validate that the interfaces are accessible to attendees with disabilities.
*   **Checklist & Tooling**:
    *   **Lighthouse / Axe-core**: Run local browser audits to verify accessibility scores stay above **95/100**.
    *   **Contrast Checks**: Enforce that colors used for the heatmap (especially yellow/green) and incident highlights meet the 4.5:1 ratio against light and dark backgrounds.
    *   **Keyboard Walkthroughs**: Ensure interactive map pins, dialogs, and navigation menus can be opened, closed, and navigated using only `Tab`, `Shift+Tab`, and `Enter`.
    *   **Screen Reader Audits**: Check that dynamic content (like the incident ticker updating) is read aloud via `aria-live="polite"`.

### 4.3 Manual Testing (Documented Test Cases)
In the absence of end-to-end testing frameworks like Playwright, manual testing is documented and executed against the following scenarios:

#### **Test Case TC-001: Reporting and Dispatching an Incident**
1.  **Setup**: Navigate to the Organizer Dashboard.
2.  **Action**: Click the "Simulate Incident" button.
3.  **Expected Behavior**: A new high-severity incident appears at the top of the "Active Incidents" feed with status `REPORTED`. The Crowd Heatmap shows an alert icon in the corresponding zone.
4.  **Action**: Click the "Dispatch Staff" button on the incident card.
5.  **Expected Behavior**: The incident status label updates to `DISPATCHED`, color code shifts from red to yellow, and a dispatch timestamp is logged.

#### **Test Case TC-002: Fan Step-Free Routing Toggle**
1.  **Setup**: Navigate to the Fan Mobile Companion. Open the Stadium Map.
2.  **Action**: Select a route from "Gate A" to "Section 104". Notice the default route path highlights stairs.
3.  **Action**: Toggle the "Step-Free Navigation" button in the menu.
4.  **Expected Behavior**: The path on the SVG map recalculates. The visual line shifts away from the staircase symbols and routes directly through the elevator lobbies. The text directions panel replaces "Take stairs to Concourse A" with "Use Elevator 3 to Concourse A".

#### **Test Case TC-003: AI Navigation Recommendation Generation**
1.  **Setup**: Open the Fan Companion "AI Navigation Advisor".
2.  **Action**: Select Source: "Gate A", Destination: "Zone 100", Step-Free: "Yes", Language: "Spanish". Click "Get AI Directions".
3.  **Expected Behavior**: The UI shows a loading state, calls `/api/ai-recommendation`, retrieves Gate A wait times and Zone 100 density, and displays a step-by-step navigation list in Spanish utilizing elevators.

---

## 5. Performance Optimization (Next.js Native)

The MVP is structured to run efficiently on mobile networks without relying on complex backend caching architectures. We leverage Next.js native capabilities:

*   **Lazy Loading & Code Splitting**:
    *   The complex interactive SVG map is loaded dynamically using React's `lazy` or Next.js `dynamic()` imports to minimize the initial Javascript bundle size.
    ```typescript
    const InteractiveMap = dynamic(() => import('@/components/fan/InteractiveMap'), {
      loading: () => <p>Loading interactive SVG map...</p>,
      ssr: false // Map relies on window/DOM APIs
    });
    ```
*   **Memoization**:
    *   We use `useMemo` for filtering and sorting the active incidents and gates, preventing expensive UI recalculations during high-frequency telemetry updates.
    *   We wrap map markers and list items in `React.memo` to restrict re-renders to elements whose telemetry values actually change.
*   **Image Optimization**:
    *   We use Next.js `next/image` to serve responsive, WebP-formatted venue layout images, ensuring small asset weights for fans on cell towers.
*   **Font Optimization**:
    *   Google Fonts are loaded via `next/font` to host font files locally at edge sites, avoiding render-blocking third-party network fetches.

---

## 6. Security (MVP Implementation)

Security in the Hackathon MVP focuses on credential isolation, strict parameter limits, and safeguarding against prompt injection.

*   **Server-Side Execution ONLY**:
    *   The Gemini API Key (`GEMINI_API_KEY`) is stored strictly in environment variables on Vercel's server side.
    *   No client component has access to this key. All AI inquiries flow through the Next.js API endpoint `/api/ai-recommendation` which proxies requests to the `@google/generative-ai` SDK.
*   **Input Sanitization & Parameter Validation**:
    *   All user input string fields (such as item names in the Eco-Sort Assistant or text translation boxes) are strictly limited to a maximum length of 500 characters.
    *   Input regex filters strip out common prompt injection tokens (e.g. `override system rules`, `ignore guidelines`, `developer console`) before compiling the LLM context.
*   **Secure Environment Variable Separation**:
    *   Only non-sensitive configs (like `NEXT_PUBLIC_APP_URL`) use the `NEXT_PUBLIC_` prefix.
    *   Vercel production dashboard acts as the single source of truth for secret keys.

---

## 7. Accessibility Compliance (WCAG 2.1 AA)

To accommodate all international visitors, StadiumSaathi enforces accessible design principles.

*   **Keyboard Navigation**:
    *   All buttons, filters, and form inputs have a visible focus outline (`focus-visible:ring-2 focus-visible:ring-blue-500`).
    *   The interactive SVG map pins are focusable `<button>` elements with keyboard trigger handlers (`onClick` and `onKeyDown`).
*   **Screen Reader Support (ARIA)**:
    *   Icons (from Lucide React) are decorated with `aria-hidden="true"` when accompanying text, or given clear labels if standalone.
    *   Screen reader regions such as incident alerts and telemetry wait-time tickers use `aria-live="polite"` so screen readers speak changes without forcing focus changes.
    *   Forms use explicit `<label>` tags linked to inputs via matching `id` and `htmlFor` properties.
*   **Color Contrast**:
    *   Contrast ratios are audited using browser developer tools, ensuring all text elements achieve at least a **4.5:1** ratio. Text overlaying heatmap layers uses high-contrast text tags (e.g., black text on yellow/green nodes, white text on dark red nodes).

---

## 8. Coding Standards

To ensure a highly maintainable, readable codebase, StadiumSaathi complies with standard React and TypeScript conventions.

### 8.1 Feature-Based Folder Architecture
We organize folders by feature rather than utility type, making it simple to find related client components, hooks, and views:
```
/app/fan/                   # All Fan UI files
/app/dashboard/             # All Organizer Dashboard UI files
/components/fan/            # Components limited to the Fan module
/components/dashboard/      # Components limited to the Dashboard
/components/ui/             # Reusable atomic UI (buttons, card wrappers)
```

### 8.2 Code Conventions
*   **TypeScript Strict Mode**: Enforce `strict: true` in `tsconfig.json`. Every function parameter must be typed, and `any` must be avoided.
*   **Naming Conventions**:
    *   *Components & Files*: PascalCase (e.g., `IncidentCard.tsx`, `MapOverlay.tsx`).
    *   *Functions & Variables*: camelCase (e.g., `calculateWaitTime()`, `activeIncidentCount`).
    *   *Constants / Enums*: UPPER_SNAKE_CASE (e.g., `MAX_INPUT_LENGTH`).
*   **JSDoc Documentation**: All shared library functions and complex helper utilities must include JSDoc comments explaining parameters, return types, and business logic.
    ```typescript
    /**
     * Calculates the density category based on current occupancy and capacity.
     * @param occupancy - Current number of individuals in the zone
     * @param capacity - Safe maximum capacity of the zone
     * @returns Color token indicating density level
     */
    export function getDensityColor(occupancy: number, capacity: number): "GREEN" | "YELLOW" | "RED" { ... }
    ```

---

## 9. Deployment

The Hackathon MVP is configured for automated edge hosting via Vercel.

### 9.1 Environment Variable Setup
A `.env.example` file is included in the project root. To deploy, copy this file locally to `.env.local` and add your credentials:
```bash
# .env.local
GEMINI_API_KEY=AIzaSyD... # Your Google Gemini API Key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 9.2 Vercel Deployment Instructions
1.  **Vercel Project Creation**: Link your GitHub repository to Vercel via the Vercel dashboard.
2.  **Configure Build Settings**:
    *   Framework Preset: `Next.js`
    *   Build Command: `npm run build`
    *   Output Directory: `.next`
3.  **Environment Variables**: Add `GEMINI_API_KEY` and `NEXT_PUBLIC_APP_URL` in the project settings.
4.  **Deploy**: Click "Deploy". Each merge to the `main` branch will automatically build and publish preview/production links.

---

## 10. Future Production Roadmap

These components are documented for future architecture and production expansion, and **are not** implemented in the Hackathon MVP.

### 10.1 Authentication & Authorization (RBAC)
*   **Approach**: Integrate an identity provider (e.g., Auth0 or Firebase Auth) using standard OAuth 2.0 and OpenID Connect (OIDC).
*   **RBAC Matrix**:
    *   *Fan*: Read-only access to maps, public transit, and generic chat.
    *   *Volunteer*: Write access to reporting/flagging local issues, translation tools.
    *   *Organizer*: Complete read/write access to dashboard settings, dispatch commands, and broadcast controls.
    *   *Emergency Staff*: Read/Write access to assigned incidents.

### 10.2 Database Architecture
The production database replaces our transient mock arrays with a robust hybrid architecture:
```
                                 ┌────────────────────────┐
                                 │   HYBRID DB ARCHITECTURE│
                                 └───────────┬────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │     RELATIONAL ENGINE     │               │     DOCUMENT DATABASE     │
         │  (PostgreSQL / Spanner)   │               │   (MongoDB / Firestore)   │
         ├───────────────────────────┤               ├───────────────────────────┤
         │ • Stadium structures,      │               │ • Conversation logs,      │
         │   incident records        │               │   ephemeral session tags  │
         │ • Telemetry logs          │               │ • Audit history           │
         └───────────────────────────┘               └───────────────────────────┘
```
*   **Relational Engine (PostgreSQL / Google Cloud Spanner)**:
    *   Stores static venue structures (Gates, Zones, Concessions).
    *   Stores permanent incident audit logs and tournament metadata.
*   **Document Database (MongoDB / Cloud Firestore)**:
    *   Stores unstructured user interaction logs and sign translation history.
    *   Stores dynamic telemetry session states.

### 10.3 CI/CD & Google Cloud Run Architecture
*   **Deployment Target**: Move Next.js from Vercel to **Google Cloud Run** using container images (Docker).
*   **Pipeline Flow**:
    1.  *Commit Code*: Developer merges to main.
    2.  *CI Testing*: GitHub Actions triggers unit, integration, and security scanning (using Snyk/SonarQube).
    3.  *Build Container*: Google Cloud Build compiles the Docker image and tags it.
    4.  *Registry Storage*: Image is stored in Google Artifact Registry.
    5.  *Deploy Event*: Cloud Build deploys a new revision to Google Cloud Run, leveraging traffic splitting to run canary deployments (e.g., 90% stable, 10% canary).

### 10.4 Infrastructure Hardening & Security
*   **Web Application Firewall (WAF)**: Use Google Cloud Armor to block DDoS attacks and SQL injection at the edge.
*   **Rate Limiting**: Enforce rate limiting per client IP (using Upstash Redis or Cloudflare Rules) to limit recommendations and translations to 30 per minute.
*   **CSRF Protection**: Implement CSRF tokens for all state-changing endpoints.
*   **Security Auditing**: Log all dispatcher actions and incident status changes to Google Cloud Logging with write-once-read-many (WORM) storage for compliance.

### 10.5 Multi-Stadium / Multi-Tournament Scalability
*   **Multi-Tenancy**: The application schema will partition tables by `stadium_id` and `tournament_id`. A router sub-layer will render the map and configure Gemini system prompts based on the sub-domain or route (e.g., `metlife.stadiumsaathi.com` vs. `azteca.stadiumsaathi.com`).
*   **Edge Replication**: Use a global load balancer to route fan requests to the closest GCP region (US-East, US-West, Mexico-Central, Canada-East) to keep AI response latencies low.

---

## 11. Risk Analysis & Mitigation (Production Level)

| Risk ID | Description | Impact | Likelihood | Mitigation Strategy (Production) |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | GenAI Hallucination on Gate Closed | High | Medium | **Hardcoded Safety Overrides**: If telemetry flags a gate as `CLOSED`, a rules-based regex interceptor blocks the LLM from outputting a path through that gate, replacing it with a static emergency notification. |
| **RSK-002** | Crowd Surge & Network Congestion | Critical | High | **Offline First PWA**: The application caches the basic SVG map, step-free instructions, and emergency procedures using service workers. If mobile towers fail, the app falls back to offline mode. |
| **RSK-003** | API Key Compromise or Abuse | High | Low | **Secret Manager & IAM**: Store keys in Google Secret Manager. Use Google Cloud IAM service accounts with least privilege. Enforce monthly key rotations. |
| **RSK-004** | Prompt Injection Hijacking | Medium | Medium | **LlamaGuard/Safety Filters**: In front of the Gemini API, run a secondary guardrail classifier (like Vertex AI Safety Filters) to analyze prompts and block policy violations before they reach the main LLM. |
| **RSK-005** | Real-time Data Feed Downtime | High | Low | **Stale Data Alerting**: If the telemetry feed fails to report for >30 seconds, the client UI displays a banner ("Using cached data - check physical signs") and disables direct queue-dependent AI routing. |
