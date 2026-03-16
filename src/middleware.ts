import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redirectRules: Array<{ from: string[]; to: string }> = [
  {
    from: ["/reports/report-generator", "/reports/report-history", "/billing"],
    to: "/reports"
  },
  {
    from: ["/admin/user-management", "/admin/role-permissions", "/admin/audit-logs", "/admin/backup-recovery"],
    to: "/admin"
  }
];

const bypassPrefixes = ["/_next", "/api", "/favicon", "/login", "/signup", "/auth"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (bypassPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) {
    return NextResponse.next();
  }

  for (const rule of redirectRules) {
    if (rule.from.some((prefix) => matchesPrefix(pathname, prefix))) {
      if (matchesPrefix(pathname, rule.to)) {
        return NextResponse.next();
      }
      const url = request.nextUrl.clone();
      url.pathname = rule.to;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"]
};
