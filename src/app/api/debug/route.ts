import { NextRequest, NextResponse } from "next/server";
import { readSheet } from "@/lib/sheets";

// Temporary debug route — remove before deploying to production
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get("sheet") ?? "Sheet1";

  try {
    const rows = await readSheet(`${sheet}!A1:Z10`);
    return NextResponse.json({
      ok: true,
      sheet,
      rowCount: rows.length,
      headers: rows[0] ?? [],
      preview: rows.slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      sheet,
      error: err.message ?? String(err),
    }, { status: 500 });
  }
}
