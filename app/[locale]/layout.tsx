import ContactHub from "@/components/ContactHub";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import SkyBackground from "@/components/SkyBackground";
import CookieBanner from "@/components/CookieBanner";
import LegalFooter from "@/components/LegalFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { notFound } from "next/navigation";
import Script from "next/script";

const locales = ["en", "es", "fr", "ru"];
import { BASE_URL } from "@/lib/config";

const META: Record<string, { title: string; description: string }> = {
  es: {
    title: "The Edit Marbella — Real Estate Curators | Marbella",
    description: "Selección privada de propiedades ultra-exclusivas en Marbella y la Costa del Sol. Real Estate Curators.",
  },
  en: {
    title: "The Edit Marbella — Real Estate Curators | Marbella",
    description: "A private selection of ultra-luxury properties in Marbella and the Costa del Sol. Real Estate Curators.",
  },
  fr: {
    title: "The Edit Marbella — Real Estate Curators | Marbella",
    description: "Une sélection privée de propriétés ultra-luxe à Marbella et la Costa del Sol. Real Estate Curators.",
  },
  ru: {
    title: "The Edit Marbella — Real Estate Curators | Marbella",
    description: "Частная подборка элитной недвижимости в Марбелье и Коста-дель-Соль. Real Estate Curators.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = META[locale] || META["en"];
  return {
    title: m.title,
    description: m.description,
    openGraph: {
      title: "The Edit Marbella — Real Estate Curators",
      description: m.description,
      images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630 }],
      type: "website",
      siteName: "The Edit Marbella",
      locale: locale === "es" ? "es_ES" : locale === "fr" ? "fr_FR" : locale === "ru" ? "ru_RU" : "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: "The Edit Marbella — Real Estate Curators",
      description: m.description,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        "es": `${BASE_URL}/es`,
        "en": `${BASE_URL}/en`,
        "fr": `${BASE_URL}/fr`,
        "ru": `${BASE_URL}/ru`,
        "x-default": `${BASE_URL}/en`,
      },
    },
  };
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "The Edit Marbella",
  "alternateName": "The Edit Marbella — Real Estate Curators",
  "description": "A private selection of ultra-luxury properties in Marbella and the Costa del Sol. Real Estate Curators.",
  "url": BASE_URL,
  "logo": `${BASE_URL}/og-default.jpg`,
  "image": `${BASE_URL}/og-default.jpg`,
  "priceRange": "€€€€€",
  "areaServed": [
    { "@type": "City", "name": "Marbella" },
    { "@type": "City", "name": "Estepona" },
    { "@type": "City", "name": "Benahavís" },
    { "@type": "City", "name": "Sotogrande" },
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 36.5100,
      "longitude": -4.8825,
    },
    "geoRadius": "50000",
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Marbella",
    "streetAddress": "Marbella, Málaga",
    "addressRegion": "Andalucía",
    "addressCountry": "ES",
    "postalCode": "29660",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.5100,
    "longitude": -4.8825,
  },
  "telephone": "+34 610 589 716",
  "sameAs": [],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  return (
    <html lang={locale}>
      <head>
        <link rel="preload" href="/fonts/cormorant-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="preload" href="/fonts/montserrat-300.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="stylesheet" href="/fonts/fonts.css"/>
      </head>
      <body style={{ background: "#FAFAF7", margin: 0 }}>
        {/* Microsoft Clarity */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-R597Y3M8HZ"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-R597Y3M8HZ');` }}
        />
        <Script
          id="clarity-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wvt1b8ox5g");` }}
        />
        {/* LocalBusiness Schema con coordenadas Marbella */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
        <CookieBanner />
        <LegalFooter />
        
        <ContactHub />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
