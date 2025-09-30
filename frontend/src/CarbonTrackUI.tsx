import { useMemo, useState } from "react";

// ---- Types ----
type LogItem = {
  id: string;
  date: string; // ISO date
  category: "Electricity" | "Natural Gas" | "Transportation" | "Other";
  notes: string;
  amount: number; // e.g., kg CO₂e
};

// ---- Helpers ----
function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);
}

const CATEGORIES: LogItem["category"][] = [
  "Electricity",
  "Natural Gas",
  "Transportation",
  "Other",
];

const seed: LogItem[] = [
  { id: crypto.randomUUID(), date: "2025-09-20", category: "Electricity", notes: "Apartment usage", amount: 12.4 },
  { id: crypto.randomUUID(), date: "2025-09-22", category: "Transportation", notes: "Rideshare 8 mi", amount: 5.1 },
  { id: crypto.randomUUID(), date: "2025-09-23", category: "Natural Gas", notes: "Water heating", amount: 9.3 },
  { id: crypto.randomUUID(), date: "2025-09-27", category: "Transportation", notes: "Bus commute", amount: 2.2 },
  { id: crypto.randomUUID(), date: "2025-09-28", category: "Electricity", notes: "PC + AC", amount: 7.8 },
];

export default function CarbonTrackUI() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<"Dashboard" | "Logs" | "Tips">("Dashboard");
  const [logs, setLogs] = useState<LogItem[]>(seed);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<"All" | LogItem["category"]>("All");
  const [modalOpen, setModalOpen] = useState(false);

  const totals = useMemo(() => {
    const total = logs.reduce((s, l) => s + l.amount, 0);
    const byCat = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
      acc[c] = logs.filter((l) => l.category === c).reduce((s, l) => s + l.amount, 0);
      return acc;
    }, {});
    return { total, byCat };
  }, [logs]);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => (catFilter === "All" ? true : l.category === catFilter))
      .filter((l) =>
        query
          ? [l.notes, l.category, new Date(l.date).toLocaleDateString()].some((t) =>
              String(t).toLowerCase().includes(query.toLowerCase())
            )
          : true
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [logs, catFilter, query]);

  return (
    <div className="min-h-screen w-screen bg-gray-50 text-gray-900">
      {/* Top Nav */}
      <header className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-xl border px-3 py-2 hover:bg-gray-100"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">C</span>
              <span className="text-lg font-semibold">CarbonTrack</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="hidden sm:block w-56 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search logs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100">Help</button>
            <div className="h-8 w-8 rounded-full bg-emerald-600/10 ring-2 ring-emerald-600" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside
          className={`$${sidebarOpen ? "block" : "hidden"} md:block border-r bg-white px-4 py-6`}
        >
          <nav className="flex flex-col gap-2">
            {(["Dashboard", "Logs", "Tips"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                  active === tab
                    ? "bg-emerald-600 text-white shadow"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="mt-4 border-t pt-4 text-xs text-gray-500">Interface Demo</div>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-h-[70vh] bg-gray-50 p-4 md:p-6">
          {active === "Dashboard" && (
            <section className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Dashboard</h1>
                  <p className="text-sm text-gray-600">Quick stats for your footprint</p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700"
                >
                  + Add Log
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Total (30d)" value={`${fmt(totals.total)} kg CO₂e`} sub="Sum of all logs" />
                <Card title="Electricity" value={`${fmt(totals.byCat["Electricity"] || 0)}`} sub="kg CO₂e" />
                <Card title="Natural Gas" value={`${fmt(totals.byCat["Natural Gas"] || 0)}`} sub="kg CO₂e" />
                <Card title="Transportation" value={`${fmt(totals.byCat["Transportation"] || 0)}`} sub="kg CO₂e" />
              </div>

              {/* Fake Chart (placeholder) */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Emissions Over Time</h3>
                  <span className="text-xs text-gray-500">(placeholder chart)</span>
                </div>
                <div className="h-40 w-full rounded-xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50"></div>
              </div>

              {/* Recent table */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Recent Logs</h3>
                  <button
                    onClick={() => setActive("Logs")}
                    className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    View all
                  </button>
                </div>
                <LogsTable rows={filtered.slice(0, 6)} />
              </div>
            </section>
          )}

          {active === "Logs" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold">Logs</h1>
                  <p className="text-sm text-gray-600">Add, filter, and review entries</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value as any)}
                  >
                    <option>All</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    className="w-48 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Search…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    onClick={() => setModalOpen(true)}
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700"
                  >
                    + Add Log
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <LogsTable rows={filtered} />
              </div>
            </section>
          )}

          {active === "Tips" && (
            <section className="space-y-4">
              <h1 className="text-2xl font-semibold">Tips</h1>
              <ul className="grid gap-3 md:grid-cols-2">
                {[
                  {
                    t: "Electricity",
                    d: "Switch to LED bulbs and enable device sleep settings; batch your laundry + cold washes.",
                  },
                  {
                    t: "Natural Gas",
                    d: "Lower water heater temperature slightly and insulate hot-water pipes.",
                  },
                  {
                    t: "Transportation",
                    d: "Combine errands, pick transit for <5mi trips, and maintain proper tire pressure.",
                  },
                  {
                    t: "Other",
                    d: "Reduce food waste, choose lower-impact meals 2–3×/week, and compost organics.",
                  },
                ].map((x) => (
                  <li key={x.t} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-500">{x.t}</div>
                    <div className="mt-1 font-medium">{x.d}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <AddLogForm
            onSubmit={(newLog) => {
              setLogs((prev) => [
                { id: crypto.randomUUID(), ...newLog },
                ...prev,
              ]);
              setModalOpen(false);
            }}
          />
        </Modal>
      )}

      {/* Footer */}
      <footer className="mt-10 border-t bg-white/60">
        <div className="px-4 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} CarbonTrack • Demo interface
        </div>
      </footer>
    </div>
  );
}

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function LogsTable({ rows }: { rows: LogItem[] }) {
  if (!rows.length) return <div className="text-sm text-gray-500">No logs found.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="p-2 font-medium">Date</th>
            <th className="p-2 font-medium">Category</th>
            <th className="p-2 font-medium">Notes</th>
            <th className="p-2 font-medium text-right">Amount (kg CO₂e)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
              <td className="p-2"><span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-emerald-700">{r.category}</span></td>
              <td className="p-2">{r.notes}</td>
              <td className="p-2 text-right">{fmt(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[92vw] max-w-lg rounded-2xl border bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Log</h3>
          <button onClick={onClose} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddLogForm({ onSubmit }: { onSubmit: (log: Omit<LogItem, "id">) => void }) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<LogItem["category"]>("Electricity");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!date || !category || !amount || isNaN(amt)) return;
    onSubmit({ date, category, notes, amount: amt });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="grid gap-1">
        <label className="text-xs text-gray-600">Date</label>
        <input
          type="date"
          className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-gray-600">Category</label>
        <select
          className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-gray-600">Notes (optional)</label>
        <input
          placeholder="e.g., Laptop + AC"
          className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-gray-600">Amount (kg CO₂e)</label>
        <input
          type="number"
          step="0.1"
          placeholder="e.g., 3.5"
          className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button type="button" onClick={() => { setDate(new Date().toISOString().slice(0,10)); setCategory("Electricity"); setNotes(""); setAmount(""); }} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Reset</button>
        <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700">Save</button>
      </div>
    </form>
  );
}
