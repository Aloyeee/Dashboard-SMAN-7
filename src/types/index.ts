import type { Layout } from "react-grid-layout";

export type WidgetType = "chart" | "table" | "stat";
export type ChartType = "bar" | "line" | "pie" | "radar";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataRange: string;
  chartType?: ChartType;
  color?: string;
  xKey?: string;
  yKeys?: string[];
}

export interface DashboardLayout {
  gridLayout: Layout[];
  widgets: WidgetConfig[];
}

export interface Stats {
  summary: {
    totalRespondents: number;
    totalKelas: number;
    avgIAA: number;
    iaaStatusLabel: string;
    avgSDQDifficulties: number;
    sdqCategoryLabel: string;
    avgSubscales: {
      Prosocial: number; Emotional: number;
      Conduct: number; Hyperactive: number; Peer: number;
    };
    topSubscale: string;
    topSubscaleVal: number;
  };
  iaaStatusChart:  { name: string; value: number }[];
  iaaByClassChart: Record<string, string | number>[];
  sdqCategoryChart: { name: string; value: number }[];
  sdqByClassChart:  { kelas: string; avgDifficulties: number; count: number }[];
  sdqSubscaleChart: { name: string; avg: number }[];
}

export interface SheetRow { [key: string]: string | number }

export const AVAILABLE_SHEETS = ["Responses", "Skor_SDQ", "Skor_IAA", "Config"] as const;
export type SheetName = typeof AVAILABLE_SHEETS[number];

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "bar",   label: "Bar Chart" },
  { value: "line",  label: "Line Chart" },
  { value: "pie",   label: "Pie Chart" },
  { value: "radar", label: "Radar Chart" },
];
export const WIDGET_TYPES: { value: WidgetType; label: string; icon: string }[] = [
  { value: "chart", label: "Chart",      icon: "📊" },
  { value: "table", label: "Tabel Data", icon: "📋" },
  { value: "stat",  label: "Stat Card",  icon: "🔢" },
];
export const PRESET_COLORS = [
  "#378ADD","#EF9F27","#E05C5C","#1D9E75","#9B6CF7","#F06292","#26C6DA","#8D6E63","#546E7A",
];
