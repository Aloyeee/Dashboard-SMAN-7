import { readSheet } from "./sheets";
import type { Stats } from "@/types";

// ── Skor_SDQ column indices (0-based) ─────────────────────────
// 0=SubID 1=ResID 2=Date 3=Nama 4=Kelas 5=Umur
// 6..30  = SDQ Q1..Q25
// 31=Skor E  32=Skor C  33=Skor H  34=Skor P  35=Skor Pr
// 36=Status E  37=Status C  38=Status H  39=Status P  40=Status Pr
// 41=Total Kesulitan   42=Status SDQ (Kemenkes)
const COL_SKOR_E     = 31;
const COL_SKOR_C     = 32;
const COL_SKOR_H     = 33;
const COL_SKOR_P     = 34;
const COL_SKOR_PR    = 35;
const COL_TOTAL_KES  = 41;
const COL_STATUS_SDQ = 42;

// ── Skor_IAA column indices (0-based) ─────────────────────────
// 0=SubID 1=ResID 2=Date 3=Nama 4=Kelas 5=Umur
// 6..23=Q1..Q18  24=Total Skor IAA  25=Status IAA
const COL_IAA_TOTAL  = 24;
const COL_IAA_STATUS = 25;
const KELAS_COL      = 4;
const NAMA_COL       = 3;

const IAA_STATUSES = [
  "Tidak/Sedikit Kecanduan",
  "Kecanduan Borderline",
  "Kemungkinan Kecanduan",
  "Kecanduan Signifikan",
] as const;

function sdqCategory(score: number): string {
  if (score <= 15) return "Normal";
  if (score <= 19) return "Borderline";
  return "Abnormal";
}

function iaaCategory(score: number): string {
  if (score < 30)  return "Tidak/Sedikit Kecanduan";
  if (score <= 39) return "Kecanduan Borderline";
  if (score <= 59) return "Kemungkinan Kecanduan";
  return "Kecanduan Signifikan";
}

// ── Cache ──────────────────────────────────────────────────────
let cache: { data: Stats; ts: number } | null = null;
const CACHE_TTL = 25 * 1000;

export function clearStatsCache() { cache = null; }

export async function getStatsData(): Promise<Stats> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  const [sdqRows, iaaRows] = await Promise.all([
    readSheet("Skor_SDQ!A2:AQ1000"),
    readSheet("Skor_IAA!A2:Z1000"),
  ]);

  // ── IAA ───────────────────────────────────────────────────────
  const iaaStatusCount:    Record<string, number> = {};
  const iaaByClassCounts:  Record<string, Record<string, number>> = {};
  const iaaByClassScores:  Record<string, number[]> = {};   // ← track raw scores per class
  let iaaTotal = 0, iaaCount = 0;

  for (const row of iaaRows) {
    if (!row[NAMA_COL]) continue;
    const kelas  = row[KELAS_COL] ?? "Unknown";
    const score  = parseInt(row[COL_IAA_TOTAL]) || 0;
    const status = row[COL_IAA_STATUS]?.trim() || iaaCategory(score);

    iaaStatusCount[status] = (iaaStatusCount[status] ?? 0) + 1;

    if (!iaaByClassCounts[kelas]) iaaByClassCounts[kelas] = {};
    iaaByClassCounts[kelas][status] = (iaaByClassCounts[kelas][status] ?? 0) + 1;

    (iaaByClassScores[kelas] ??= []).push(score);   // ← collect score per class

    iaaTotal += score;
    iaaCount++;
  }

  const totalRespondents = iaaCount;
  const avgIAA           = iaaCount > 0 ? Math.round((iaaTotal / iaaCount) * 10) / 10 : 0;
  const iaaStatusLabel   = iaaCategory(avgIAA);

  const iaaStatusChart = IAA_STATUSES
    .map(s => ({ name: s, value: iaaStatusCount[s] ?? 0 }))
    .filter(s => s.value > 0);

  // iaaByClassChart now includes BOTH category counts AND avgScore per class
  const iaaByClassChart = Object.entries(iaaByClassCounts)
    .map(([kelas, counts]) => {
      const scores  = iaaByClassScores[kelas] ?? [];
      const avgScore = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;
      return {
        kelas,
        avgScore,
        ...Object.fromEntries(IAA_STATUSES.map(s => [s, counts[s] ?? 0])),
      };
    })
    .sort((a, b) => (a.kelas as string).localeCompare(b.kelas as string));

  // ── SDQ ───────────────────────────────────────────────────────
  const sdqCatCount: Record<string, number> = { Normal: 0, Borderline: 0, Abnormal: 0 };
  const sdqByClassRaw: Record<string, number[]> = {};
  let subE = 0, subC = 0, subH = 0, subP = 0, subPr = 0;
  let sdqCount = 0, sdqDiffTotal = 0;

  for (const row of sdqRows) {
    if (!row[NAMA_COL]) continue;
    const kelas    = row[KELAS_COL] ?? "Unknown";
    const totalKes = parseInt(row[COL_TOTAL_KES]) || 0;
    const statusRaw = row[COL_STATUS_SDQ]?.trim() || "";
    const cat = ["Normal", "Borderline", "Abnormal"].includes(statusRaw)
      ? statusRaw : sdqCategory(totalKes);
    sdqCatCount[cat]++;
    (sdqByClassRaw[kelas] ??= []).push(totalKes);
    subE  += parseInt(row[COL_SKOR_E])  || 0;
    subC  += parseInt(row[COL_SKOR_C])  || 0;
    subH  += parseInt(row[COL_SKOR_H])  || 0;
    subP  += parseInt(row[COL_SKOR_P])  || 0;
    subPr += parseInt(row[COL_SKOR_PR]) || 0;
    sdqDiffTotal += totalKes;
    sdqCount++;
  }

  const avg = (n: number) => sdqCount > 0 ? Math.round((n / sdqCount) * 10) / 10 : 0;
  const avgSDQDifficulties = sdqCount > 0 ? Math.round((sdqDiffTotal / sdqCount) * 10) / 10 : 0;
  const sdqCategoryLabel   = sdqCategory(avgSDQDifficulties);

  const subAvgs = {
    Emosional:  avg(subE), Perilaku: avg(subC),
    Hiperaktif: avg(subH), TenSebaya: avg(subP), Prososial: avg(subPr),
  };

  const [topSubscale, topSubscaleVal] = Object.entries({
    Emosional: subAvgs.Emosional, Perilaku: subAvgs.Perilaku,
    Hiperaktif: subAvgs.Hiperaktif, "Teman Sebaya": subAvgs.TenSebaya,
  }).sort((a, b) => b[1] - a[1])[0];

  const sdqCategoryChart = Object.entries(sdqCatCount)
    .map(([name, value]) => ({ name, value })).filter(e => e.value > 0);

  const sdqByClassChart = Object.entries(sdqByClassRaw)
    .map(([kelas, scores]) => ({
      kelas,
      avgDifficulties: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      count: scores.length,
    })).sort((a, b) => a.kelas.localeCompare(b.kelas));

  const sdqSubscaleChart = [
    { name: "Emosional",    avg: subAvgs.Emosional },
    { name: "Perilaku",     avg: subAvgs.Perilaku },
    { name: "Hiperaktif",   avg: subAvgs.Hiperaktif },
    { name: "Teman Sebaya", avg: subAvgs.TenSebaya },
    { name: "Prososial",    avg: subAvgs.Prososial },
  ];

  const totalKelas = new Set([
    ...Object.keys(iaaByClassCounts), ...Object.keys(sdqByClassRaw),
  ]).size;

  const data: Stats = {
    summary: {
      totalRespondents, totalKelas,
      avgIAA, iaaStatusLabel,
      avgSDQDifficulties, sdqCategoryLabel,
      avgSubscales: {
        Prosocial: subAvgs.Prososial, Emotional: subAvgs.Emosional,
        Conduct: subAvgs.Perilaku, Hyperactive: subAvgs.Hiperaktif,
        Peer: subAvgs.TenSebaya,
      },
      topSubscale, topSubscaleVal,
    },
    iaaStatusChart, iaaByClassChart,
    sdqCategoryChart, sdqByClassChart, sdqSubscaleChart,
  };

  cache = { data, ts: Date.now() };
  return data;
}
