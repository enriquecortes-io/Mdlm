"use client";
import Link from "next/link";
import { useState } from "react";

interface Props { locale: string; }

const ACCENT = "#2D4A3E";
const TEXT = "#1A1714";
const MUTED = "rgba(26,23,20,0.55)";
const BORDER = "rgba(26,23,20,0.1)";

const T: Record<string, any> = {
  es: {
    newsletterTitle: "Únase a The Edit",
    newsletterSub: "Acceso privado a nuevas incorporaciones antes de su publicación.",
    placeholder: "Su email",
    send: "Enviar",
    sent: "Gracias, le mantendremos informado.",
    propiedades: "Propiedades",
    sobre: "Sobre Nosotros",
    legalCol: "Legal",
    contacto: "Contacto",
    rights: `© ${new Date().getFullYear()} The Edit Marbella. Todos los derechos reservados.`,
  },
  en: {
    newsletterTitle: "Join The Edit",
    newsletterSub: "Private access to new listings before they go public.",
    placeholder: "Your email",
    send: "Send",
    sent: "Thank you, we'll keep you updated.",
    propiedades: "Properties",
    sobre: "About Us",
    legalCol: "Legal",
    contacto: "Contact",
    rights: `© ${new Date().getFullYear()} The Edit Marbella. All rights reserved.`,
  },
};

export default function SiteFooter({ locale = "es" }: Props) {
  const t = T[locale] || T.es;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) throw new Error("fail");
      setSent(true);
    } catch {
      setError(true);
    }
  };

  return (
    <footer style={{
      width: "100%",
      marginTop: "clamp(2rem,4vw,3rem)",
      borderTop: `1px solid ${BORDER}`,
      paddingTop: "clamp(2rem,4vw,3rem)",
      fontFamily: "'Montserrat',sans-serif",
    }}>
      {/* Newsletter */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: "0.8rem", marginBottom: "clamp(2rem,4vw,3rem)",
        padding: "0 1rem",
      }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.4rem,2.5vw,2rem)",
          fontWeight: 600, color: TEXT, margin: 0,
        }}>{t.newsletterTitle}</h3>
        <p style={{ fontSize: "0.7rem", color: MUTED, margin: 0, maxWidth: "420px", lineHeight: 1.6 }}>
          {t.newsletterSub}
        </p>
        {sent ? (
          <p style={{ fontSize: "0.7rem", color: ACCENT, marginTop: "0.5rem" }}>{t.sent}</p>
        ) : (
          <>
          {error && (
            <p style={{ fontSize: "0.65rem", color: "#b04444", marginTop: "0.3rem" }}>
              {locale === "en" ? "Something went wrong, please try again." : "Algo salió mal, inténtelo de nuevo."}
            </p>
          )}
          <form onSubmit={handleSubmit} style={{
            display: "flex", gap: "0.5rem", marginTop: "0.6rem",
            width: "100%", maxWidth: "380px",
          }}>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              style={{
                flex: 1, padding: "0.6rem 0.9rem", fontSize: "0.7rem",
                border: `1px solid ${BORDER}`, background: "transparent",
                fontFamily: "'Montserrat',sans-serif", color: TEXT, outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "0.6rem 1.2rem", fontSize: "0.6rem", letterSpacing: "0.15em",
              textTransform: "uppercase", background: ACCENT, color: "#fff",
              border: "none", cursor: "pointer", fontWeight: 600,
            }}>{t.send}</button>
          </form>
          </>
        )}
      </div>

      {/* Columnas */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        gap: "2rem", paddingBottom: "clamp(1.5rem,3vw,2rem)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: "140px" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontWeight: 600 }}>{t.propiedades}</span>
          <Link href={`/${locale}/propiedades`} style={{ fontSize: "0.7rem", color: MUTED, textDecoration: "none" }}>{t.propiedades}</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: "140px" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontWeight: 600 }}>{t.legalCol}</span>
          <Link href={`/${locale}/legal`} style={{ fontSize: "0.7rem", color: MUTED, textDecoration: "none" }}>Aviso Legal</Link>
          <Link href={`/${locale}/privacidad`} style={{ fontSize: "0.7rem", color: MUTED, textDecoration: "none" }}>Privacidad</Link>
          <Link href={`/${locale}/cookies`} style={{ fontSize: "0.7rem", color: MUTED, textDecoration: "none" }}>Cookies</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: "180px" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontWeight: 600 }}>{t.contacto}</span>
          <a href="mailto:info@theeditmarbella.com" style={{ fontSize: "0.7rem", color: MUTED, textDecoration: "none" }}>info@theeditmarbella.com</a>
          <a href="tel:+34610589716" style={{ fontSize: "0.7rem", color: MUTED, textDecoration: "none" }}>+34 610 589 716</a>
          <span style={{ fontSize: "0.7rem", color: MUTED, lineHeight: 1.6 }}>Urb. La Alzambra, Centro de Negocios Vasari<br/>Marbella, Málaga<br/>España</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: "140px" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontWeight: 600 }}>Social</span>
          <div style={{ display: "flex", gap: "0.9rem" }}>
            <a href="https://www.instagram.com/theeditmarbella/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: MUTED }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/130454848/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: MUTED }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A5 5 0 0 1 16 8z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Barra legal */}
      <div style={{
        borderTop: `1px solid ${BORDER}`, paddingTop: "1rem", paddingBottom: "1rem",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "0.55rem", color: MUTED, margin: 0, letterSpacing: "0.05em" }}>{t.rights}</p>
      </div>
    </footer>
  );
}
