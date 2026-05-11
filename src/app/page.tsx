"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Brain, Smartphone, Target, BarChart3, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import type { Stats } from "@/types";
import { sdqRangeLabel, iaaRangeLabel, iaaValueColor, sdqValueColor } from "@/lib/labels";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar session={session ?? null} status={status} />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
            {stats ? (() => {
              const { summary: s } = stats;
              return (
                <>
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
                </>
              );
            })() : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))
            )}
          </div>

          <a href="/results"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Lihat Hasil Skrining
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tentang Skrining Ini</h2>
        <p className="text-sm text-gray-500 mb-6">Instrumen skrining kesehatan mental dan kecanduan digital untuk siswa SMA</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">SDQ — Strengths and Difficulties Questionnaire</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Instrumen skrining kesehatan mental berbasis 25 pertanyaan yang mengukur 5 subskala:
              Gejala Emosional, Masalah Perilaku, Hiperaktivitas, Masalah Teman Sebaya, dan Prososial.
            </p>
            <div className="flex gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">Normal ≤15</span>
              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">Borderline 16–19</span>
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium">Abnormal ≥20</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
            <Smartphone className="h-5 w-5" />
          </div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">IAA — Internet Addiction Assessment</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Instrumen pengukuran tingkat kecanduan internet berbasis 18 item pertanyaan dengan total skor 0–72.
            </p>
            <div className="flex gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">Tidak/Sedikit &lt;30</span>
              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">Borderline 30–39</span>
              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">Kemungkinan 40–59</span>
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium">Signifikan ≥60</span>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Mengapa Skrining Ini Penting?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600" />
              <div><strong>Deteksi Dini</strong><br />Mengidentifikasi masalah sebelum menjadi lebih serius</div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div><strong>Data Berbasis</strong><br />Dasar perencanaan program bimbingan dan konseling</div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div><strong>Dukungan Terintegrasi</strong><br />Kolaborasi guru, orang tua, dan tenaga kesehatan mental</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400">
        Dashboard Kesehatan Mental Siswa · SMA 7 Semarang · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
