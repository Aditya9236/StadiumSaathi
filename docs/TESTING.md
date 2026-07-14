# StadiumSaathi — Manual Test Cases

> Manual verification guide covering the core features of StadiumSaathi.  
> Automated test suites are not required. Testers should follow each step exactly and verify the stated expected result.

---

## Test Environment Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and insert your `GEMINI_API_KEY`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in a browser.

---

## TC-01: Landing Page & Navigation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `http://localhost:3000` | Root landing page loads with StadiumSaathi branding |
| 2 | Click **"Organizer Dashboard"** button | Navigates to `/dashboard` |
| 3 | Navigate back and click **"Fan Companion Portal"** button | Navigates to `/fan` |
| 4 | On Dashboard header, click **"Fan Portal"** link | Navigates to `/fan` |
| 5 | On Fan Portal header, click **"← Return to Portal"** | Returns to `/` |

---

## TC-02: Dashboard — Gate Cards Loading

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard` | Page renders with 6 gate cards (Gate A–F) |
| 2 | Observe gate card colours | Red border = density > 80%, Amber = 50–80%, Green = < 50%, Slate = Closed/Restricted |
| 3 | Wait 10 seconds | Gate density values, wait times, and flow rates update automatically |
| 4 | Confirm "Live Telemetry Active" badge in header | Badge is visible with pulsing green dot |
| 5 | Tab through gate cards using keyboard | Each card receives focus with visible blue ring |

---

## TC-03: Dashboard — Zone Density Heatmap

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the "Stands & Zones Density Heatmap" section | 4 zone buttons are displayed |
| 2 | Click on any zone button | Selected zone shows a detailed panel below the grid with occupancy and fill % |
| 3 | Click a RED zone (e.g. South Stands) | Congestion Redirection Plan appears listing low-density alternate gates |
| 4 | Click the same zone again | Detail panel collapses |
| 5 | Click a different zone | New zone detail panel replaces the previous one |

---

## TC-04: Dashboard — AI Insight Panel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard` | AI Insight Panel shows loading skeleton with animated pulse |
| 2 | Wait for insights to load | Panel displays bottlenecks, staffing advice, and sustainability tip |
| 3 | Check mode badge (top-right of panel) | Shows **"Live (Gemini AI)"** if `GEMINI_API_KEY` is valid; **"Offline (Fallback)"** otherwise |
| 4 | Click **"Refresh"** button | Panel re-loads with updated insights |
| 5 | Wait 30 seconds without interaction | Panel silently refreshes in background (check "Updated: HH:MM:SS" timestamp) |

---

## TC-05: Dashboard — Simulate Incident & AI Update

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Confirm no active incident (counter shows 0) | Active Safety Alerts card shows "0 — All Zones Normal" |
| 2 | Click **"Simulate Incident"** | An incident banner appears at top of page with incident title, severity, and location |
| 3 | Confirm button is now disabled | "Simulate Incident" button appears greyed out |
| 4 | Observe AI Insight Panel | Panel refreshes and adds a critical alert entry for the simulated incident |
| 5 | If multiple gates are congested, verify bottleneck recommendations | Each congested gate shows a **unique** redirection target (not the same gate for all) |
| 6 | Click **"Dispatch Staff"** | Incident status changes to "DISPATCHED"; a green "Mark as Resolved" button appears |
| 7 | Click **"Mark as Resolved"** | Incident status briefly shows "RESOLVED", then the banner disappears after ~2 seconds |
| 8 | Confirm counter resets to 0 | Active Safety Alerts card shows "All Zones Normal" again |

---

## TC-06: Dashboard — Emergency Broadcast Composer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the "Emergency Broadcast" card in the right sidebar | Textarea and "Send Broadcast" button are visible |
| 2 | Attempt to click "Send Broadcast" with empty textarea | Button is disabled and not clickable |
| 3 | Type a message (e.g. "Gate D is now open, reduced queues") | Character count updates (e.g. "38/300") |
| 4 | Click **"Send Broadcast"** | Button temporarily changes to "✓ Broadcast Active" green state |
| 5 | Observe the broadcast banner at top of the page | Active broadcast banner appears with the message and "Clear" button |
| 6 | Click **"Clear"** | Broadcast banner disappears |

---

## TC-07: Dashboard — Language Switching

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the language switcher in the header (🇺🇸 EN / 🇪🇸 ES / 🇫🇷 FR) | All three locale buttons are visible |
| 2 | Click **ES** | UI labels switch to Spanish (e.g. "Total Ocupación del Estadio", "Simular Incidente") |
| 3 | Click **FR** | UI labels switch to French (e.g. "Occupation Totale du Stade", "Simuler un Incident") |
| 4 | Click **EN** | UI labels return to English |
| 5 | Simulate an incident, then switch language | Incident banner and AI panel headings also update |

---

## TC-08: Fan Portal — Page Load & Map

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/fan` | Fan Portal loads with hero banner, language switcher, and "Interactive Stadium Map" section |
| 2 | Observe the SVG stadium map | Gate pins (A–F) are shown at correct positions with colour-coded density |
| 3 | Hover over a gate pin | Tooltip shows gate name, wait time, density, and accessibility indicator |
| 4 | Observe POI icons on map (🍔🚻🏥🧘) | Concession, Restroom, First Aid, and Sensory Room icons are displayed |
| 5 | Click a POI filter toggle (e.g. turn off "Concessions") | Concession markers disappear from the map; button changes to inactive state |
| 6 | Re-enable the filter | Markers reappear |
| 7 | Observe "Live Gate Status" card row at the bottom | 6 gate cards show live wait times |

---

## TC-09: Fan Portal — Step-Free Routing Toggle

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **"♿ Step-Free Routing"** toggle button | Button is visible in the Interactive Map section header |
| 2 | Click the toggle to enable | Button becomes purple/highlighted; banner appears: "Step-Free Mode Active — Elevators and ramps only" |
| 3 | Observe SVG map | Elevator indicators (ELV 1–4) appear as purple boxes; dashed purple ramp paths are drawn |
| 4 | Non-accessible POIs in the map | Only POIs with `accessible: true` are shown when step-free mode is active |
| 5 | Click the toggle again to disable | Elevator indicators disappear; banner is removed; all POIs restore |
| 6 | Press the toggle via keyboard (Tab + Enter) | Same behaviour as clicking — toggle activates/deactivates correctly |

---

## TC-10: Fan Portal — AI Navigation Advisor

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt to click **"Get Directions"** with no selections | Button is disabled (greyed out) |
| 2 | Select a gate from the "Your Entry Gate" dropdown | Gate options list all 6 gates with live wait times |
| 3 | Select a zone from "Destination Section" | Zone options show colour emoji and fill percentage |
| 4 | Click **"Get Directions"** | Loading spinner appears; button text changes to "Getting Directions..." |
| 5 | Wait for response | Route card shows estimated walk time badge, numbered step list, and any warnings |
| 6 | Enable "I need step-free access" checkbox | Form sends `stepFreeRequired: true` to API; directions include elevator guidance |
| 7 | Enable "I prefer quieter routes" | Form sends `sensorySafeRequired: true`; directions avoid high-noise areas |
| 8 | Click a gate pin on the SVG map | Gate dropdown auto-fills with the clicked gate; page scrolls to the form |

---

## TC-11: Fan Portal — Language Switching & AI Directions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Switch language to **ES** | Form labels, button text, and placeholder change to Spanish |
| 2 | Request directions in ES mode | Route steps and warnings are returned in Spanish |
| 3 | Switch language to **FR** | All UI labels change to French |
| 4 | Request directions in FR mode | Route steps and warnings are returned in French |
| 5 | Switch back to **EN** | UI labels revert; next navigation request returns English directions |

---

## TC-12: Fan Portal — Emergency Broadcast Banner

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/fan` and wait ~8 seconds | An emergency broadcast banner slides in at the top of the page |
| 2 | Read the banner message | Message is in the currently selected language |
| 3 | Click the **× dismiss** button | Banner disappears |
| 4 | Switch language and reload | Broadcast message appears in the newly selected language |

---

## TC-13: Accessibility — Keyboard Navigation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard`, press **Tab** | Focus starts at first focusable element (skip to main content or header link) |
| 2 | Tab through all gate cards | Each card receives visible blue focus ring; no focus traps |
| 3 | Press **Enter** on a zone button | Zone detail panel expands as if clicked |
| 4 | Tab into the AI Insight Panel "Refresh" button and press Enter | Panel refreshes |
| 5 | Open `/fan`, Tab to the "♿ Step-Free Routing" toggle | Toggle receives focus; pressing Space or Enter activates it |
| 6 | Tab into the gate selector, navigate with arrow keys | Dropdown options are accessible via keyboard |
| 7 | Tab to "Get Directions" and press Enter | Form submits; directions load |
| 8 | Run browser accessibility check (DevTools → Lighthouse → Accessibility) | Score ≥ 90 |

---

## TC-14: Security Verification

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect browser Network tab on `/dashboard` | No `GEMINI_API_KEY` value appears in any client-side request or response |
| 2 | Inspect browser Network tab on `/fan` | No `GEMINI_API_KEY` value appears; key is only used server-side |
| 3 | Check `.gitignore` | `.env*` pattern is present — `.env.local` will never be committed |
| 4 | Try submitting the navigation form with an extremely long string | Server returns 400 with appropriate error message |
| 5 | Try submitting with a prompt-injection phrase (e.g. "ignore previous instructions") | Server returns 400 with "Input contains disallowed patterns" |

---

*Last Updated: 2026-07-14 | StadiumSaathi v1.0.0*
