import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminPanel from "@/components/admin/AdminPanel";
import type { DashboardLayout } from "@/types";

async function getLayoutConfig(): Promise<DashboardLayout> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/layout`, { cache: "no-store" });
    const { layout } = await res.json();
    return layout;
  } catch {
    return { gridLayout: [], widgets: [] };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if ((session.user as any).role !== "admin") redirect("/");

  const config = await getLayoutConfig();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Kesehatan Mental Siswa — SDQ &amp; IAA</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{session.user?.email}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">admin</span>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">← Publik</a>
          <a href="/api/auth/signout" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Keluar</a>
        </div>
      </header>
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <AdminPanel initialConfig={config} />
      </div>
    </main>
  );
}