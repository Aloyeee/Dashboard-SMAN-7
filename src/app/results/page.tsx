"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Brain, Smartphone } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import {
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { sdqRangeLabel, iaaRangeLabel, iaaValueColor, sdqValueColor } from "@/lib/labels";

// ── Colors ─────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  "Tidak/Sedikit Kecanduan": "#1D9E75",
  "Kecanduan Borderline":    "#EF9F27",
  "Kemungkinan Kecanduan":   "#E05C5C",
  "Kecanduan Signifikan":    "#991B1B",
};
const SDQ_COLORS: Record<string, string> = {
  Normal: "#1D9E75", Borderline: "#EF9F27", Abnormal: "#E05C5C",
};
const BLUE   = "#378ADD";
const PURPLE = "#9B6CF7";

interface Stats {
  summary: {
    totalRespondents: number; totalKelas: number;
    avgIAA: number; iaaStatusLabel: string;
    avgSDQDifficulties: number; sdqCategoryLabel: string;
  };
  iaaStatusChart:   { name: string; value: number }[];
  iaaByClassChart:  { kelas: string; avgScore: number; [key: string]: any }[];
  sdqCategoryChart: { name: string; value: number }[];
  sdqByClassChart:  { kelas: string; avgDifficulties: number }[];
  sdqSubscaleChart: { name: string; avg: number }[];
}

// ── Shared components ──────────────────────────────────────────
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

// ── SDQ section ────────────────────────────────────────────────
function SDQSection({ stats }: { stats: Stats }) {
  const totalSDQ = stats.sdqCategoryChart.reduce((a, b) => a + b.value, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Donut */}
        <Card title="Total Kesulitan SDQ" sub="Distribusi kategori kesehatan mental (Kemenkes)">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.sdqCategoryChart} dataKey="value" nameKey="name"
                cx="50%" cy="45%" innerRadius={70} outerRadius={100}
                startAngle={90} endAngle={-270} paddingAngle={2}
                labelLine={false} label={false}>
                {stats.sdqCategoryChart.map((e, i) => (
                  <Cell key={i} fill={SDQ_COLORS[e.name] ?? "#ccc"} stroke="none" />
                ))}
              </Pie>
              <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle">
                <tspan x="50%" dy="-0.4em" fontSize="32" fontWeight="700" fill="#111827">{totalSDQ}</tspan>
                <tspan x="50%" dy="1.6em"  fontSize="12" fill="#6b7280">Peserta</tspan>
              </text>
              <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar */}
        <Card title="Distribusi per Subskala" sub="Rata-rata 5 subskala SDQ">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={stats.sdqSubscaleChart} cx="50%" cy="50%" outerRadius={85}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <Radar dataKey="avg" stroke={BLUE} fill={BLUE} fillOpacity={0.25} name="Rata-rata" />
              <Tooltip formatter={(v: any) => [v, "Rata-rata"]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bar per class */}
      <Card title="Rata-rata Kesulitan SDQ per Kelas"
        sub="Skala Kemenkes 0–40 · Normal ≤15 · Borderline 16–19 · Abnormal ≥20">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.sdqByClassChart} margin={{ left: -10, top: 4 }}>
            <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
            <Tooltip formatter={(v: any) => [`${v}`, "Avg Kesulitan"]} labelFormatter={l => `Kelas: ${l}`} />
            <Bar dataKey="avgDifficulties" fill={PURPLE} radius={[4, 4, 0, 0]} name="Avg Kesulitan" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── IAA section ────────────────────────────────────────────────
function IAASection({ stats }: { stats: Stats }) {
  const totalIAA = stats.iaaStatusChart.reduce((a, b) => a + b.value, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Donut */}
        <Card title="Status Kecanduan Internet" sub="Distribusi kategori IAA">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.iaaStatusChart} dataKey="value" nameKey="name"
                cx="50%" cy="45%" innerRadius={70} outerRadius={100}
                startAngle={90} endAngle={-270} paddingAngle={2}
                labelLine={false} label={false}>
                {stats.iaaStatusChart.map((e, i) => (
                  <Cell key={i} fill={STATUS_COLORS[e.name] ?? "#ccc"} stroke="none" />
                ))}
              </Pie>
              <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle">
                <tspan x="50%" dy="-0.4em" fontSize="32" fontWeight="700" fill="#111827">{totalIAA}</tspan>
                <tspan x="50%" dy="1.6em"  fontSize="12" fill="#6b7280">Peserta</tspan>
              </text>
              <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Avg score per class */}
        <Card title="Rata-rata Skor IAA per Kelas" sub="Skala 0–72">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.iaaByClassChart} margin={{ left: -10, top: 4 }}>
              <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 72]} />
              <Tooltip formatter={(v: any) => [`${v}`, "Avg Skor IAA"]} labelFormatter={l => `Kelas: ${l}`} />
              <Bar dataKey="avgScore" fill={BLUE} radius={[4, 4, 0, 0]} name="Avg Skor IAA" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Grouped bar — status count per class (matches picture) */}
      <Card
        title="Distribusi Skor Tingkat Kecanduan Internet Berdasarkan Kelas"
        sub="Jumlah siswa per kategori kecanduan internet tiap kelas"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.iaaByClassChart} margin={{ left: -10, top: 4 }} barCategoryGap="20%" barGap={2}>
            <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              formatter={(v: any, n: any) => [`${v} siswa`, n]}
              labelFormatter={(l) => `Kelas: ${l}`}
            />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Tidak/Sedikit Kecanduan" name="Tidak/Sedikit Kecanduan" fill={STATUS_COLORS["Tidak/Sedikit Kecanduan"]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Kecanduan Borderline"    name="Kecanduan Borderline"    fill={STATUS_COLORS["Kecanduan Borderline"]}    radius={[3, 3, 0, 0]} />
            <Bar dataKey="Kemungkinan Kecanduan"   name="Kemungkinan Kecanduan"   fill={STATUS_COLORS["Kemungkinan Kecanduan"]}   radius={[3, 3, 0, 0]} />
            <Bar dataKey="Kecanduan Signifikan"    name="Kecanduan Signifikan"    fill={STATUS_COLORS["Kecanduan Signifikan"]}    radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [tab, setTab]     = useState<"sdq" | "iaa">("sdq");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); else setError(d.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar session={session ?? null} status={status} />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stat cards — with Kemenkes range labels */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Responden" value={stats.summary.totalRespondents} sub="siswa" />
            <StatCard label="Jumlah Kelas" value={stats.summary.totalKelas} sub="kelas" />
            <StatCard
              label="Rata-rata Skor IAA"
              value={stats.summary.avgIAA}
              sub={iaaRangeLabel(stats.summary.iaaStatusLabel)}
              valueColor={iaaValueColor(stats.summary.iaaStatusLabel)}
              subColor={iaaValueColor(stats.summary.iaaStatusLabel)}
            />
            <StatCard
              label="Rata-rata Kesulitan SDQ"
              value={stats.summary.avgSDQDifficulties}
              sub={sdqRangeLabel(stats.summary.sdqCategoryLabel)}
              valueColor={sdqValueColor(stats.summary.sdqCategoryLabel)}
              subColor={sdqValueColor(stats.summary.sdqCategoryLabel)}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["sdq", "iaa"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                tab === t
                  ? "bg-white border-blue-400 text-blue-700 shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {t === "sdq" ? (
                <><Brain className="h-4 w-4" /> SDQ Kemenkes</>
              ) : (
                <><Smartphone className="h-4 w-4" /> IAA</>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-gray-400 animate-pulse">Memuat data dari Google Sheets…</div>
          </div>
        )}
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <strong>Gagal memuat data:</strong> {error}
          </div>
        )}
        {stats && !loading && (
          tab === "sdq" ? <SDQSection stats={stats} /> : <IAASection stats={stats} />
        )}
      </div>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400 mt-12">
        Dashboard Kesehatan Mental Siswa · Data bersumber dari Google Sheets
      </footer>
    </div>
  );
}
