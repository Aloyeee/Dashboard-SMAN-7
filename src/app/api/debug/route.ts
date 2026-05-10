import { NextRequest, NextResponse } from "next/server";
import { readSheet } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get("sheet") ?? "Skor_SQD";
  try {
    const rows = await readSheet(`${sheet}!A1:AZ3`);
    return NextResponse.json({ ok: true, sheet, headers: rows[0], preview: rows.slice(1, 3) });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
