import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readSheet, writeSheet } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "Skor_IAA!A1:Z100";

  try {
    const data = await readSheet(range);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Sheets read error:", err);
    return NextResponse.json({ error: "Failed to read sheet" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { range, values } = await req.json();
    await writeSheet(range, values);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sheets write error:", err);
    return NextResponse.json({ error: "Failed to write sheet" }, { status: 500 });
  }
}
