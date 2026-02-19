export default function Home() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Willkommen bei AlphaFinance — Ihre Finanzübersicht
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Einnahmen (Monat)"
          value="€ 0,00"
          icon={
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          }
        />
        <StatCard
          title="Ausgaben (Monat)"
          value="€ 0,00"
          icon={
            <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
            </svg>
          }
        />
        <StatCard
          title="Offene Rechnungen"
          value="0"
          icon={
            <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
        />
        <StatCard
          title="Bilanz"
          value="€ 0,00"
          icon={
            <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
      </div>

      {/* Placeholder Content */}
      <div className="mt-8 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-card-foreground">
          Letzte Transaktionen
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Noch keine Transaktionen vorhanden.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-petrol-superlight">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
      </div>
    </div>
  );
}
