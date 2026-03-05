import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// Whitelist of allowed email addresses
const ALLOWED_EMAILS = [
  "mikeconnors193@gmail.com",
  "lunarischarlie@gmail.com",
  "lane.emilykay@gmail.com",
  "steph.r.emanuele@gmail.com",
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"], // disable PKCE — pkceCodeVerifier cookie unreliable on Vercel serverless
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      console.log("[auth] signIn callback for:", user.email);
      // Only allow whitelisted emails
      if (!user.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
        console.log("[auth] email not whitelisted:", user.email);
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  logger: {
    error(error: Error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cause = (error as any).cause;
      console.error("[auth][error]", error.message, JSON.stringify({
        name: error.name,
        message: error.message,
        cause: cause instanceof Error
          ? { message: cause.message, stack: cause.stack }
          : cause,
      }));
    },
  },
  pages: {
    signIn: "/login",
  },
});
