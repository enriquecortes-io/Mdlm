import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE = false; // Cambia a false para desactivar

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Redirección 301 del dominio antiguo al nuevo
  if (host.includes("vercel.app")) {
    const url = request.nextUrl.clone();
    url.host = "www.theeditmarbella.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }


  // Permitir acceso al admin y assets
  if (
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/maintenance") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (MAINTENANCE) {
   const isHome = pathname === "/" || pathname === "/es" || pathname === "/en" || pathname === "/fr" || pathname === "/ru" || pathname === "/es/" || pathname === "/en/" || pathname === "/fr/" || pathname === "/ru/";
   if (isHome) {
     const url = request.nextUrl.clone();
     url.pathname = "/maintenance";
     return NextResponse.rewrite(url);
   }
 }

  const locales = ["en", "es", "fr", "ru"];
  const defaultLocale = "es";

  if (pathname.startsWith("/api/admin")) {
    const origin = request.headers.get("origin") || "";
    const host = request.headers.get("host") || "";
    const referer = request.headers.get("referer") || "";

    const isInternal =
      origin === "" ||
      origin.includes(host) ||
      referer.includes(host);

    if (!isInternal) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith("/" + locale + "/") || pathname === "/" + locale
  );

  if (pathnameHasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/" + defaultLocale + pathname;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\.ico|videos|gallery|fonts|[^/]+\.[^/]+$).*)"],
};
