import React from "react";
import Link from "next/link";

/**
 * Root Landing Page for StadiumSaathi.
 * Serves as the portal gateway for both operations staff and fans.
 * Meets WCAG 2.1 AA and features a premium dark glassmorphic layout.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#060B26] text-slate-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Content Container */}
      <main className="z-10 w-full max-w-4xl px-6 py-12 text-center flex flex-col items-center gap-10">
        
        {/* Branding header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4.5 py-1.5 text-sm font-semibold tracking-wide text-sky-400">
            <span>⚽</span> FIFA World Cup 2026 Companion Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight bg-clip-text">
            StadiumSaathi
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-400 font-medium">
            Intelligent operations telemetry and real-time navigation helper designed for multi-jurisdictional host venues in Canada, Mexico, and the United States.
          </p>
        </header>

        {/* Portal Entry Options Grid */}
        <section aria-label="Portal Entry Options" className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-4">
          
          {/* Dashboard Entry */}
          <article className="group rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 p-8 text-left transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-sky-500/5 relative flex flex-col justify-between min-h-[220px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">📈</span>
                <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Operational
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                Organizer Dashboard
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Central command room for stadium managers. Monitor real-time gate wait times, track zone densities, dispatch staff, and manage active incident alerts.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm px-5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                aria-label="Access the Organizer Dashboard"
              >
                Launch Dashboard →
              </Link>
            </div>
          </article>

          {/* Fan Companion Entry */}
          <article className="group rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 p-8 text-left transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/5 relative flex flex-col justify-between min-h-[220px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">🗺️</span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Attendee Companion
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Fan Mobile Portal
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Turn-by-turn step-free routing, real-time shuttle transit departure boards, multilingual helpers, and zero-waste sustainability classifiers.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/fan"
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-sm px-5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                aria-label="Access the Fan Mobile Portal"
              >
                Launch Fan Portal →
              </Link>
            </div>
          </article>

        </section>

      </main>

      {/* Footer copyright */}
      <footer className="z-10 mt-auto py-6 text-xs text-slate-500">
        <p>© 2026 FIFA World Cup Operations Companion. Designed for Canada, Mexico, & USA Host Venues.</p>
      </footer>
    </div>
  );
}
