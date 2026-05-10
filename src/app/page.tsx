"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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

// ── Main landing page ──────────────────────────────────────────
export default function LandingPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [tab, setTab]     = useState<"sdq" | "iaa">("sdq");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); else setError(d.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
          <span className="text-sm font-semibold text-gray-800">Dashboard Skrining Kesehatan Mental dan Kecanduan Digital SMA 7 Semarang</span>
        </div>
          {status === "loading" ? (
            <div className="w-24 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : isAdmin ? (
            <div className="flex items-center gap-3">
              <a href="/"
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Home
              </a>
              <a href="/results"
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Dashboard
              </a>
              <a href="/dashboard"
                className="text-xs font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                ⚙ Panel Admin
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/"
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Home
              </a>
              <a href="/results"
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Dashboard
              </a>
              <a href="/api/auth/signin"
                className="text-xs font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Login Admin
              </a>
            </div>
          )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-screen-lg mx-auto px-6 py-14 text-center">
          <span className="inline-block text-xs font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-4">
            Skrining Kesehatan Mental 2026
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Dashboard Skrining SDQ<br />& Kecanduan Internet
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto mb-8">
            Hasil skrining kesehatan mental siswa menggunakan instrumen 
            <strong className="text-gray-700"> Strengths and Difficulties Questionnaire (SDQ)</strong> dan 
            <strong className="text-gray-700"> Internet Addiction Assessment (IAA)</strong>.
          </p>

          {/* Summary stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
              <Stat label="Total Responden" value={stats.summary.totalRespondents} sub="siswa" />
              <Stat label="Jumlah Kelas" value={stats.summary.totalKelas} sub="kelas" />
              <Stat label="Rata-rata Skor IAA" value={stats.summary.avgIAA} sub="dari 72"
                color={stats.summary.avgIAA >= 50 ? "text-red-600" : stats.summary.avgIAA >= 31 ? "text-amber-500" : "text-green-600"} />
              <Stat label="Avg Kesulitan SDQ" value={stats.summary.avgSDQDifficulties} sub="dari 40"
                color={stats.summary.avgSDQDifficulties > 19 ? "text-red-600" : stats.summary.avgSDQDifficulties > 15 ? "text-amber-500" : "text-green-600"} />
            </div>
          )}

          {/* Scroll CTA */}
          <a href="/results"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Lihat Hasil Skrining
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── Intro cards ─────────────────────────────────────── */}
      <section className="max-w-screen-lg mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tentang Skrining Ini</h2>
        <p className="text-sm text-gray-500 mb-6">Instrumen skrining kesehatan mental dan kecanduan digital untuk siswa SMA</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-xl">🧠</div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">SDQ — Strengths and Difficulties Questionnaire</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Instrumen skrining kesehatan mental berbasis 20 pertanyaan yang mengukur 5 subskala: 
              Gejala Emosional, Masalah Perilaku, Hiperaktivitas, Masalah Teman Sebaya, dan Prososial.
              Hasil dikategorikan sebagai <span className="text-green-600 font-medium">Normal</span>, <span className="text-amber-500 font-medium">Borderline</span>, atau <span className="text-red-500 font-medium">Abnormal</span>.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Skrining ini membantu mengidentifikasi siswa yang mungkin membutuhkan dukungan psikologis lebih lanjut,
              serta memberikan gambaran umum kesehatan mental populasi siswa di sekolah.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-xl">📱</div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">IAA — Internet Addiction Assessment</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Instrumen pengukuran tingkat kecanduan internet berbasis 18 item pertanyaan dengan skor 0–72. 
              Hasil dikategorikan sebagai <span className="text-green-600 font-medium">Tidak/Sedikit Kecanduan</span>, <span className="text-amber-500 font-medium">Kecanduan Borderline</span>, atau <span className="text-red-500 font-medium">Kemungkinan Kecanduan</span>.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Dengan meningkatnya penggunaan gadget di kalangan remaja, skrining ini penting untuk mendeteksi
              dini risiko kecanduan digital yang dapat mempengaruhi produktivitas belajar dan kesehatan mental siswa.
            </p>
          </div>
        </div>

        {/* Additional context */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Mengapa Skrining Ini Penting?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg">🎯</span>
              <div>
                <strong>Deteksi Dini</strong><br />
                Mengidentifikasi masalah kesehatan mental dan kecanduan sebelum menjadi lebih serius
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg">📊</span>
              <div>
                <strong>Data Berbasis</strong><br />
                Memberikan data yang dapat dianalisis untuk perencanaan program bimbingan dan konseling
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg">🤝</span>
              <div>
                <strong>Dukungan Terintegrasi</strong><br />
                Memfasilitasi kolaborasi antara guru, orang tua, dan tenaga kesehatan mental
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400">
        Dashboard Kesehatan Mental Siswa · Data bersumber dari Google Sheets · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
