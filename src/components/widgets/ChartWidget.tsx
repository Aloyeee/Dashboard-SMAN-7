"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { WidgetConfig, SheetRow } from "@/types";

const COLORS = ["#378ADD", "#EF9F27", "#1D9E75", "#E05C5C", "#9B6CF7"];

export default function ChartWidget({ config }: { config: WidgetConfig }) {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sheets?range=${encodeURIComponent(config.dataRange)}`)
      .then(r => r.json())
      .then(({ data: rows }: { data: string[][] }) => {
        if (!rows?.length) return;
        const [headers, ...rest] = rows;
        setData(
          rest.map(row =>
            Object.fromEntries(
              headers.map((h, i) => [h, isNaN(Number(row[i])) ? row[i] : Number(row[i])])
            )
          )
        );
      })
      .finally(() => setLoading(false));
  }, [config.dataRange]);

  if (loading) return <div className="flex items-center justify-center h-full text-sm text-gray-400">Loading…</div>;
  if (!data.length) return <div className="flex items-center justify-center h-full text-sm text-gray-400">No data</div>;

  const keys = Object.keys(data[0]).slice(1);
  const xKey = Object.keys(data[0])[0];

  if (config.chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey={keys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius={70} label>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (config.chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {keys.map((k, i) => (
            <Line key={k} dataKey={k} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
