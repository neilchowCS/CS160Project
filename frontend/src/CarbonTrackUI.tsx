import { useMemo, useState, useEffect } from "react";
import { ECO_TIPS, ECO_CHALLENGES } from "./data/ecoTips";
import { Link } from "react-router-dom";
import { FUN_FACTS } from "./data/FunFacts";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
    Tooltip
} from 'recharts';

const API = import.meta.env.VITE_API_BASE || "http://localhost:5001";
const getToken = () => localStorage.getItem("jwt") || "";

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
  const [user, setUser] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<"Dashboard" | "Logs" | "Tips & Challenges" | "Recommendations" | "Leaderboard" | "Fun Facts">("Dashboard");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<"All" | LogItem["category"]>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState<{count: number; completedToday: boolean} | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  function requestDelete(id: string) {
    setDeleteTargetId(id);
  }
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/challenges/status`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const j = await res.json();
                setChallengeStatus({ count: j.challengeCount || 0, completedToday: !!j.completedToday });
        }
      } catch {}
    })();
  }, []);

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
          date: r.date.slice(0,10),
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

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setUser(null);
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);
  const avatarSrc = user?.avatar_url || null;

  async function completeToday() {
    try {
      const res = await fetch(`${API}/api/challenges/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const j = await res.json();
      if (res.ok) {
        setChallengeStatus({ count: j.challengeCount || 0, completedToday: !!j.completedToday });
      } else {
        console.error(j.error || "Could not complete challenge");
      }
    } catch {
      alert("Network error");
    }
  }


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

  const chartData = useMemo(() => {
    return [...(filtered ?? [])]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((log) => ({
        date: log.date,
        emissions: log.amount,
      }));
  }, [filtered]);

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
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">E</span>
              <span className="text-lg font-semibold">EcoTrackers</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="hidden sm:block w-56 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search logs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Link
              to="/help"
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
            >
              Help
            </Link>
            <Link
              to="/profile"
              title="Open profile"
              aria-label="Open profile"
              className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border border-emerald-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
                  <span className="text-xl text-emerald-700" role="img" aria-label="profile">
                    👤
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside
                    className={`${sidebarOpen ? "block" : "hidden"} md:block border-r bg-white px-4 py-6`}
                >
                    <nav className="flex flex-col gap-2">
                        {(["Dashboard", "Logs", "Tips & Challenges", "Recommendations", "Leaderboard", "Fun Facts"] as const).map((tab) => (
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

                            {/* Chart */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Emissions Over Time</h3>
                                    <span className="text-xs text-gray-500">auto-adjusting chart</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={8}
                        interval="preserveEnd"
                      />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                domain={['auto', 'auto']}
                                            />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="emissions"
                        stroke="#059669"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
                {/* Full list is deletable */}
                <LogsTable rows={filtered} onDeleteClick={requestDelete} />
              </div>
            </section>
          )}

          {active === "Tips & Challenges" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Tips & Challenges</h1>
                <div className="text-sm text-gray-600">
                                Completed: <span className="font-semibold">{challengeStatus?.count ?? 0}</span>
                </div>
              </div>

                            {/* Challenge of the Day card */}
              <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-0 shadow-sm">
                <div className="flex items-center justify-between rounded-t-2xl border-b border-emerald-100/70 bg-emerald-100/60 px-4 py-2">
                                <div className="text-xs font-semibold tracking-wide text-emerald-900/80">CHALLENGE OF THE DAY</div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200/70">
                    <span className="opacity-80">Completed:</span>
                                <span className="font-semibold">{challengeStatus?.count ?? 0}</span>
                  </div>
                </div>
                <div className="px-4 py-4">
                  {(() => {
                    const idx = new Date().getDate() % ECO_CHALLENGES.length;
                    const c = ECO_CHALLENGES[idx];
                    return (
                      <>
                        <div className="flex items-start gap-3">
                                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">🏆</div>
                          <div>
                                        <div className="text-lg font-semibold text-emerald-900">{c.title}</div>
                                        <div className="mt-1 text-sm text-emerald-800/80">{c.desc}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <label className="inline-flex select-none items-center gap-2 text-sm text-emerald-900/90">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                              checked={!!challengeStatus?.completedToday}
                              onChange={completeToday}
                              disabled={!!challengeStatus?.completedToday}
                            />
                                        {challengeStatus?.completedToday ? "Completed today" : "Mark as completed"}
                          </label>

                          <button
                            onClick={completeToday}
                            disabled={!!challengeStatus?.completedToday}
                            className={[
                              "rounded-2xl px-4 py-1.5 text-sm shadow-sm transition",
                              challengeStatus?.completedToday
                                ? "bg-gray-100 text-gray-500"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]"
                            ].join(" ")}
                          >
                                        {challengeStatus?.completedToday ? "Done" : "Complete"}
                          </button>

                          {challengeStatus?.completedToday && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                              ✓ Saved to your account
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Eco Tips */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Eco Tips</h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {ECO_TIPS.map((tip, i) => (
                                <li key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
                      <div className="mt-1 font-medium">{tip}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
                  )}

                  {active === "Recommendations" && (
                      <section className="space-y-6">
                          <div className="flex items-center justify-between gap-3">
                              <h1 className="text-2xl font-semibold">Recommendations</h1>
                          </div>

                          <div className="rounded-2xl border bg-white p-4 shadow-sm">
                              <Recommendations />
                          </div>
                      </section>
                  )}

          {active === "Fun Facts" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Fun Facts</h1>
                <span className="text-sm text-gray-600">Quick eco & footprint nuggets</span>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {FUN_FACTS.map((fact, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-emerald-50 bg-emerald-50/40 p-3"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">🌿</div>
                      <div className="text-sm leading-relaxed text-emerald-900/90">{fact}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
                        {active === "Leaderboard" && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between gap-3">
                                    <h1 className="text-2xl font-semibold">Leaderboard</h1>
                                    <p className="text-sm text-gray-600">Compare your impact with others</p>
                                </div>

                                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <Leaderboard />
                                </div>
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
                    Authorization: `Bearer ${getToken()}`,
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
              }
            }}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Delete Log</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this log entry?
            </p>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl border px-4 py-2 hover:bg-gray-50"
                disabled={deleteSaving}
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-red-500 text-white px-4 py-2 font-semibold hover:bg-red-600 disabled:opacity-60"
                disabled={deleteSaving}
                onClick={async () => {
                  try {
                    setDeleteSaving(true);
                    const res = await fetch(
                      `${API}/api/logs/${deleteTargetId}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${getToken()}` },
                      }
                    );
                    if (!res.ok) {
                      const d = await res.json().catch(() => ({}));
                      throw new Error(d?.error || "Failed to delete log");
                    }
                    setLogs((prev) =>
                      prev.filter((l) => l.id !== deleteTargetId)
                    );
                    setDeleteTargetId(null);
                  } catch (e: any) {
                    alert(e?.message || "Failed to delete log");
                  } finally {
                    setDeleteSaving(false);
                  }
                }}
              >
                {deleteSaving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-10 border-t bg-white/60">
        <div className="px-4 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} EcoTrackers • Demo interface
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

function LogsTable({
  rows,
  onDeleteClick,
}: {
  rows: LogItem[];
  onDeleteClick?: (id: string) => void;
}) {
  if (!rows.length)
    return <div className="text-sm text-gray-500">No logs found.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="p-2 font-medium">Date</th>
            <th className="p-2 font-medium">Category</th>
            <th className="p-2 font-medium">Notes</th>
            <th className="p-2 font-medium text-right">Amount (kg CO₂e)</th>
            {onDeleteClick && (
              <th className="p-2 font-medium text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
                            <td className="p-2">{r.date}</td>
                            <td className="p-2"><span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-emerald-700">{r.category}</span></td>
              <td className="p-2">{r.notes}</td>
              <td className="p-2 text-right">
                {r.amount == null ? "—" : fmt(r.amount)}
              </td>

              {onDeleteClick && (
                <td className="p-2 text-right">
                  <button
                    className="rounded-xl bg-red-500 px-3 py-1 text-white text-xs hover:bg-red-600"
                    onClick={() => onDeleteClick(r.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
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
    const [category, setCategory] = useState<LogItem["category"]>("Transportation");
  const [notes, setNotes] = useState("");
    const [transportMode, setTransportMode] = useState<LogItem["transportMode"]>(null);
  const [transportDistance, setTransportDistance] = useState<string>("");
    const [electricityCategory, setelectricityCategory] = useState<string | null>(null);
  const [electricityDuration, setelectricityDuration] = useState<string>("");
    const [naturalGasCategory, setNaturalGasCategory] = useState<string | null>(null);
    const [naturalGasDuration, setNaturalGasDuration] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: any = { date, category, notes };

    if (category === "Transportation") {
      if (!transportMode) return;
      if (!transportDistance || isNaN(Number(transportDistance))) return;
      payload.transportMode = transportMode;
      payload.transportDistance = Number(transportDistance);
    }

    if (category === "Electricity") {
      if (!electricityCategory) return;
      const hrs = electricityDuration === "" ? null : Number(electricityDuration);
      if (hrs == null || Number.isNaN(hrs)) return;

      payload.electricityCategory = electricityCategory;
      payload.electricityDuration = hrs;
    }
    if (category === "Natural Gas") {
      if (!naturalGasCategory) return;
      const hrs = naturalGasDuration === "" ? null : Number(naturalGasDuration);
      if (hrs == null || Number.isNaN(hrs)) return;

      payload.naturalGasCategory = naturalGasCategory;
      payload.naturalGasDuration = hrs;
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
            if (v !== "Electricity") {
              setelectricityCategory(null);
              setelectricityDuration("");
            }
            if (v !== "Natural Gas") {
              setNaturalGasCategory(null);
              setNaturalGasDuration("");
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
            <label className="text-xs text-gray-600">Miles Traveled</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 5.0"
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={transportDistance}
              onChange={(e) => setTransportDistance(e.target.value)}
            />
          </div>
        </>
      )}

      {category === "Electricity" && (
        <>
          <div className="grid gap-1">
            <label className="text-xs text-gray-600">Electricity Type</label>
            <select
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={electricityCategory ?? ""}
                            onChange={(e) => setelectricityCategory((e.target.value || null) as any)}
            >
              <option value="">Select type…</option>
              <option value="light">Light</option>
              <option value="device">Device</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-gray-600">Hours used</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 5.0"
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={electricityDuration}
              onChange={(e) => setelectricityDuration(e.target.value)}
            />
          </div>
        </>
      )}

      {category === "Natural Gas" && (
        <>
          <div className="grid gap-1">
            <label className="text-xs text-gray-600">Natural Gas Type</label>
            <select
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={naturalGasCategory ?? ""}
              onChange={(e) => setNaturalGasCategory((e.target.value || null) as any)}
            >
              <option value="">Select type…</option>
              <option value="heating">Heating</option>
              <option value="water_heating">Water Heating</option>
              <option value="cooking">Cooking</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-gray-600">Hours used</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 5.0"
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={naturalGasDuration}
              onChange={(e) => setNaturalGasDuration(e.target.value)}
            />
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
            setelectricityCategory(null);
            setelectricityDuration("");
            setNaturalGasCategory(null);
            setNaturalGasDuration("");
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

function Leaderboard() {
    const [leaders, setLeaders] = useState<
        { username: string; avgEmissions: number; rank: number; avatar_url?: string | null }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/api/leaderboard`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (!res.ok) throw new Error("Failed to fetch leaderboard");
                const data = await res.json();
                const sorted = data
                    .sort((a: any, b: any) => a.avgEmissions - b.avgEmissions)
                    .map((u: any, i: number) => ({ ...u, rank: i + 1 }));
                setLeaders(sorted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div className="text-sm text-gray-500">Loading leaderboard…</div>;
    if (!leaders.length) return <div className="text-sm text-gray-500">No data available.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b bg-gray-50 text-left">
                        <th className="p-2 font-medium w-12 text-center">Rank</th>
                        <th className="p-2 font-medium">User</th>
                        <th className="p-2 font-medium text-right">Average CO₂e (kg) per day (Last 30 days)</th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map((u) => (
                        <tr
                            key={u.username}
                            className={`border-b last:border-0 ${
                                u.rank <= 3 ? "bg-emerald-50/50" : ""
                            }`}
                        >
                            <td className="p-2 text-center font-semibold text-emerald-700">
                                {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : u.rank}
                            </td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    {u.avatar_url ? (
                                        <img
                                            src={u.avatar_url}
                                            alt={u.username}
                                            className="w-8 h-8 rounded-full object-cover border border-emerald-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 border border-emerald-200">
                                            {u.username?.charAt(0) ?? "?"}
                                        </div>
                                    )}
                                    <span>{u.username}</span>
                                </div>
                            </td>
                            <td className="p-2 text-right">{fmt(u.avgEmissions)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Recommendations() {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [loading, setLoading] = useState(true);

    const NATIONAL_AVERAGES: Record<LogItem["category"], number> = {
        Transportation: 450,
        Electricity: 320,
        "Natural Gas": 250,
        Other: 0,
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/api/logs`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (!res.ok) throw new Error("Failed to fetch logs");
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
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const totals = useMemo(() => {
        return CATEGORIES.reduce<Record<string, number>>((acc, c) => {
            acc[c] = logs
                .filter((l) => l.category === c)
                .reduce((s, l) => s + (l.amount ?? 0), 0);
            return acc;
        }, {});
    }, [logs]);

    const aboveAvgCategories = CATEGORIES.filter(
        (cat) => cat !== "Other" && (totals[cat] || 0) > NATIONAL_AVERAGES[cat]
    );

    let blurb = "";
    if (aboveAvgCategories.length === 0) {
        blurb = "Awesome! Your carbon footprint in all tracked categories is below the national average.";
    } else {
        blurb = `You are above the national average in ${aboveAvgCategories
            .map((c) => c.toLowerCase())
            .join(", ")}. Consider taking steps to reduce your emissions in these areas.`;
    }

    if (loading) return <div className="text-sm text-gray-500">Loading recommendations…</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">How you compare</h2>
            <p className="text-sm text-gray-600">{blurb}</p>

            {CATEGORIES.map((cat) => {
                if (cat === "Other") return null; 
                const userValue = totals[cat] || 0;
                const national = NATIONAL_AVERAGES[cat];
                const diff = userValue - national;
                const percent = national ? ((diff / national) * 100).toFixed(0) : "0";

                let summary = "";
                if (diff > 0) {
                    summary = `You're ${percent}% above the national average in ${cat.toLowerCase()}. Consider reducing usage.`;
                } else if (diff < 0) {
                    summary = `Great job! You're ${Math.abs(percent)}% below the national average in ${cat.toLowerCase()}.`;
                } else {
                    summary = `You're right at the national average in ${cat.toLowerCase()}.`;
                }

                return (
                    <div key={cat} className="rounded-2xl border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">{cat}</div>
                            <div className="text-sm text-gray-600">{fmt(userValue)} kg CO₂e</div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{summary}</div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-emerald-600"
                                style={{
                                    width: `${Math.min((userValue / national) * 100, 100)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
