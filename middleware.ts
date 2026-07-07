import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["es", "en", "fr", "ru"],
  defaultLocale: "es",
});

export const config = {
  matcher: [
    // Solo rutas de páginas, nunca /api/
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
