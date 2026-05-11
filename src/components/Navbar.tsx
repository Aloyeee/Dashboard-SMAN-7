"use client";

import { useState } from "react";
import { Menu, X, Settings } from "lucide-react";
import type { Session } from "next-auth";

type NavbarProps = {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
};

export default function Navbar({ session, status }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "admin";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/results", label: "Dashboard" },
  ];

  const actionLink = isAdmin
    ? { href: "/dashboard", label: "Panel Admin", icon: Settings }
    : { href: "/signin", label: "Login Admin" };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".7" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".7" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            Dashboard Skrining Kesehatan Mental dan Kecanduan Digital SMA 7 Semarang
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-24 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <>
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-xs font-medium px-3 py-2 text-gray-600 hover:text-gray-800">
                    {link.label}
                  </a>
                ))}
                <a
                  href={actionLink.href}
                  className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isAdmin ? <Settings className="h-4 w-4" /> : null}
                  {actionLink.label}
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4">
          <div className="flex flex-col gap-2">
            {status === "loading" ? (
              <div className="space-y-2">
                <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
              </div>
            ) : (
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={actionLink.href}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  {isAdmin ? <Settings className="h-4 w-4" /> : null}
                  {actionLink.label}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
