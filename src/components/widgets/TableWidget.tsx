"use client";

import { useEffect, useState } from "react";
import type { WidgetConfig } from "@/types";

export default function TableWidget({ config }: { config: WidgetConfig }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sheets?range=${encodeURIComponent(config.dataRange)}`)
      .then(r => r.json())
      .then(({ data }: { data: string[][] }) => {
        if (!data?.length) return;
        setHeaders(data[0]);
        setRows(data.slice(1));
      })
      .finally(() => setLoading(false));
  }, [config.dataRange]);

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>;
  if (!rows.length) return <div className="text-sm text-gray-400">No data</div>;

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map(h => (
              <th key={h} className="text-left py-1.5 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-1.5 px-2 text-gray-700 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
