import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { readSheet, writeSheet } from "@/lib/sheets";
import type { DashboardLayout } from "@/types";

const DEFAULT_LAYOUT: DashboardLayout = {
  gridLayout: [
    { i: "w1", x: 0, y: 0, w: 6, h: 4 },
    { i: "w2", x: 6, y: 0, w: 6, h: 4 },
    { i: "w3", x: 0, y: 4, w: 4, h: 3 },
    { i: "w4", x: 4, y: 4, w: 4, h: 3 },
    { i: "w5", x: 8, y: 4, w: 4, h: 3 },
  ],
  widgets: [
    { id: "w1", type: "chart", title: "Monthly Sales", dataRange: "Sheet1!A1:B13", chartType: "bar" },
    { id: "w2", type: "chart", title: "Revenue Trend", dataRange: "Sheet1!A1:C13", chartType: "line" },
    { id: "w3", type: "stat",  title: "Total Users",   dataRange: "Sheet1!E1:E2" },
    { id: "w4", type: "stat",  title: "Revenue",       dataRange: "Sheet1!F1:F2" },
    { id: "w5", type: "table", title: "Recent Data",   dataRange: "Sheet1!A1:D6" },
  ],
};

export async function GET() {
  try {
    const rows = await readSheet("Config!A1");
    const raw = rows?.[0]?.[0];
    const layout = raw ? JSON.parse(raw) : DEFAULT_LAYOUT;
    return NextResponse.json({ layout });
  } catch {
    return NextResponse.json({ layout: DEFAULT_LAYOUT });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { layout } = await req.json();
    await writeSheet("Config!A1", [[JSON.stringify(layout)]]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Layout save error:", err);
    return NextResponse.json({ error: "Failed to save layout" }, { status: 500 });
  }
}
