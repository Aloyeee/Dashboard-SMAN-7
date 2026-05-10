"use client";

import { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, LineChart, Line,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ResponsiveContainer,
} from "recharts";
import type { WidgetConfig, Stats } from "@/types";

const ResponsiveGrid = WidthProvider(Responsive);

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

interface Props {
  widgets: WidgetConfig[];
  layout: Layout[];
  stats: Stats | null;
}

function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 overflow-hidden">
      {children}
    </div>
  );
}

function renderChart(widget: WidgetConfig, stats: Stats | null) {
  if (!stats) {
    return (
      <ChartContainer>
        <div className="text-xs text-gray-400">Memuat data…</div>
      </ChartContainer>
    );
  }

  const { title, chartType } = widget;

  // Determine which data to use based on title or dataRange
  let data: any[] = [];
  let chartColor = BLUE;

  if (title.toLowerCase().includes("iaa")) {
    if (chartType === "pie") {
      data = stats.iaaStatusChart;
      return (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {data.map((e, i) => (
                  <Cell key={i} fill={STATUS_COLORS[e.name] ?? "#ccc"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [`${v}`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    } else if (chartType === "bar") {
      data = stats.iaaByClassChart;
      return (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kelas" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 72]} />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#EF9F27" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }
  } else if (title.toLowerCase().includes("sdq")) {
    if (chartType === "pie") {
      data = stats.sdqCategoryChart;
      return (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {data.map((e, i) => (
                  <Cell key={i} fill={SDQ_COLORS[e.name] ?? "#ccc"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [`${v}`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    } else if (chartType === "bar") {
      data = stats.sdqByClassChart;
      return (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kelas" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 40]} />
              <Tooltip />
              <Bar dataKey="avgDifficulties" fill={PURPLE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    } else if (chartType === "radar") {
      data = stats.sdqSubscaleChart;
      return (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius={55}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
              <Radar dataKey="avg" stroke={BLUE} fill={BLUE} fillOpacity={0.25} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }
  }

  return (
    <ChartContainer>
      <div className="text-xs text-gray-400 text-center">
        <div>{widget.title}</div>
        <div className="text-gray-300 mt-1">({chartType})</div>
      </div>
    </ChartContainer>
  );
}

export default function WidgetPreview({ widgets, layout, stats }: Props) {
  return (
    <ResponsiveGrid
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 768, sm: 480 }}
      cols={{ lg: 12, md: 8, sm: 4 }}
      rowHeight={60}
      margin={[12, 12]}
      isDraggable={false}
      isResizable={false}
      compactType="vertical"
      preventCollision={false}
    >
      {widgets.map(w => (
        <div key={w.id} className="w-full h-full">
          {renderChart(w, stats)}
        </div>
      ))}
    </ResponsiveGrid>
  );
}
