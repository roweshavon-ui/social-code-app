import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROUTES = [
  "/dashboard",
  "/clients",
  "/pipeline",
  "/sessions",
  "/library",
  "/simulator",
  "/questionnaire",
  "/submissions",
  "/leads",
  "/posts",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdminRoute) {
    const token = req.cookies.get("sc_admin")?.value;
    const expected = process.env.ADMIN_TOKEN;

    if (!token || token !== expected) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/pipeline/:path*",
    "/sessions/:path*",
    "/library/:path*",
    "/simulator/:path*",
    "/questionnaire/:path*",
    "/submissions/:path*",
    "/leads/:path*",
    "/posts/:path*",
  ],
};
