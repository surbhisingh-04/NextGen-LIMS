import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import {
  canRoleAccessPath,
  getRoleDashboardPath,
  isProtectedRoute,
  normalizeUserRole
} from "@/lib/rbac";

const publicRoutes = new Set(["/", "/login", "/signup"]);

function isAssetRoute(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAssetRoute(pathname) || (!publicRoutes.has(pathname) && !isProtectedRoute(pathname))) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasLiveSupabase =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseAnonKey !== "your-anon-key";

  if (!hasLiveSupabase) {
    if (isProtectedRoute(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set(
        "message",
        "Supabase Auth must be configured before protected routes can be accessed."
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        response.cookies.set({ name, value: "", ...options });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedRoute(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("message", "Please log in to continue.");
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const roleResponse = await supabase.rpc("current_user_role");
  const role =
    normalizeUserRole(typeof roleResponse.data === "string" ? roleResponse.data : null) ??
    normalizeUserRole(
      typeof user.user_metadata?.role === "string"
        ? user.user_metadata.role
        : typeof user.app_metadata?.role === "string"
          ? user.app_metadata.role
          : null
    );

  if (!role) {
    if (publicRoutes.has(pathname)) {
      return response;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "error",
      "Your account is authenticated, but no application role is assigned yet."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (publicRoutes.has(pathname)) {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  if (!canRoleAccessPath(role, pathname)) {
    const redirectUrl = new URL(getRoleDashboardPath(role), request.url);
    redirectUrl.searchParams.set("message", "You do not have access to that workspace.");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
