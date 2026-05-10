import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { readSheet, writeSheet } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get("sheet") ?? "Sheet1";
  const range = searchParams.get("range") ?? "A1:Z200";

  try {
    const rows = await readSheet(`${sheet}!${range}`);
    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { sheet, range, values } = await req.json();
    await writeSheet(`${sheet}!${range}`, values);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
