"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
            Admin Login
          </span>
          <h1 className="mt-6 text-3xl font-semibold text-white">Masuk untuk mengelola data</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Gunakan akun Google admin Anda untuk memasuki panel manajemen. Hanya pengguna terotorisasi yang dapat melihat dan mengubah data.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21.35 11.1h-9.43v2.8h5.42c-.23 1.3-1.47 3.8-5.42 3.8-3.25 0-5.9-2.7-5.9-6.05 0-3.35 2.65-6.05 5.9-6.05 1.86 0 3.11.8 3.82 1.5l2.6-2.5C18.57 2.7 16.45 1.5 12 1.5 6.48 1.5 2 6 2 11.95S6.48 22.4 12 22.4c6.9 0 9.35-5.3 9.35-11.3 0-.75-.1-1.3-.15-1.95z" fill="#4285F4" />
              <path d="M3.53 7.2l2.8 2.05C7.04 8.07 9.36 6.45 12 6.45c1.86 0 3.08.8 3.82 1.5l2.6-2.5C18.57 2.7 16.45 1.5 12 1.5 8.8 1.5 6.08 3.1 4.68 5.5l-1.15 1.7z" fill="#34A853" />
              <path d="M12 22.4c4.33 0 7.96-1.45 10.38-3.92l-2.7-2.2c-1.1.75-2.55 1.3-4.7 1.3-3.95 0-5.19-2.5-5.42-3.8H3.53v2.95C5.96 20.9 8.77 22.4 12 22.4z" fill="#FBBC05" />
              <path d="M20.88 6.58l-2.7 2.2c-.8-.7-1.95-1.5-3.82-1.5-2.35 0-4.38 1.4-5.15 3.35l-2.8-2.05C6.08 3.1 8.8 1.5 12 1.5c3.55 0 6.57 2.2 8.88 5.08z" fill="#EA4335" />
            </svg>
            {loading ? "Mengalihkan…" : "Masuk dengan Google"}
          </button>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Catatan</p>
            <p className="mt-2 leading-relaxed">
              Jika Anda bukan admin, gunakan dashboard publik untuk melihat hasil skrining tanpa mengubah data.
            </p>
          </div>

          <Link href="/" className="block text-center text-sm text-slate-300 transition hover:text-white">
            Kembali ke dashboard publik
          </Link>
        </div>
      </div>
    </div>
  );
}
