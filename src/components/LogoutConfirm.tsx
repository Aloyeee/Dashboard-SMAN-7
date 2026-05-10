"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutConfirm() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => setOpen(false), 8000);
    return () => window.clearTimeout(timeout);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        Keluar
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 p-4 text-sm text-gray-700 z-50">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5V13h3.5a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5H13V7.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5V11H7.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5H11v3.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5z" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">Konfirmasi Logout</p>
              <p className="mt-1 text-xs text-gray-500">
                Klik konfirmasi untuk mengakhiri sesi admin Anda. Atau tekan Batal jika ingin tetap berada di panel.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Ya, keluar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
