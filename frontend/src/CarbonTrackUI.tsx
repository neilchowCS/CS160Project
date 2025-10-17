import { useMemo, useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token") || "";

// ---- Types ----
type LogItem = {
  id: string;
  date: string;
  category: "Electricity" | "Natural Gas" | "Transportation" | "Other";
  notes: string;
  amount: number | null;

  transportMode?: "car" | "bus" | "train" | "subway" | "rideshare" | "bike" | "walk" | "e-scooter" | "other" | null;
  transportDistance?: number | null;
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

export default function CarbonTrackUI() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<"Dashboard" | "Logs" | "Tips">("Dashboard");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<"All" | LogItem["category"]>("All");
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
  (async () => {
    try {
      const res = await fetch(`${API}/api/logs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to load logs");
      const rows = await res.json();
      const mapped = rows.map((r: any) => ({
        id: r._id,
        date: new Date(r.date).toISOString().slice(0, 10),
        category: r.category,
        notes: r.notes || "",
        amount: r.amount == null ? null : Number(r.amount),
        transportMode: r.transportMode ?? null,
        transportDistance: r.transportDistance ?? null,
      })) as LogItem[];
      setLogs(mapped);
    } catch (e) {
      console.error(e);
    }
  })();
}, []);

  const totals = useMemo(() => {
  const total = logs.reduce((s, l) => s + (l.amount ?? 0), 0);
  const byCat = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c] = logs
      .filter((l) => l.category === c)
      .reduce((s, l) => s + (l.amount ?? 0), 0);
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
          className={`${sidebarOpen ? "block" : "hidden"} md:block border-r bg-white px-4 py-6`}
        >
          <nav className="flex flex-col gap-2">
            {(["Dashboard", "Logs", "Tips"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition
                  ${active === tab
                    ? "bg-emerald-600 text-white shadow border border-emerald-600"
                    : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100 hover:text-gray-900"
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
  onSubmit={async (payload) => {
    try {
      const res = await fetch(`${API}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`, // dev shim ignores this
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save log");
      const saved = await res.json();
      const mapped: LogItem = {
        id: saved._id,
        date: new Date(saved.date).toISOString().slice(0, 10),
        category: saved.category,
        notes: saved.notes || "",
        amount: saved.amount == null ? null : Number(saved.amount),
        transportMode: saved.transportMode ?? null,
        transportDistance: saved.transportDistance ?? null,
      };
      setLogs((prev) => [mapped, ...prev]);
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      // TODO: show toast/inline error if you want
    }
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
              <td className="p-2 text-right">{r.amount == null ? "—" : fmt(r.amount)}</td>
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

function AddLogForm({ onSubmit }: { onSubmit: (log: any) => void }) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<LogItem["category"]>("Electricity");
  const [notes, setNotes] = useState("");
  // removed amount input
  const [transportMode, setTransportMode] = useState<LogItem["transportMode"]>(null);
  const [transportDistance, setTransportDistance] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: any = { date, category, notes };

    if (category === "Transportation") {
      if (!transportMode) return; // you can show a validation message if you want
      if (!transportDistance || isNaN(Number(transportDistance))) return;
      payload.transportMode = transportMode;
      payload.transportDistance = Number(transportDistance);
    }

    onSubmit(payload);
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
          onChange={(e) => {
            const v = e.target.value as LogItem["category"];
            setCategory(v);
            if (v !== "Transportation") {
              setTransportMode(null);
              setTransportDistance("");
            }
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {category === "Transportation" && (
        <>
          <div className="grid gap-1">
            <label className="text-xs text-gray-600">Mode of Transportation</label>
            <select
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={transportMode ?? ""}
              onChange={(e) => setTransportMode((e.target.value || null) as any)}
            >
              <option value="">Select a mode…</option>
              <option value="car">Car</option>
              <option value="rideshare">Rideshare</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="subway">Subway</option>
              <option value="bike">Bike</option>
              <option value="walk">Walk</option>
              <option value="e-scooter">E-scooter</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-gray-600">Distance Traveled</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 5.0"
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={transportDistance}
              onChange={(e) => setTransportDistance(e.target.value)}
            />
            {/* Unit toggle (mi/km) can be added later */}
          </div>
        </>
      )}

      <div className="grid gap-1">
        <label className="text-xs text-gray-600">Notes (optional)</label>
        <input
          placeholder="e.g., commute to campus"
          className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setDate(new Date().toISOString().slice(0, 10));
            setCategory("Electricity");
            setNotes("");
            setTransportMode(null);
            setTransportDistance("");
          }}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset
        </button>
        <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700">
          Save
        </button>
      </div>
    </form>
  );
}

