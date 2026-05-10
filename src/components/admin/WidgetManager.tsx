"use client";

import { useState } from "react";
import { X, BarChart3, Table, Gauge } from "lucide-react";
import type { WidgetConfig, ChartType, WidgetType } from "@/types";
import { CHART_TYPES, WIDGET_TYPES, PRESET_COLORS, AVAILABLE_SHEETS } from "@/types";

interface Props {
  widgets: WidgetConfig[];
  onChange: (widgets: WidgetConfig[]) => void;
}

function uid() {
  return "w" + Math.random().toString(36).slice(2, 7);
}

const DEFAULT_WIDGET: Omit<WidgetConfig, "id"> = {
  type: "chart",
  title: "Widget Baru",
  dataRange: "Skor_IAA!A1:Z200",
  chartType: "bar",
  color: "#378ADD",
};

export default function WidgetManager({ widgets, onChange }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<WidgetConfig | null>(null);

  const startEdit = (w: WidgetConfig) => { setEditing(w.id); setDraft({ ...w }); };

  const addWidget = () => {
    const nw: WidgetConfig = { id: uid(), ...DEFAULT_WIDGET };
    onChange([...widgets, nw]);
    setEditing(nw.id);
    setDraft(nw);
  };

  const saveEdit = () => {
    if (!draft) return;
    onChange(widgets.map(w => w.id === draft.id ? draft : w));
    setEditing(null); setDraft(null);
  };

  const removeWidget = (id: string) => {
    onChange(widgets.filter(w => w.id !== id));
    if (editing === id) { setEditing(null); setDraft(null); }
  };

  const upd = (patch: Partial<WidgetConfig>) => setDraft(d => d ? { ...d, ...patch } : d);
  const parseSheet = (r: string) => r.split("!")[0] ?? "Skor_IAA";
  const parseRange = (r: string) => r.split("!")[1] ?? "A1:Z200";

  return (
    <div className="flex gap-4" style={{ minHeight: 420 }}>
      {/* Widget list */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2">
        <button onClick={addWidget} className="w-full text-sm py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
          + Tambah Widget
        </button>
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
          {widgets.map(w => (
            <div key={w.id} onClick={() => startEdit(w)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                editing === w.id ? "border-blue-400 bg-blue-50 text-blue-800" : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
              }`}>
              <span className="truncate inline-flex items-center gap-2">
                {w.type === "chart" ? <BarChart3 className="h-4 w-4" /> : w.type === "table" ? <Table className="h-4 w-4" /> : <Gauge className="h-4 w-4" />}
                {w.title}
              </span>
              <button onClick={e => { e.stopPropagation(); removeWidget(w.id); }} className="text-gray-300 hover:text-red-500 ml-1 flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!widgets.length && <p className="text-xs text-gray-400 text-center py-6">Belum ada widget</p>}
        </div>
      </div>

      {/* Editor */}
      {draft ? (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Konfigurasi Widget</h3>
          <div className="space-y-4">

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Judul</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={draft.title} onChange={e => upd({ title: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Tipe Widget</label>
              <div className="flex gap-2">
                {WIDGET_TYPES.map(t => (
                  <button key={t.value} onClick={() => upd({ type: t.value as WidgetType })}
                    className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                      draft.type === t.value ? "border-blue-400 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {draft.type === "chart" && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Tipe Chart</label>
                <div className="grid grid-cols-2 gap-2">
                  {CHART_TYPES.map(t => (
                    <button key={t.value} onClick={() => upd({ chartType: t.value as ChartType })}
                      className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                        draft.chartType === t.value ? "border-blue-400 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Sheet Sumber Data</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={parseSheet(draft.dataRange)}
                onChange={e => upd({ dataRange: `${e.target.value}!${parseRange(draft.dataRange)}` })}>
                {AVAILABLE_SHEETS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Range (cth: A1:Z200)</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
                value={parseRange(draft.dataRange)}
                onChange={e => upd({ dataRange: `${parseSheet(draft.dataRange)}!${e.target.value}` })} />
              <p className="text-xs text-gray-400 mt-1">Baris pertama = header kolom</p>
            </div>

            {draft.type === "chart" && draft.chartType !== "pie" && draft.chartType !== "radar" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Kolom X (label)</label>
                  <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Kosongkan = kolom pertama"
                    value={draft.xKey ?? ""} onChange={e => upd({ xKey: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Kolom Y (pisah koma)</label>
                  <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="cth: Total Skor IAA, Umur"
                    value={draft.yKeys?.join(", ") ?? ""}
                    onChange={e => upd({ yKeys: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Warna Utama</label>
              <div className="flex gap-2 flex-wrap items-center">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => upd({ color: c })} style={{ background: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${draft.color === c ? "border-gray-700 scale-110" : "border-transparent"}`} />
                ))}
                <input type="color" value={draft.color ?? "#378ADD"} onChange={e => upd({ color: e.target.value })}
                  className="w-7 h-7 rounded-full cursor-pointer border border-gray-200" title="Kustom" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={saveEdit} className="flex-1 text-sm py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Simpan
              </button>
              <button onClick={() => { setEditing(null); setDraft(null); }} className="text-sm py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          Pilih widget untuk dikonfigurasi
        </div>
      )}
    </div>
  );
}
