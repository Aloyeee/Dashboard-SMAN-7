"use client";

import { useState, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetManager from "@/components/admin/WidgetManager";
import DataEditor from "@/components/admin/DataEditor";
import StatsPanel from "@/components/StatsPanel";
import WidgetPreview from "@/components/admin/WidgetPreview";
import type { DashboardLayout, WidgetConfig, Stats } from "@/types";

const ResponsiveGrid = WidthProvider(Responsive);

const TABS = [
  { id: "customize", label: "⚙ Customize Dashboard" },
  { id: "data",      label: "📋 Data Table" },
];

interface Props { initialConfig: DashboardLayout }

export default function AdminPanel({ initialConfig }: Props) {
  const [tab, setTab]         = useState("customize");
  const [config, setConfig]   = useState<DashboardLayout>(initialConfig);
  const [layout, setLayout]   = useState<Layout[]>(initialConfig.gridLayout);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateWidgets = useCallback((widgets: WidgetConfig[]) => {
    setConfig(c => ({ ...c, widgets }));
    setSaved(false);
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    setSaved(false);
  }, []);

  const handleRefreshData = useCallback(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { if (d.ok) setStats(d); })
      .catch(e => console.error("Failed to fetch stats:", e));
    setRefreshKey(k => k + 1);
  }, []);

  const saveAll = async () => {
    setSaving(true);
    const payload: DashboardLayout = { ...config, gridLayout: layout };
    // Sync layout widget ids with config widgets
    const syncedLayout = config.widgets.map((w, i) => ({
      i: w.id,
      x: (i * 4) % 12,
      y: Math.floor(i / 3) * 4,
      w: 4, h: 4,
      ...(layout.find(l => l.i === w.id) ?? {}),
    }));
    payload.gridLayout = syncedLayout;

    try {
      await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: payload }),
      });
      setSaved(true);
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar + save */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-colors ${
              tab === t.id ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}>
            {t.label}
          </button>
        ))}
        <div className="ml-2 flex items-center gap-2 flex-shrink-0">
          {saved && <span className="text-xs text-green-600">✓ Tersimpan</span>}
          <button onClick={saveAll} disabled={saving}
            className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors whitespace-nowrap">
            {saving ? "Menyimpan…" : "💾 Simpan Semua"}
          </button>
        </div>
      </div>

      {/* ── Customize tab (Widget + Layout + Live Preview) ── */}
      {tab === "customize" && (
        <div className="grid grid-cols-2 gap-4 min-h-[600px]">
          {/* Left: Widget Manager */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Kelola Widget</h2>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Tambah, hapus, dan konfigurasi widget.</p>
              <WidgetManager widgets={config.widgets} onChange={updateWidgets} />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Atur Layout</h2>
              <p className="text-xs text-gray-400 mb-3">Drag widget untuk memindahkan, tarik sudut untuk resize.</p>
              <ResponsiveGrid
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 768, sm: 480 }}
                cols={{ lg: 12, md: 8, sm: 4 }}
                rowHeight={40}
                margin={[8, 8]}
                isDraggable isResizable
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                containerPadding={[0, 0]}
                compactType="vertical"
                preventCollision={false}
              >
                {config.widgets.map(w => (
                  <div key={w.id} className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col">
                    <div className="drag-handle flex items-center justify-between px-2 py-1 border-b border-gray-100 cursor-grab active:cursor-grabbing bg-gray-50">
                      <span className="text-xs font-medium text-gray-600 truncate">{w.title}</span>
                      <span className="text-xs text-gray-300 select-none ml-1">⠿</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-400 p-1">
                      {w.chartType ?? "stat"}
                    </div>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Live Preview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Lihat tampilan dashboard secara real-time</p>
              </div>
              <button onClick={handleRefreshData}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium whitespace-nowrap">
                ↻ Refresh Data
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <WidgetPreview key={refreshKey} widgets={config.widgets} layout={layout} stats={stats} />
            </div>
          </div>
        </div>
      )}

      {/* ── Data Table tab ── */}
      {tab === "data" && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Data Table</h2>
              <p className="text-xs text-gray-400 mt-0.5">Lihat dan cari data responden. Gunakan search dan filter untuk menemukan data spesifik.</p>
            </div>
          </div>
          <DataEditor />
        </div>
      )}
    </div>
  );
}
