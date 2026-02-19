"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop Sidebar */}
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

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Übersicht
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
            Dashboard
          </Link>

          <div className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Finanzen
          </div>
          <SidebarLink href="/rechnungen" label="Rechnungen" badge="Coming Soon" />
          <SidebarLink href="/ausgaben" label="Ausgaben" badge="Coming Soon" />
          <SidebarLink href="/berichte" label="Berichte" badge="Coming Soon" />
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
    </>
  );
}

function SidebarLink({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary"
    >
      <span>{label}</span>
      {badge && (
        <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-medium text-sidebar-foreground/60">
          {badge}
        </span>
      )}
    </Link>
  );
}
