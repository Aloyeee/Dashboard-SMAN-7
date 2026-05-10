import { readSheet } from "./sheets";
import type { Stats } from "@/types";

// ── Column indices in Skor_SDQ (0-based, row after header) ───
// 0=SubID, 1=ResID, 2=Date, 3=Nama, 4=Kelas, 5=Umur
// 6=Q1, 7=Q2, 8=Q3, 9=Q4, 10=Q5, 11=Q6, 12=Q7(R),
// 13=Q8, 14=Q9, 15=Q10, 16=Q11(R), 17=Q12, 18=Q13,
// 19=Q14(R), 20=Q15, 21=Q16, 22=Q17, 23=Q18, 24=Q19, 25=Q20
// 26=Total Kesulitan (this is what we need for avg calculation)

const SDQ_PROSOCIAL   = [6, 9, 14, 22, 25];   // Q1,Q4,Q9,Q17,Q20
const SDQ_EMOTIONAL   = [8, 13, 18, 21, 24];   // Q3,Q8,Q13,Q16,Q19
const SDQ_CONDUCT     = [10, 12, 17, 23];       // Q5,Q7(R),Q12,Q18
const SDQ_HYPERACTIVE = [7, 15, 20];            // Q2,Q10,Q15
const SDQ_PEER        = [11, 16, 19];           // Q6,Q11(R),Q14(R)

// ── Column indices in Skor_IAA (0-based) ─────────────────────
// 0=SubID, 1=ResID, 2=Date, 3=Nama, 4=Kelas, 5=Umur
// 6..23 = IAA Q1..Q18
// 24 = Total Skor IAA, 25 = Status IAA

const IAA_TOTAL_COL  = 24;
const IAA_STATUS_COL = 25;
const TOTAL_KESULITAN_COL = 26; // New column for total difficulties
const KELAS_COL      = 4;
const NAMA_COL       = 3;

function sumCols(row: string[], cols: number[]) {
  return cols.reduce((s, c) => s + (parseInt(row[c]) || 0), 0);
}

function sdqCategory(total: number) {
  if (total <= 15) return "Normal";
  if (total <= 19) return "Borderline";
  return "Abnormal";
}

function iaaCategory(score: number) {
  if (score <= 30) return "Tidak/Sedikit Kecanduan";
  if (score <= 49) return "Kecanduan Borderline";
  return "Kemungkinan Kecanduan";
}

// ── In-memory cache — revalidates every 5 minutes ────────────
let cache: { data: Stats; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getStatsData(): Promise<Stats> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  const [sdqRows, iaaRows] = await Promise.all([
    readSheet("Skor_SDQ!A2:Z1000"),
    readSheet("Skor_IAA!A2:Z1000"),
  ]);

  // ── IAA ────────────────────────────────────────────────────
  const iaaStatusCount: Record<string, number> = {};
  const iaaByClass: Record<string, number[]> = {};
  let iaaTotal = 0;

  for (const row of iaaRows) {
    if (!row[NAMA_COL]) continue;
    const kelas  = row[KELAS_COL] ?? "Unknown";
    const score  = parseInt(row[IAA_TOTAL_COL]) || 0;
    const status = row[IAA_STATUS_COL] ?? "Unknown";
    iaaStatusCount[status] = (iaaStatusCount[status] ?? 0) + 1;
    (iaaByClass[kelas] ??= []).push(score);
    iaaTotal += score;
  }

  const totalRespondents = Object.values(iaaStatusCount).reduce((a, b) => a + b, 0);
  const avgIAA = totalRespondents > 0 ? Math.round(iaaTotal / totalRespondents) : 0;

  const iaaStatusChart = Object.entries(iaaStatusCount)
    .map(([name, value]) => ({ name, value }));

  const iaaByClassChart = Object.entries(iaaByClass)
    .map(([kelas, scores]) => ({
      kelas,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }))
    .sort((a, b) => a.kelas.localeCompare(b.kelas));

  // ── SDQ ────────────────────────────────────────────────────
  const sdqCategoryCount: Record<string, number> = { Normal: 0, Borderline: 0, Abnormal: 0 };
  const sdqByClass: Record<string, number[]> = {};
  const sub = { Prosocial: 0, Emotional: 0, Conduct: 0, Hyperactive: 0, Peer: 0 };
  let sdqCount    = 0;
  let sdqDiffTotal = 0;

  for (const row of sdqRows) {
    if (!row[NAMA_COL]) continue;
    const kelas       = row[KELAS_COL] ?? "Unknown";
    const emotional   = sumCols(row, SDQ_EMOTIONAL);
    const conduct     = sumCols(row, SDQ_CONDUCT);
    const hyperactive = sumCols(row, SDQ_HYPERACTIVE);
    const peer        = sumCols(row, SDQ_PEER);
    const diff        = parseInt(row[TOTAL_KESULITAN_COL]) || 0; // Use Total Kesulitan column

    sdqCategoryCount[sdqCategory(diff)]++;
    (sdqByClass[kelas] ??= []).push(diff);
    sub.Prosocial   += sumCols(row, SDQ_PROSOCIAL);
    sub.Emotional   += emotional;
    sub.Conduct     += conduct;
    sub.Hyperactive += hyperactive;
    sub.Peer        += peer;
    sdqDiffTotal    += diff;
    sdqCount++;
  }

  const avgSDQDifficulties = sdqCount > 0
    ? Math.round((sdqDiffTotal / sdqCount) * 10) / 10
    : 0;

  const sdqCategoryChart = Object.entries(sdqCategoryCount)
    .map(([name, value]) => ({ name, value }));

  const sdqByClassChart = Object.entries(sdqByClass)
    .map(([kelas, scores]) => ({
      kelas,
      avgDifficulties: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      count: scores.length,
    }))
    .sort((a, b) => a.kelas.localeCompare(b.kelas));

  const sdqSubscaleChart = [
    { name: "Prosocial",   avg: sdqCount > 0 ? Math.round((sub.Prosocial   / sdqCount) * 10) / 10 : 0 },
    { name: "Emotional",   avg: sdqCount > 0 ? Math.round((sub.Emotional   / sdqCount) * 10) / 10 : 0 },
    { name: "Conduct",     avg: sdqCount > 0 ? Math.round((sub.Conduct     / sdqCount) * 10) / 10 : 0 },
    { name: "Hyperactive", avg: sdqCount > 0 ? Math.round((sub.Hyperactive / sdqCount) * 10) / 10 : 0 },
    { name: "Peer",        avg: sdqCount > 0 ? Math.round((sub.Peer        / sdqCount) * 10) / 10 : 0 },
  ];

  const totalKelas = new Set([
    ...Object.keys(iaaByClass),
    ...Object.keys(sdqByClass),
  ]).size;

  const data: Stats = {
    summary: { totalRespondents, avgIAA, avgSDQDifficulties, totalKelas },
    iaaStatusChart,
    iaaByClassChart,
    sdqCategoryChart,
    sdqByClassChart,
    sdqSubscaleChart,
  };

  cache = { data, ts: Date.now() };
  return data;
}
