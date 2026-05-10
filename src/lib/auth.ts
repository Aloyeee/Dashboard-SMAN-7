import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session }) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
      if (session.user?.email) {
        (session.user as any).role = adminEmails.includes(session.user.email)
          ? "admin"
          : "viewer";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
};

export function isAdmin(session: any): boolean {
  return session?.user?.role === "admin";
}