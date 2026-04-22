import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROUTES = [
  "/dashboard",
  "/clients",
  "/pipeline",
  "/sessions",
  "/group-sessions",
  "/cohorts",
  "/library",
  "/simulator",
  "/questionnaire",
  "/submissions",
  "/leads",
  "/posts",
  "/comments",
  "/behavioral-intel",
  "/admin",
  "/api/generate-client-profile",
  "/api/generate-coaching-playbook",
  "/api/generate-cohort-outline",
  "/api/generate-group-session",
  "/api/generate-profile",
  "/api/generate-session-brief",
  "/api/generate-session-curriculum",
  "/api/generate-session-plan",
  "/api/clients",
  "/api/sessions",
  "/api/leads",
  "/api/library/upload",
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
    "/group-sessions/:path*",
    "/cohorts/:path*",
    "/library/:path*",
    "/simulator/:path*",
    "/questionnaire/:path*",
    "/submissions/:path*",
    "/leads/:path*",
    "/posts/:path*",
    "/comments/:path*",
    "/behavioral-intel/:path*",
    "/admin/:path*",
    "/api/generate-:path*",
    "/api/clients/:path*",
    "/api/sessions/:path*",
    "/api/leads/:path*",
    "/api/library/upload",
  ],
};
