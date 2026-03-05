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
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
    error(code, ...message) {
      const err = message[0];
      const cause = err instanceof Error ? { message: err.message, stack: err.stack, cause: (err as any).cause } : err;
      console.error("[auth][error]", code, JSON.stringify(cause));
    },
  },
  pages: {
    signIn: "/login",
  },
});
