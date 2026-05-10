import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin & viewer dashboard powered by Google Sheets",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
