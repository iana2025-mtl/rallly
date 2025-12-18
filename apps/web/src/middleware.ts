import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supportedLngs } from "@rallly/languages";
import { getLocaleFromRequest, setLocaleCookie } from "@/lib/locale/server";

export const middleware = async (req: NextRequest) => {
  const { nextUrl } = req;
  const newUrl = nextUrl.clone();
  const pathname = newUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/p/", "/api/", "/auth/"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get locale first
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0];
  const hasLocale = firstSegment && supportedLngs.includes(firstSegment);
  const locale = hasLocale ? firstSegment : getLocaleFromRequest(req);

  // Calculate pathname without locale for checking
  let pathnameWithoutLocale: string;
  if (hasLocale) {
    pathnameWithoutLocale = pathSegments.length > 1 
      ? `/${pathSegments.slice(1).join("/")}` 
      : "/";
  } else {
    pathnameWithoutLocale = pathname;
  }

  // For root path or locale-only path (like "/en"), redirect to login
  // Note: next.config.js redirects "/" to "/en", so middleware sees "/en"
  const isRootOrLocaleOnly = pathname === "/" || 
    pathname === `/${locale}` || 
    pathname === `/${locale}/` ||
    (hasLocale && pathnameWithoutLocale === "/");
  
  if (isRootOrLocaleOnly && !isPublicRoute) {
    const loginUrl = newUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  // Continue with locale routing
  let finalPathname: string;

  if (hasLocale) {
    finalPathname = pathname;
  } else {
    finalPathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    
    // For root path, redirect instead of rewrite to ensure URL changes
    if (pathname === "/") {
      const redirectUrl = newUrl.clone();
      redirectUrl.pathname = `/${locale}/login`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  newUrl.pathname = finalPathname;

  const res = NextResponse.rewrite(newUrl);

  setLocaleCookie(req, res, locale);

  res.headers.set("x-locale", locale);
  res.headers.set("x-pathname", pathnameWithoutLocale);

  return res;
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|static|.*\\.).*)"],
};