import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/vendor") && role !== "VENDOR") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: { authorized: ({ token }) => !!token }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/customer/:path*"]
};
