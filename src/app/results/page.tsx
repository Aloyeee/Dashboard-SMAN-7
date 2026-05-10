"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Brain, Smartphone, Settings } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ── Colour tokens ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  "Tidak/Sedikit Kecanduan": "#1D9E75",
  "Kecanduan Borderline":    "#EF9F27",
  "Kemungkinan Kecanduan":   "#E05C5C",
};
const SDQ_COLORS: Record<string, string> = {
  Normal: "#1D9E75", Borderline: "#EF9F27", Abnormal: "#E05C5C",
};
const BLUE = "#378ADD";
const PURPLE = "#9B6CF7";

interface Stats {
  summary: { totalRespondents: number; avgIAA: number; avgSDQDifficulties: number; totalKelas: number };
  iaaStatusChart: { name: string; value: number }[];
  iaaByClassChart: { kelas: string; avgScore: number }[];
  sdqCategoryChart: { name: string; value: number }[];
  sdqByClassChart: { kelas: string; avgDifficulties: number }[];
  sdqSubscaleChart: { name: string; avg: number }[];
}

// ── Reusable card ──────────────────────────────────────────────
function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 mb-3">{sub}</p>}
      {!sub && <div className="mb-3" />}
      {children}
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────────────
function Stat({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold tracking-tight mt-1 ${color ?? "text-gray-800"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── SDQ section ────────────────────────────────────────────────
function SDQSection({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Total Kesulitan SDQ" sub="Distribusi kategori kesehatan mental">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.sdqCategoryChart} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {stats.sdqCategoryChart.map((e, i) => (
                  <Cell key={i} fill={SDQ_COLORS[e.name] ?? "#ccc"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Distribusi per Subskala" sub="Rata-rata 5 subskala SDQ">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={stats.sdqSubscaleChart} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <Radar dataKey="avg" stroke={BLUE} fill={BLUE} fillOpacity={0.25} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Rata-rata Kesulitan SDQ per Kelas" sub="Total difficulties per kelas">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.sdqByClassChart} margin={{ left: -10 }}>
            <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
            <Tooltip formatter={(v: any) => [`${v}`, "Avg Kesulitan"]} />
            <Bar dataKey="avgDifficulties" fill={PURPLE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── IAA section ────────────────────────────────────────────────
function IAASection({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Status Kecanduan Internet" sub="Distribusi kategori IAA">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.iaaStatusChart} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {stats.iaaStatusChart.map((e, i) => (
                  <Cell key={i} fill={STATUS_COLORS[e.name] ?? "#ccc"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Rata-rata Skor IAA" sub="Skala 0–72">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.iaaByClassChart} margin={{ left: -10 }}>
              <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 72]} />
              <Tooltip formatter={(v: any) => [`${v}`, "Avg Skor IAA"]} />
              <Bar dataKey="avgScore" fill={BLUE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Perbandingan Skor IAA per Kelas" sub="Rata-rata skor kecanduan internet tiap kelas">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.iaaByClassChart} margin={{ left: -10 }}>
            <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 72]} />
            <Tooltip formatter={(v: any) => [`${v}`, "Avg IAA"]} />
            <Bar dataKey="avgScore" fill="#EF9F27" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [tab, setTab] = useState<"sdq" | "iaa">("sdq");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); else setError(d.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400 animate-pulse">Memuat…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">Hasil Skrining</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/"
            className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Home
          </a>
          <a href="/results"
            className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Dashboard
          </a>
          {isAdmin ? (
            <a href="/dashboard"
              className="text-xs font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ⚙ Panel Admin
            </a>
          ) : (
            <a href="/signin"
              className="text-xs font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Login Admin
            </a>
          )}
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="max-w-screen-lg mx-auto px-6 py-8">

        {/* ── Summary scorecards ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat label="Total Responden" value={stats.summary.totalRespondents} sub="siswa" />
            <Stat label="Jumlah Kelas" value={stats.summary.totalKelas} sub="kelas" />
            <Stat label="Rata-rata Skor IAA" value={stats.summary.avgIAA} sub="dari 72"
              color={stats.summary.avgIAA >= 50 ? "text-red-600" : stats.summary.avgIAA >= 31 ? "text-amber-500" : "text-green-600"} />
            <Stat label="Avg Kesulitan SDQ" value={stats.summary.avgSDQDifficulties} sub="dari 40"
              color={stats.summary.avgSDQDifficulties > 19 ? "text-red-600" : stats.summary.avgSDQDifficulties > 15 ? "text-amber-500" : "text-green-600"} />
          </div>
        )}

        {/* ── Tab buttons ── */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("sdq")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              tab === "sdq"
                ? "bg-white border-blue-400 text-blue-700 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <span>🧠</span> SDQ Kemenkes
          </button>
          <button onClick={() => setTab("iaa")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              tab === "iaa"
                ? "bg-white border-blue-400 text-blue-700 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <span>📱</span> IAA
          </button>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-gray-400 animate-pulse">Memuat data dari Google Sheets…</div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <strong>Gagal memuat data:</strong> {error}
          </div>
        )}

        {/* ── Chart content ── */}
        {stats && !loading && (
          tab === "sdq" ? <SDQSection stats={stats} /> : <IAASection stats={stats} />
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400 mt-12">
        Dashboard Kesehatan Mental Siswa · Data bersumber dari Google Sheets
      </footer>
    </div>
  );
}
