import { NextResponse } from "next/server";
import { getStatsData } from "@/lib/stats";

export async function GET() {
  try {
    const stats = await getStatsData();
    return NextResponse.json(
      { ok: true, ...stats },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" } }
    );
  } catch (err: any) {
    console.error("Stats error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
