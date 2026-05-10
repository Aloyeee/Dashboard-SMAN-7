"use client";

import { useEffect, useState } from "react";
import type { WidgetConfig } from "@/types";

export default function StatWidget({ config }: { config: WidgetConfig }) {
  const [value, setValue] = useState<string>("-");
  const [label, setLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sheets?range=${encodeURIComponent(config.dataRange)}`)
      .then(r => r.json())
      .then(({ data: rows }: { data: string[][] }) => {
        // Expects 2 rows: row 0 = label, row 1 = value
        setLabel(rows?.[0]?.[0] ?? config.title);
        setValue(rows?.[1]?.[0] ?? "—");
      })
      .finally(() => setLoading(false));
  }, [config.dataRange, config.title]);

  return (
    <div className="flex flex-col justify-center h-full">
      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-semibold text-gray-800 tracking-tight">{value}</p>
        </>
      )}
    </div>
  );
}
