/**
 * Pure label/color helpers — no server imports.
 * Safe to use in both client and server components.
 */

export function sdqRangeLabel(label: string): string {
  if (label === "Normal")     return "Normal (≤15)";
  if (label === "Borderline") return "Borderline (16–19)";
  return "Abnormal (≥20)";
}

export function iaaRangeLabel(label: string): string {
  if (label === "Tidak/Sedikit Kecanduan") return "Tidak/Sedikit Kecanduan (<30)";
  if (label === "Kecanduan Borderline")    return "Kecanduan Borderline (30–39)";
  if (label === "Kemungkinan Kecanduan")   return "Kemungkinan Kecanduan (40–59)";
  return "Kecanduan Signifikan (≥60)";
}

export function iaaValueColor(label: string): string {
  if (label === "Tidak/Sedikit Kecanduan") return "text-green-600";
  if (label === "Kecanduan Borderline")    return "text-amber-500";
  if (label === "Kemungkinan Kecanduan")   return "text-red-500";
  return "text-red-800";
}

export function sdqValueColor(label: string): string {
  if (label === "Normal")     return "text-green-600";
  if (label === "Borderline") return "text-amber-500";
  return "text-red-600";
}

export const IAA_STATUSES = [
  "Tidak/Sedikit Kecanduan",
  "Kecanduan Borderline",
  "Kemungkinan Kecanduan",
  "Kecanduan Signifikan",
] as const;

export const IAA_COLORS: Record<string, string> = {
  "Tidak/Sedikit Kecanduan": "#1D9E75",
  "Kecanduan Borderline":    "#EF9F27",
  "Kemungkinan Kecanduan":   "#E05C5C",
  "Kecanduan Signifikan":    "#991B1B",
};

export const SDQ_COLORS: Record<string, string> = {
  Normal:     "#1D9E75",
  Borderline: "#EF9F27",
  Abnormal:   "#E05C5C",
};
