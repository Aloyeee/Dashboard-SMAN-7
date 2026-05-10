"use client";

import { useState } from "react";
import { ExternalLink, Copy, X, CheckCircle } from "lucide-react";

const TALLY_FORM_URL = "https://tally.so/r/VL9GPN";

export default function TambahDataModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(TALLY_FORM_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm px-3 font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
      >
        Tambah Data
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tambah Data Peserta</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Peserta baru mengisi data melalui Google/Tally Form. Hasil yang masuk akan otomatis muncul di dashboard.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form link section */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Form pengisian:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={TALLY_FORM_URL}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                    title="Salin URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copied && (
                  <div className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                    <CheckCircle className="h-4 w-4" />
                    URL tersalin
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Bagikan URL ini kepada peserta. Setiap submission baru otomatis tersimpan dan tampil realtime di sini.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <a
                href={TALLY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Buka Form
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
