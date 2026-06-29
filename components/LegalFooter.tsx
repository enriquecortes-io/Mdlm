"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function LegalFooter() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const phase = (e as CustomEvent).detail; setVisible(phase === "filters");
    };
    window.addEventListener("scrollphase", handler);
    return () => window.removeEventListener("scrollphase", handler);
  }, []);

  if (pathname.includes("/admin")) return null;

  return (
    <div style={{
      position:"fixed", bottom:"0.8rem", left:"50%",
      transform:"translateX(-50%)",
      zIndex:30,
      display:"flex", gap:"1.5rem", alignItems:"center",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transition:"opacity 0.6s ease",
    }}>
      {[
        { href:`/${locale}/legal`, label:"Aviso Legal" },
        { href:`/${locale}/privacidad`, label:"Privacidad" },
        { href:`/${locale}/cookies`, label:"Cookies" },
      ].map(({ href, label }) => (
        <Link key={href} href={href} style={{
          fontFamily:"'Montserrat',sans-serif",
          fontSize:"0.4rem", fontWeight:300,
          color:"rgba(26,23,20,0.35)",
          letterSpacing:"0.3em", textTransform:"uppercase",
          textDecoration:"none",
          transition:"color 0.3s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.color="#2D4A3E";}}
        onMouseLeave={e=>{e.currentTarget.style.color="rgba(26,23,20,0.35)";}}>
          {label}
        </Link>
      ))}
    </div>
  );
}
