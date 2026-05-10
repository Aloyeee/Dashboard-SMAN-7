"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AVAILABLE_SHEETS } from "@/types";

type Cell = string;
type Grid = Cell[][];

export default function DataEditor() {
  const [sheet, setSheet] = useState<string>("Skor_IAA");
  const [grid, setGrid] = useState<Grid>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 25;

  const load = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data-editor?sheet=${s}&range=A1:Z300`);
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
  const umurColIdx = headers.findIndex(h => h?.toLowerCase()?.includes("umur"));

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
      // Search filter
      const searchMatch = searchTerm === "" || row.some(cell =>
        cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Kelas filter
      const kelasMatch = filterKelas === "" || (kelasColIdx >= 0 && row[kelasColIdx] === filterKelas);

      return searchMatch && kelasMatch;
    });
  }, [dataRows, searchTerm, filterKelas, kelasColIdx]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const displayRows = filteredRows.slice(startIdx, startIdx + ROWS_PER_PAGE);
  const actualStartRow = startIdx + 2; // +2 because row 1 is header and 0-indexed

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={sheet} onChange={e => setSheet(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
          {AVAILABLE_SHEETS.filter(s => s !== "Config").map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => load(sheet)} disabled={loading}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
          {loading ? "Memuat…" : "↻ Refresh"}
        </button>

        <div className="ml-auto flex items-center gap-3">
          {/* Search */}
          <input type="text" placeholder="Cari…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-40" />

          {/* Filter by Kelas */}
          <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Semua Kelas</option>
            {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>

          {/* Results info */}
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {filteredRows.length} data
          </span>
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
                  {headers.map((_, c) => (
                    <td key={c} className="border-r border-gray-100 px-3 py-2 text-gray-700 max-w-[180px] truncate">
                      {row[c] ?? ""}
                    </td>
                  ))}
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
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            ← Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                currentPage === p
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}>
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Selanjutnya →
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">Tabel ini menampilkan data read-only. Gunakan search dan filter untuk menemukan data spesifik.</p>
    </div>
  );
}
