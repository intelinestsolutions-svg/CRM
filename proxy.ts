import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";

const AUTH_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

const DISCOVERY_PATHS = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/index.md",
  "/markdown",
  "/.well-known/mcp/server-card.json",
  "/mcp",
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (AUTH_PATHS.includes(pathname)) return NextResponse.next();

  if (process.env.ADMIN_PUBLIC_DISCOVERY === "true" && DISCOVERY_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (await isAdminRequest(request)) {
    const accept = (request.headers.get("accept") ?? "").toLowerCase();
    if (pathname === "/" && accept.includes("text/markdown")) {
      return NextResponse.rewrite(new URL("/index.md", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|studio-pro-logo.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
