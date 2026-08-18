import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes require ADMIN role
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", req.url));
    }

    // Dashboard requires SHOP_OWNER or ADMIN
    if (
      pathname.startsWith("/dashboard") &&
      token?.role !== "SHOP_OWNER" &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL(`/login?next=${pathname}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Protected routes require a token
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/orders")
        ) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/orders/:path*"],
};
