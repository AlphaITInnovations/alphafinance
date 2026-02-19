"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

const AREAS = [
  { key: "operations", label: "Operations", wip: true },
  { key: "solutions", label: "Solutions", wip: true },
  { key: "alphaconsult", label: "AlphaConsult Gruppe", wip: false },
] as const;

const NAV_ITEMS = [
  { href: "/alphaconsult", label: "Dashboard" },
  { href: "/alphaconsult/kostenuebersicht", label: "Kostenübersicht" },
  { href: "/alphaconsult/vertraege", label: "Verträge" },
  { href: "/alphaconsult/einmalige-kosten", label: "Einmalige Kosten" },
  { href: "/alphaconsult/consulting", label: "Consulting" },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-bold text-white">AlphaFinance</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/60">
            Finanzverwaltung
          </span>
        </Link>
      </div>

      {/* Area Selector */}
      <div className="border-b border-sidebar-border px-3 pb-3">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Bereich
        </div>
        {AREAS.map((a) =>
          a.wip ? (
            <div
              key={a.key}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground/30 cursor-not-allowed"
            >
              <span>{a.label}</span>
              <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-medium text-sidebar-foreground/40">
                WIP
              </span>
            </div>
          ) : (
            <Link
              key={a.key}
              href="/alphaconsult/kostenuebersicht"
              className="flex items-center rounded-lg px-3 py-1.5 text-sm font-medium bg-sidebar-accent text-sidebar-primary"
            >
              {a.label}
            </Link>
          ),
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary"
        >
          {theme === "light" ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          )}
          Theme wechseln
        </button>
        <div className="mt-2 px-3 text-xs text-sidebar-foreground/40">
          Alpha IT Innovations GmbH
        </div>
      </div>
    </aside>
  );
}
