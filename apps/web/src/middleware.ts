import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supportedLngs } from "@rallly/languages";
import { getLocaleFromRequest, setLocaleCookie } from "@/lib/locale/server";

export const middleware = async (req: NextRequest) => {
  const { nextUrl } = req;
  const newUrl = nextUrl.clone();
  const pathname = newUrl.pathname;

  // Check if pathname already starts with a locale
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0];
  const hasLocale = firstSegment && supportedLngs.includes(firstSegment);

  let locale: string;
  let finalPathname: string;
  let pathnameWithoutLocale: string;

  if (hasLocale) {
    // If locale is already in path, use it and remove it from pathname
    locale = firstSegment;
    pathnameWithoutLocale = pathSegments.length > 1 
      ? `/${pathSegments.slice(1).join("/")}` 
      : "/";
    finalPathname = pathname; // Keep full path for rewrite
  } else {
    // If no locale, get from request and prepend it
    locale = getLocaleFromRequest(req);
    pathnameWithoutLocale = pathname;
    finalPathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    
    // For root path, redirect instead of rewrite to ensure URL changes
    if (pathname === "/") {
      const redirectUrl = newUrl.clone();
      redirectUrl.pathname = `/${locale}`;
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
