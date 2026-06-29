"use client";
import TheEditLogo from "./TheEditLogo";
import NeonButton from "@/components/ui/NeonButton";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const PRIVATE_VIEWING = {
  es: "Visita Privada",
  en: "Private Viewing",
  fr: "Visite Privée",
  ru: "Частный Просмотр",
} as const;

const LANGS = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "ru", label: "RU", name: "Русский" },
];

interface Props { locale?: string; onPrivateAccess?: () => void; showSocial?: boolean; }

export default function Navbar({ locale = "es", onPrivateAccess, showSocial = false }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    setOpen(false);
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    router.refresh();
  };

  const current = LANGS.find(l => l.code === locale) || LANGS[0];

  return (
    <>
      <style>{`
        @keyframes dropIn {
          0%  { opacity:0; transform:translateY(-8px); }
          100%{ opacity:1; transform:translateY(0); }
        }
        .lang-dropdown { animation: dropIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
        .lang-opt { transition: all 0.2s ease; }
        .lang-opt:hover { background: rgba(45,74,62,0.08) !important; color: #2D4A3E !important; }
        @keyframes neonPulse {
          0%,100% { text-shadow: 0 0 6px rgba(201,169,110,0.8), 0 0 12px rgba(201,169,110,0.5), 0 0 24px rgba(201,169,110,0.3); }
          50%     { text-shadow: 0 0 12px rgba(201,169,110,1), 0 0 24px rgba(201,169,110,0.8), 0 0 48px rgba(201,169,110,0.5), 0 0 80px rgba(201,169,110,0.2); }
        }
        .neon-btn { animation: neonPulse 2s ease-in-out infinite; }
      `}</style>

      <nav style={{
        position:"fixed", top:0, left:0, right:0,
        height:"4rem",
        display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center",
        padding:"0 2rem",
        zIndex:1000,
        background:"rgba(250,248,244,0.92)",
        backdropFilter:"blur(12px)",
        WebkitBackdropFilter:"blur(12px)",
        borderBottom:"1px solid #DDD8D0",
      }}>

                        {/* Logo THE EDIT MARBELLA */}
        <Link href={`/${locale}`} style={{ textDecoration:"none" }}>
          <TheEditLogo width={140} height={79} />
        </Link>

        {/* Private Access — solo si hay callback */}
        <div style={{ display:"flex", justifyContent:"center" }}>
          {onPrivateAccess && (
            <>
              <span onClick={onPrivateAccess} className="private-mobile" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", cursor:"pointer", color:"#2D4A3E", textShadow:"0 0 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(201,169,110,0.4)" }}>
                {PRIVATE_VIEWING[locale as keyof typeof PRIVATE_VIEWING] || "Private Viewing"}
              </span>
              <span className="private-desktop">
                <NeonButton onClick={onPrivateAccess}>
                  {PRIVATE_VIEWING[locale as keyof typeof PRIVATE_VIEWING] || "Private Viewing"}
                </NeonButton>
              </span>
              <style>{`.private-mobile{display:none}.private-desktop{display:inline}@media(max-width:768px){.private-mobile{display:inline!important}.private-desktop{display:none!important}}`}</style>
            </>
          )}
        </div>

        {/* Selector de idioma + redes sociales */}
        <div style={{ position:"relative", justifySelf:"end", display:"flex", alignItems:"center", gap:"1rem" }}>
          {showSocial && (
            <div style={{ display:"flex", alignItems:"center", gap:"0.8rem" }}>
              <a href="https://www.instagram.com/theeditmarbella/" target="_blank" rel="noopener noreferrer" style={{ color:"#2D4A3E", display:"flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/130454848/" target="_blank" rel="noopener noreferrer" style={{ color:"#2D4A3E", display:"flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A5 5 0 0 1 16 8z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2" fill="currentColor"/>
                </svg>
              </a>
            </div>
          )}
          <div style={{ position:"relative" }}>
          <button
            onClick={() => setOpen(p => !p)}
            style={{
              background:"none",
              border:`1px solid ${open?"#2D4A3E":"#DDD8D0"}`,
              color:"#111111",
              fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
              fontSize:"0.55rem",
              fontWeight:300,
              letterSpacing:"0.35em",
              textTransform:"uppercase",
              padding:"0.5rem 1.2rem",
              cursor:"pointer",
              display:"flex", alignItems:"center", gap:"0.6rem",
              transition:"all 0.2s ease",
            }}
          >
            {current.label}
            <span style={{
              fontSize:"0.4rem",
              opacity:0.5,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition:"transform 0.25s ease",
              display:"inline-block",
            }}>▼</span>
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="lang-dropdown"
              style={{
                position:"absolute", top:"calc(100% + 0.5rem)", right:0,
                background:"rgba(250,250,247,0.98)",
                backdropFilter:"blur(16px)",
                WebkitBackdropFilter:"blur(20px)",
                border:"1px solid #DDD8D0",
                minWidth:"10rem",
                overflow:"hidden",
              }}
            >
              {LANGS.map((lang, i) => (
                <button
                  key={lang.code}
                  className="lang-opt"
                  onClick={() => switchLocale(lang.code)}
                  style={{
                    width:"100%", textAlign:"left",
                    background: lang.code === locale ? "rgba(45,74,62,0.06)" : "transparent",
                    border:"none",
                    borderBottom: i < LANGS.length-1 ? "1px solid #DDD8D0" : "none",
                    padding:"0.9rem 1.4rem",
                    cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    gap:"1rem",
                  }}
                >
                  <span style={{
                    fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
                    fontSize:"0.55rem", fontWeight:300,
                    color: lang.code === locale ? "#c9a96e" : "#4A4540",
                    letterSpacing:"0.3em", textTransform:"uppercase",
                  }}>{lang.label}</span>
                  <span style={{
                    fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
                    fontSize:"0.45rem", fontWeight:200,
                    color: lang.code === locale ? "rgba(201,169,110,0.6)" : "#8A847C",
                    letterSpacing:"0.1em",
                  }}>{lang.name}</span>
                  {lang.code === locale && (
                    <span style={{ color:"#2D4A3E",
          textShadow:"0 0 10px rgba(201,169,110,0.9), 0 0 20px rgba(201,169,110,0.5), 0 0 40px rgba(201,169,110,0.3)", fontSize:"0.5rem" }}>✦</span>
                  )}
                </button>
              ))}
            </div>
          )}
          </div>
        </div>
      </nav>

      {/* Cerrar dropdown al click fuera */}
      {open && (
        <div
          style={{ position:"fixed", inset:0, zIndex:999 }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
