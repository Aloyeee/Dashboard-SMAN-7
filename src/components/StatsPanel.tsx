"use client";

import { useEffect, useState } from "react";
import type { Stats } from "@/types";
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Tidak/Sedikit Kecanduan": "#1D9E75",
  "Kecanduan Borderline":    "#EF9F27",
  "Kemungkinan Kecanduan":   "#E05C5C",
};
const SDQ_COLORS: Record<string, string> = {
  Normal: "#1D9E75", Borderline: "#EF9F27", Abnormal: "#E05C5C",
};
const IAA_STATUSES = ["Tidak/Sedikit Kecanduan", "Kecanduan Borderline", "Kemungkinan Kecanduan"];
const BLUE = "#378ADD", PURPLE = "#9B6CF7";

function iaaColor(label: string) {
  if (label === "Tidak/Sedikit Kecanduan") return "text-green-600";
  if (label === "Kecanduan Borderline")    return "text-amber-500";
  return "text-red-600";
}
function sdqColor(label: string) {
  if (label === "Normal")     return "text-green-600";
  if (label === "Borderline") return "text-amber-500";
  return "text-red-600";
}

function StatCard({ label, value, sub, valueColor, subColor }: {
  label: string; value: string | number; sub?: string;
  valueColor?: string; subColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-semibold tracking-tight ${valueColor ?? "text-gray-800"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${subColor ?? "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-0.5">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mb-3">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </div>
  );
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"sdq" | "iaa">("sdq");

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); else setError(d.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm text-gray-400 animate-pulse">Memuat data…</div>
    </div>
  );
  if (error) return (
    <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
      <strong>Error:</strong> {error}
    </div>
  );
  if (!stats) return null;

  const { summary, iaaStatusChart, iaaByClassChart, sdqCategoryChart, sdqByClassChart, sdqSubscaleChart } = stats;
  const sub = summary.avgSubscales;
  const topSub = Object.entries(sub).sort((a, b) => b[1] - a[1])[0];
  const subLabel: Record<string, string> = {
    Prosocial: "Prososial", Emotional: "Emosional",
    Conduct: "Perilaku", Hyperactive: "Hiperaktif", Peer: "Teman Sebaya",
  };

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Responden" value={summary.totalRespondents} sub="siswa" />
        <StatCard label="Jumlah Kelas" value={summary.totalKelas} sub="kelas" />
        <StatCard
          label="Rata-rata Skor IAA"
          value={summary.avgIAA}
          sub={summary.iaaStatusLabel}
          valueColor={iaaColor(summary.iaaStatusLabel)}
          subColor={iaaColor(summary.iaaStatusLabel)}
        />
        <StatCard
          label="Rata-rata Kesulitan SDQ"
          value={summary.avgSDQDifficulties}
          sub={`${summary.sdqCategoryLabel}`}
          valueColor={sdqColor(summary.sdqCategoryLabel)}
          subColor={sdqColor(summary.sdqCategoryLabel)}
        />
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-2">
        {(["sdq", "iaa"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
              tab === t ? "bg-white border-blue-400 text-blue-700 shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            {t === "sdq" ? "🧠 SDQ Kemenkes" : "📱 IAA"}
          </button>
        ))}
      </div>

      {/* ── SDQ tab ── */}
      {tab === "sdq" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Total Kesulitan SDQ" sub="Distribusi status kesehatan mental siswa">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sdqCategoryChart} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {sdqCategoryChart.map((e, i) => (
                      <Cell key={i} fill={SDQ_COLORS[e.name] ?? "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribusi per Subskala" sub="Komposisi 5 subskala SDQ">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={sdqSubscaleChart} cx="50%" cy="50%" outerRadius={80}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <Radar dataKey="avg" stroke={BLUE} fill={BLUE} fillOpacity={0.25} name="Rata-rata" />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Rata-rata Kesulitan SDQ per Kelas" sub="Dihitung dari total kesulitan (difficulties) tiap siswa">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sdqByClassChart} margin={{ left: -10 }}>
                <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
                <Tooltip formatter={(v: any) => [`${v}`, "Avg Total Kesulitan"]} />
                <Bar dataKey="avgDifficulties" fill={PURPLE} radius={[4, 4, 0, 0]} name="Avg Kesulitan" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── IAA tab ── */}
      {tab === "iaa" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Distribusi Status Kecanduan Internet" sub="Keseluruhan siswa">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={iaaStatusChart} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {iaaStatusChart.map((e, i) => (
                      <Cell key={i} fill={STATUS_COLORS[e.name] ?? "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribusi Skor Berdasarkan Kelas" sub="Jumlah siswa per kategori IAA tiap kelas">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={iaaByClassChart} margin={{ left: -10 }}>
                  <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {IAA_STATUSES.map(s => (
                    <Bar key={s} dataKey={s} name={s}
                      fill={STATUS_COLORS[s]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
