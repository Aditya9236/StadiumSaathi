# ⚽ StadiumSaathi

> **AI-Powered Stadium Operations Companion for FIFA World Cup 2026**

StadiumSaathi is an intelligent, real-time stadium management and fan companion platform built for the scale and complexity of the FIFA World Cup 2026. It bridges the gap between stadium operations teams and fans through live telemetry, Gemini AI insights, multilingual support, and a fully accessible web interface.

---

## 🎯 Problem Statement — Track Alignment

StadiumSaathi addresses all **7 core problem tracks** of the FIFA World Cup 2026 technology challenge:

| # | Track | Implementation |
|---|-------|----------------|
| 1 | **Navigation & Wayfinding** | AI Navigation Advisor on Fan Portal: Gemini generates step-by-step, locale-aware directions from any entry gate to any seating zone |
| 2 | **Crowd Management** | Organizer Dashboard: live gate density telemetry, zone heatmaps, congestion alerts, and AI-powered redirection recommendations |
| 3 | **Accessibility** | Step-free routing toggle on Fan Portal; `accessible` flag on all gates and POIs; WCAG 2.1 AA compliance with full keyboard navigation and ARIA labels |
| 4 | **Transportation** | Transit data structures available in codebase; Gate cards show closest transit connections in the data model |
| 5 | **Sustainability** | Green Diversion Monitor on Dashboard tracking recycled, composted, and landfill waste in real-time; AI sustainability tips in the insights panel |
| 6 | **Multilingual Assistance** | Full English / Spanish / French translation layer via `src/lib/translations.ts`; AI navigation directions are generated in the fan's chosen locale |
| 7 | **Operational Intelligence** | Dashboard AI Insight Panel powered by Gemini 2.0 Flash: bottleneck analysis, staffing advice, and incident response recommendations from live telemetry |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Google Gemini 2.0 Flash via REST API (`x-goog-api-key`) |
| Data | Simulated real-time telemetry (in-memory singleton) |
| Accessibility | WCAG 2.1 AA — semantic HTML, ARIA, keyboard navigation |
| i18n | Custom `translations.ts` module (en / es / fr) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing portal
│   ├── dashboard/page.tsx          # Organizer Operations Dashboard
│   ├── fan/page.tsx                # Fan Companion Portal
│   └── api/
│       ├── dashboard-insights/     # Gemini: crowd management AI insights
│       ├── ai-recommendation/      # Gemini: step-by-step navigation advisor
│       ├── telemetry/              # Live gate & zone telemetry endpoint
│       ├── translate/              # Translation utility endpoint
│       └── eco-sort/               # Sustainability classification endpoint
├── components/
│   ├── dashboard/
│   │   ├── GateCard.tsx            # Individual gate status card
│   │   ├── AIInsightPanel.tsx      # Gemini AI insights panel
│   │   └── IncidentBanner.tsx      # Incident alert banner
│   └── fan/
│       └── StadiumMap.tsx          # Interactive SVG stadium map
├── data/
│   └── stadiumData.ts              # Mock telemetry, POIs, incident templates
├── lib/
│   └── translations.ts             # en / es / fr translation strings
└── types/
    └── stadium.ts                  # TypeScript interfaces
docs/
├── SRS.md                          # Software Requirements Specification
├── ARCHITECTURE.md                 # System architecture overview
└── TESTING.md                      # Manual test cases
```

---

## 🚀 Setup & Running Locally

### Prerequisites

- Node.js 18+ and npm
- A [Google AI Studio](https://aistudio.google.com/app/apikey) account for a Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Aditya9236/StadiumSaathi.git
cd StadiumSaathi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

> ⚠️ **Important**: Never commit `.env.local` to version control. It is already excluded via `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build (optional)

```bash
npm run build
npm run start
```

---

## 🖥️ Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with navigation to Dashboard and Fan Portal |
| `/dashboard` | Organizer Operations Dashboard (gate telemetry, AI insights, incident management, broadcast) |
| `/fan` | Fan Companion Portal (interactive map, AI navigation, language switcher) |
| `/api/dashboard-insights` | POST — Gemini-powered crowd analysis for operations team |
| `/api/ai-recommendation` | POST — Gemini-powered step-by-step navigation directions |
| `/api/telemetry` | GET — Live gate and zone telemetry data |

---

## 🤖 AI Features

All Gemini API calls happen **server-side only** via Next.js API routes. The `GEMINI_API_KEY` is never exposed to the browser.

### Dashboard AI Insights (`/api/dashboard-insights`)
- Accepts live gate + zone telemetry and any active incident
- Returns: critical alerts, unique per-gate bottleneck recommendations, staffing advice, and a sustainability tip
- Gracefully falls back to rule-based static analysis if the API is unavailable

### Fan Navigation Advisor (`/api/ai-recommendation`)
- Accepts: source gate, destination zone, step-free requirement, sensory preference, locale
- Returns: numbered route steps, estimated walk time, and route warnings
- Directions are generated in the user's selected language (en/es/fr)
- Full prompt injection protection and input length validation

---

## ♿ Accessibility

- WCAG 2.1 Level AA compliant throughout
- All interactive elements keyboard-navigable with visible focus rings
- ARIA labels on all SVG map elements, buttons, and form controls
- `aria-live` regions for dynamic content (alerts, AI updates, broadcast banners)
- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`)
- Step-free routing mode on Fan Portal filters all map content to accessible-only paths

---

## 🌍 Internationalization

The language switcher (🇺🇸 / 🇪🇸 / 🇫🇷) is available on both the Dashboard and Fan Portal. All UI labels, form text, and AI-generated content are served in the selected locale.

Translation strings live in [`src/lib/translations.ts`](src/lib/translations.ts).

---

## 🔒 Security

- API key is server-side only; never sent to the client
- All user inputs are validated for length limits and prompt injection patterns
- `.env.local` is git-ignored; `.env.local.example` is provided as a template

---

## 📋 Testing

See [`docs/TESTING.md`](docs/TESTING.md) for the full manual test suite covering:
- TC-01: Landing page navigation
- TC-02 to TC-07: Dashboard features
- TC-08 to TC-12: Fan Portal features
- TC-13: Keyboard and accessibility
- TC-14: Security verification

---

## 📄 License

Built for the FIFA World Cup 2026 Hackathon. For demonstration and educational purposes.

---

*StadiumSaathi — Making every fan's journey smarter, safer, and more accessible.*
