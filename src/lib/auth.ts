import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

/* Google sign-in is enabled only when both credentials are present —
   with a blank .env the provider is omitted entirely and the UI hides
   the Google button (it discovers availability via /api/auth/providers). */
const googleCredentials =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          // Allows linking Google to an existing account created earlier
          // with the same (verified) email via password signup.
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vendor: true }
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          vendorId: user.vendor?.id
        };
      }
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...googleCredentials,
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      /* Sync the token with our database at sign-in AND on every session
         access, so the session always carries the current Prisma id/role.
         - At sign-in, `user` holds the provider profile (Google gives no role).
         - On later session access, `token.email` drives a re-sync — this is
           what lets a role chosen before the Google redirect (picked up by
           /oauth/welcome → /api/auth/oauth-role) reach the session. */
      const email = typeof user?.email === "string" ? user.email : token.email;
      if (typeof email === "string") {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email },
            include: { vendor: true },
          });

          // First-time Google login → provision a customer account automatically
          if (!dbUser && account?.provider === "google") {
            try {
              dbUser = await prisma.user.create({
                data: {
                  email,
                  name: user?.name ?? email.split("@")[0],
                  role: UserRole.CUSTOMER,
                },
                include: { vendor: true },
              });
            } catch {
              // Unique-race fallback (two parallel session calls) — re-read
              dbUser = await prisma.user.findUnique({
                where: { email },
                include: { vendor: true },
              });
            }
          }

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.vendorId = dbUser.vendor?.id;
          }
        } catch {
          // DB hiccup → keep the existing token as-is
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.vendorId = token.vendorId as string | undefined;
      }
      return session;
    }
  }
};
