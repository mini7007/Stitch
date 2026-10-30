import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    vendorId?: string;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
      vendorId?: string;
    } & DefaultSession["user"];
  }
}
