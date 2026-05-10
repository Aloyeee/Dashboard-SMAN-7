"use client";

import { useState, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { DashboardLayout, WidgetConfig } from "@/types";
import ChartWidget from "./widgets/ChartWidget";
import TableWidget from "./widgets/TableWidget";
import StatWidget from "./widgets/StatWidget";

const ResponsiveGrid = WidthProvider(Responsive);

interface Props {
  isAdmin: boolean;
  config: DashboardLayout;
}

export default function DashboardGrid({ isAdmin, config }: Props) {
  const [layout, setLayout] = useState<Layout[]>(config.gridLayout);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    setSaved(false);
  }, []);

  const saveLayout = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: { ...config, gridLayout: layout } }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case "chart": return <ChartWidget config={widget} />;
      case "table": return <TableWidget config={widget} />;
      case "stat":  return <StatWidget config={widget} />;
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-200">
          <span className="text-sm text-blue-700 font-medium">⚙ Admin mode — drag &amp; resize widgets freely</span>
          <button
            onClick={saveLayout}
            disabled={saving}
            className="ml-auto text-sm px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save layout"}
          </button>
        </div>
      )}

      <ResponsiveGrid
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 768, sm: 480 }}
        cols={{ lg: 12, md: 8, sm: 4 }}
        rowHeight={80}
        margin={[12, 12]}
        isDraggable={isAdmin}
        isResizable={isAdmin}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        {config.widgets.map(widget => (
          <div
            key={widget.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-100 ${isAdmin ? "drag-handle cursor-grab active:cursor-grabbing" : ""}`}>
              <h3 className="text-sm font-medium text-gray-600">{widget.title}</h3>
              {isAdmin && <span className="text-xs text-gray-300 select-none">⠿ drag</span>}
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {renderWidget(widget)}
            </div>
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
}
