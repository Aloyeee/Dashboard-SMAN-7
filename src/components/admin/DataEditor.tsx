"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { AVAILABLE_SHEETS } from "@/types";
import TambahDataModal from "./TambahDataModal";

type Cell = string;
type Grid = Cell[][];

// Column range per sheet — SDQ goes to AQ (43 cols), IAA to Z (26 cols)
const SHEET_RANGE: Record<string, string> = {
  Skor_SDQ:  "A1:AQ300",
  Skor_IAA:  "A1:Z300",
  Responses: "A1:AW300",
  Config:    "A1:A2",
};

export default function DataEditor() {
  const [sheet, setSheet] = useState<string>("Skor_SDQ");
  const [grid, setGrid] = useState<Grid>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 25;

  const load = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const range = SHEET_RANGE[s] ?? "A1:AQ300";
      const res = await fetch(`/api/data-editor?sheet=${s}&range=${range}`);
      const { ok, rows } = await res.json();
      if (ok) {
        setGrid(rows);
        setCurrentPage(1);
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(sheet);
  }, [sheet, load]);

  const headers = grid[0] ?? [];
  const dataRows = grid.slice(1);

  // Find column indices
  const kelasColIdx = headers.findIndex(h => h?.toLowerCase()?.includes("kelas"));

  // Status color coding
  const getStatusColor = (val: string) => {
    if (!val) return "";
    const v = val.toLowerCase();
    if (v === "normal")      return "text-emerald-700 bg-emerald-50 rounded px-1";
    if (v === "borderline")  return "text-amber-700 bg-amber-50 rounded px-1";
    if (v === "abnormal")    return "text-red-700 bg-red-50 rounded px-1";
    if (v.includes("tidak") || v.includes("sedikit")) return "text-emerald-700 bg-emerald-50 rounded px-1";
    if (v.includes("borderline")) return "text-amber-700 bg-amber-50 rounded px-1";
    if (v.includes("kemungkinan") || v.includes("signifikan")) return "text-red-700 bg-red-50 rounded px-1";
    return "";
  };

  // Get unique kelas values for filter dropdown
  const kelasOptions = useMemo(() => {
    const options = new Set<string>();
    dataRows.forEach(row => {
      if (kelasColIdx >= 0 && row[kelasColIdx]) {
        options.add(row[kelasColIdx]);
      }
    });
    return Array.from(options).sort();
  }, [dataRows, kelasColIdx]);

  // Filter and search data
  const filteredRows = useMemo(() => {
    return dataRows.filter(row => {
      const searchMatch = searchTerm === "" || row.some(cell =>
        cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const kelasMatch = filterKelas === "" || (kelasColIdx >= 0 && row[kelasColIdx] === filterKelas);
      return searchMatch && kelasMatch;
    });
  }, [dataRows, searchTerm, filterKelas, kelasColIdx]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const displayRows = filteredRows.slice(startIdx, startIdx + ROWS_PER_PAGE);
  const actualStartRow = startIdx + 2;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={sheet} onChange={e => setSheet(e.target.value)}
          className="text-sm font-medium text-gray-500 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
          {AVAILABLE_SHEETS.filter(s => s !== "Config").map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <TambahDataModal />

        <button onClick={() => load(sheet)} disabled={loading}
          className="inline-flex items-center gap-2 text-sm px-3 font-medium text-gray-500 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
          <RotateCcw className="h-4 w-4" />
          {loading ? "Memuat…" : "Refresh"}
        </button>

        {/* Column count badge */}
        {headers.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
            {headers.length} kolom · {filteredRows.length} baris
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <input type="text" placeholder="Cari…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="text-sm border font-medium text-gray-950 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-40" />
          <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
            className="text-sm border font-medium text-gray-500 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Semua Kelas</option>
            {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-gray-200 rounded-xl" style={{ maxHeight: 500 }}>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400 animate-pulse">Memuat data…</div>
        ) : displayRows.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            Tidak ada data yang sesuai dengan filter
          </div>
        ) : (
          <table className="text-xs border-collapse w-full">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="border-b border-r border-gray-200 px-2 py-2 text-gray-400 font-normal w-8 text-center">#</th>
                {headers.map((h, c) => (
                  <th key={c} className="border-b border-r border-gray-200 px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, displayIdx) => (
                <tr key={displayIdx} className="hover:bg-blue-50/40 transition-colors border-b border-gray-100">
                  <td className="border-r border-gray-100 px-2 py-2 text-center text-gray-400 text-xs bg-gray-50">
                    {actualStartRow + displayIdx}
                  </td>
                  {headers.map((h, c) => {
                    const val = row[c] ?? "";
                    const colorClass = getStatusColor(val);
                    return (
                      <td key={c} className="border-r border-gray-100 px-3 py-2 text-gray-700 max-w-[180px] truncate">
                        {colorClass
                          ? <span className={`font-medium text-xs ${colorClass}`}>{val}</span>
                          : val
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 border text-gray-500 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Sebelumnya
          </button>
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`text-xs text-gray-500 px-2.5 py-1.5 rounded-lg transition-colors ${
                currentPage === p ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
              }`}>
              {p}
            </button>
          ))}
          {totalPages > 8 && <span className="text-xs text-gray-400">…{totalPages}</span>}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 border text-gray-500 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Selanjutnya
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">Read-only · {sheet === "Skor_SDQ" ? "43 kolom (A–AQ): profil, skor Q1–Q25, subscale E/C/H/P/Pr, status per subscale, total kesulitan, status SDQ" : "Gunakan search dan filter untuk menemukan data spesifik."}</p>
    </div>
  );
}
