"use client";

import { useEffect, useState } from "react";
import { Brain, Smartphone } from "lucide-react";
import type { Stats } from "@/types";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  sdqRangeLabel, iaaRangeLabel,
  iaaValueColor, sdqValueColor,
  IAA_STATUSES, IAA_COLORS, SDQ_COLORS,
} from "@/lib/labels";

const BLUE   = "#378ADD";
const PURPLE = "#9B6CF7";

function StatCard({ label, value, sub, valueColor, subColor }: {
  label: string; value: string | number;
  sub?: string; valueColor?: string; subColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 text-left">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold tracking-tight mt-1 ${valueColor ?? "text-gray-800"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium leading-snug ${subColor ?? "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, sub, children }: {
  title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {sub && <p className="text-xs mt-0.5 mb-4 text-gray-400">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </div>
  );
}

export default function StatsPanel() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<"sdq" | "iaa">("sdq");

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); else setError(d.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
          <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
  if (error) return (
    <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-sm text-red-700">
      <strong>Error:</strong> {error}
    </div>
  );
  if (!stats) return null;

  const {
    summary: s,
    iaaStatusChart, iaaByClassChart,
    sdqCategoryChart, sdqByClassChart, sdqSubscaleChart,
  } = stats;

  const totalSDQ = sdqCategoryChart.reduce((a, b) => a + b.value, 0);
  const totalIAA = iaaStatusChart.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">

      {/* ── 4 stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Responden" value={s.totalRespondents} sub="siswa" />
        <StatCard label="Jumlah Kelas"    value={s.totalKelas}       sub="kelas" />
        <StatCard
          label="Rata-rata Skor IAA"
          value={s.avgIAA}
          sub={iaaRangeLabel(s.iaaStatusLabel)}
          valueColor={iaaValueColor(s.iaaStatusLabel)}
          subColor={iaaValueColor(s.iaaStatusLabel)}
        />
        <StatCard
          label="Rata-rata Kesulitan SDQ"
          value={s.avgSDQDifficulties}
          sub={sdqRangeLabel(s.sdqCategoryLabel)}
          valueColor={sdqValueColor(s.sdqCategoryLabel)}
          subColor={sdqValueColor(s.sdqCategoryLabel)}
        />
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-2">
        {(["sdq", "iaa"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
              tab === t
                ? "bg-white border-blue-400 text-blue-700 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            {t === "sdq" ? <><Brain className="h-4 w-4" /> SDQ Kemenkes</> : <><Smartphone className="h-4 w-4" /> IAA</>}
          </button>
        ))}
      </div>

      {/* ══ SDQ tab ══ */}
      {tab === "sdq" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Total Kesulitan SDQ" sub="Distribusi status kesehatan mental siswa (Kemenkes)">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={sdqCategoryChart} dataKey="value" nameKey="name"
                    cx="50%" cy="45%" innerRadius={70} outerRadius={100}
                    startAngle={90} endAngle={-270} paddingAngle={2}
                    labelLine={false} label={false}>
                    {sdqCategoryChart.map((e, i) => (
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
            </ChartCard>

            <ChartCard title="Distribusi per Subskala" sub="Rata-rata skor per subskala SDQ">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={sdqSubscaleChart} cx="50%" cy="50%" outerRadius={85}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <Radar dataKey="avg" stroke={BLUE} fill={BLUE} fillOpacity={0.25} name="Rata-rata" />
                  <Tooltip formatter={(v: any) => [v, "Rata-rata"]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Rata-rata Total Kesulitan SDQ per Kelas"
            sub="Skala Kemenkes 0–40 · Normal ≤15 · Borderline 16–19 · Abnormal ≥20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sdqByClassChart} margin={{ left: -10, top: 4 }}>
                <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
                <Tooltip formatter={(v: any) => [`${v}`, "Avg Total Kesulitan"]} labelFormatter={l => `Kelas: ${l}`} />
                <Bar dataKey="avgDifficulties" fill={PURPLE} radius={[4, 4, 0, 0]} name="Avg Kesulitan" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ══ IAA tab ══ */}
      {tab === "iaa" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Distribusi Status Kecanduan Internet" sub="Seluruh siswa berdasarkan kategori IAA">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={iaaStatusChart} dataKey="value" nameKey="name"
                    cx="50%" cy="45%" innerRadius={70} outerRadius={100}
                    startAngle={90} endAngle={-270} paddingAngle={2}
                    labelLine={false} label={false}>
                    {iaaStatusChart.map((e, i) => (
                      <Cell key={i} fill={IAA_COLORS[e.name] ?? "#ccc"} stroke="none" />
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
            </ChartCard>

            <ChartCard title="Distribusi Kategori IAA per Kelas" sub="Jumlah siswa per kategori tiap kelas">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={iaaByClassChart} margin={{ left: -10, top: 4 }}>
                  <XAxis dataKey="kelas" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(v: any, n: any) => [`${v} siswa`, n]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={8}
                    formatter={(value: string | number) => {
                      const labelMap: Record<string, string> = {
                        "Tidak/Sedikit Kecanduan": "Tidak/Sedikit",
                        "Kecanduan Borderline":    "Borderline",
                        "Kemungkinan Kecanduan":   "Kemungkinan",
                        "Kecanduan Signifikan":    "Signifikan",
                      };
                      return labelMap[String(value)] ?? value;
                    }}
                  />
                  {IAA_STATUSES.map(st => (
                    <Bar key={st} dataKey={st} name={st}
                      fill={IAA_COLORS[st]} radius={[3, 3, 0, 0]} stackId="a" />
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
