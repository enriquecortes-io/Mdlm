"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { convertGDriveUrl } from "@/lib/gdrive";
import NeonButton from "@/components/ui/NeonButton";

interface Property {
  slug: string;
  titulo: Record<string, string> | string;
  precio: number;
  ubicacion: string;
  m2_construidos: number;
  habitaciones: number;
  banos: number;
  m2_parcela: number;
  descripcion: Record<string, string> | string;
  galeria_urls: string[];
  tipo?: string;
  zona?: string;
}

const FILTERS_DEF = [
  { id:"zona",        label:"Zona",        options:["marbella","estepona","mijas","benahavis","sotogrande"] },
  { id:"ubicacion",   label:"Ubicación",   options:["golden mile","nueva andalucia","puerto banus","sierra blanca","la zagaleta","los monteros","el madroñal"] },
  { id:"tipo",        label:"Tipo",        options:["villa","apartment","penthouse","townhouse","plot"] },
  { id:"habitaciones",label:"Hab.",        options:["2","3","4","5","6+"] },
  { id:"precio",      label:"Precio",      options:["500k-1m","1m-2m","2m-5m","5m+"] },
];

const PRICE_LABELS: Record<string,string> = { "500k-1m":"500K–1M", "1m-2m":"1M–2M", "2m-5m":"2M–5M", "5m+":"5M+" };
const HAB_LABELS: Record<string,string> = { "2":"2+","3":"3+","4":"4+","5":"5+","6+":"6+" };

// Paleta
const ACCENT   = "#2D4A3E";
const TEXT     = "#1A1714";
const TEXT2    = "#4A4540";
const MUTED    = "#8A847C";
const BG       = "#FAF8F4";
const BG_SOFT  = "#F2EDE4";
const BORDER   = "#DDD8D0";

const T: Record<string,Record<string,string>> = {
  es: { surface:"Superficie", bedrooms:"Hab.", bathrooms:"Baños", price:"Precio", viewProperty:"Ver propiedad", loading:"Cargando..." },
  en: { surface:"Built", bedrooms:"Bed.", bathrooms:"Bath", price:"Price", viewProperty:"View property", loading:"Loading..." },
  fr: { surface:"Surface", bedrooms:"Ch.", bathrooms:"SdB", price:"Prix", viewProperty:"Voir", loading:"Chargement..." },
  ru: { surface:"Пл.", bedrooms:"Сп.", bathrooms:"Ван.", price:"Цена", viewProperty:"Смотреть", loading:"Загрузка..." },
};

function getTitle(p: Property, locale: string) {
  return typeof p.titulo === "object" ? p.titulo[locale] || p.titulo["es"] || "" : p.titulo;
}
function getDesc(p: Property, locale: string) {
  const d = typeof p.descripcion === "object"
    ? (p.descripcion as any)[locale] || (p.descripcion as any)["es"] || ""
    : p.descripcion || "";
  return d.match(/^[^.!?]+[.!?]/)?.[0] || "";
}
function matchPrice(precio: number, filter: string) {
  if (filter === "500k-1m") return precio >= 500000 && precio < 1000000;
  if (filter === "1m-2m")   return precio >= 1000000 && precio < 2000000;
  if (filter === "2m-5m")   return precio >= 2000000 && precio < 5000000;
  if (filter === "5m+")     return precio >= 5000000;
  return true;
}

interface PreviewProps { property: Property; locale: string; onClose: () => void; }

function PropertyPreview({ property: p, locale, onClose }: PreviewProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const t = T[locale] || T.es;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const title = getTitle(p, locale);
  const desc = getDesc(p, locale);
  const imgs = (p.galeria_urls || []).map(url => convertGDriveUrl(url));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"rgba(26,23,20,0.7)",
      display:"flex",
      alignItems: isMobile ? "flex-end" : "center",
      justifyContent:"center",
      padding: isMobile ? "0" : "clamp(1rem,3vw,2rem)",
      paddingTop: isMobile ? "env(safe-area-inset-top, 0px)" : undefined,
      backdropFilter:"blur(8px)",
    }} onClick={onClose}>
      <div style={{
        width: isMobile ? "100vw" : "75vw",
        height: isMobile ? "calc(100dvh - 4rem)" : "75vh",
        marginTop: isMobile ? "4rem" : "0",
        background:BG,
        border:`1px solid ${BORDER}`,
        display:"grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gridTemplateRows: isMobile ? "48vw 1fr" : "auto",
        overflow:"hidden", position:"relative",
        borderRadius: isMobile ? "0" : "0",
        boxShadow:"0 32px 80px rgba(26,23,20,0.2)",
      }} onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} style={{
          position:"absolute", top:"0.75rem", right:"0.75rem", zIndex:10,
          background:"rgba(250,248,244,0.95)", border:"none", cursor:"pointer",
          color:TEXT, fontSize:"1rem", lineHeight:1,
          width:"2.2rem", height:"2.2rem", borderRadius:"50%",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 8px rgba(26,23,20,0.15)",
        }}>✕</button>

        {/* Imagen */}
        <div style={{ position:"relative", overflow:"hidden", height:"100%" }}>
          {imgs[imgIdx] && (
            <img src={imgs[imgIdx]} alt={title}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          )}
          {imgs.length > 1 && (
            <div style={{ position:"absolute", bottom:"1rem", left:0, right:0, display:"flex", justifyContent:"center", gap:"0.4rem" }}>
              {imgs.map((_,i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{
                  width: i===imgIdx ? "1.5rem" : "0.4rem",
                  height:"0.4rem", borderRadius:"2px",
                  background: i===imgIdx ? ACCENT : "rgba(250,248,244,0.5)",
                  border:"none", cursor:"pointer", transition:"all 0.3s",
                }}/>
              ))}
            </div>
          )}
          {/* Nav arrows */}
          {imgs.length > 1 && (<>
            <button onClick={()=>setImgIdx(i=>Math.max(0,i-1))} style={{ position:"absolute",left:"0.75rem",top:"50%",transform:"translateY(-50%)",background:"rgba(250,248,244,0.9)",border:"none",width:"2rem",height:"2rem",borderRadius:"50%",cursor:"pointer",fontSize:"0.8rem",color:TEXT }}>←</button>
            <button onClick={()=>setImgIdx(i=>Math.min(imgs.length-1,i+1))} style={{ position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",background:"rgba(250,248,244,0.9)",border:"none",width:"2rem",height:"2rem",borderRadius:"50%",cursor:"pointer",fontSize:"0.8rem",color:TEXT }}>→</button>
          </>)}
        </div>

        {/* Info */}
        <div style={{
          padding:"clamp(1rem,3vw,2rem)",
          display:"flex", flexDirection:"column", gap:"0.8rem",
          overflowY:"auto", background:BG, flex:1, minHeight:0,
        }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.65rem", letterSpacing:"0.35em", textTransform:"uppercase", color:ACCENT, margin:0 }}>
            {p.ubicacion}
          </p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:TEXT, margin:0, lineHeight:1.1 }}>
            {title}
          </h2>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.05rem,1.5vw,1.25rem)", color:TEXT2, lineHeight:1.8, margin:0 }}>
            {desc}
          </p>
          <hr style={{ border:"none", borderTop:`1px solid ${BORDER}`, margin:"0.25rem 0" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
            {[
              { l:t.surface, v:`${p.m2_construidos} m²` },
              { l:t.bedrooms, v:p.habitaciones },
              { l:t.bathrooms, v:p.banos },
              { l:t.price, v:`€${p.precio?.toLocaleString()}` },
            ].map(s => (
              <div key={s.l}>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:MUTED, margin:"0 0 0.3rem" }}>{s.l}</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", color:TEXT, margin:0, fontWeight:500 }}>{s.v}</p>
              </div>
            ))}
          </div>
          <hr style={{ border:"none", borderTop:`1px solid ${BORDER}`, margin:"0.25rem 0" }}/>
          <NeonButton onClick={() => { window.location.href = `/${locale}/propiedades/${p.slug}`; }} variant="solid">
            {t.viewProperty} →
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

export default function MasonrySection({ locale = "es" }: { locale?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animatedPages = useRef<Set<number>>(new Set());
  const [carouselHeight, setCarouselHeight] = useState<number | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Record<string,string>>({});
  const [preview, setPreview] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const t = T[locale] || T.es;

  useEffect(() => {
    fetch("/api/properties")
      .then(r => r.json())
      .then(d => setProperties(d.properties || []))
      .catch(() => {});
  }, []);

  // Medir altura real disponible en px, evitando cadenas de % / flex indefinido en WebKit
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const header = el.querySelector("[data-masonry-header]") as HTMLElement | null;
      const footer = el.querySelector("[data-masonry-footer]") as HTMLElement | null;
      const total = el.getBoundingClientRect().height;
      const headerH = header?.getBoundingClientRect().height || 0;
      const footerH = footer?.getBoundingClientRect().height || 0;
      const computed = Math.max(0, total - headerH - footerH);
      setCarouselHeight(computed);

      // DEBUG TEMPORAL — datos en el titulo de la pestaña, inmune a CSS/overflow/zIndex
      if (typeof document !== "undefined") {
        document.title = `vh:${window.innerHeight} total:${Math.round(total)} hdr:${Math.round(headerH)} ftr:${Math.round(footerH)} carH:${Math.round(computed)}`;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const filtered = properties.filter(p => {
    if (filters.zona) {
      const zona = (p.zona || "").toLowerCase().trim();
      if (zona !== filters.zona.toLowerCase().trim()) return false;
    }
    if (filters.ubicacion) {
      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!normalize(p.ubicacion || "").includes(normalize(filters.ubicacion))) return false;
    }
    if (filters.tipo) {
      if ((p.tipo || "").toLowerCase().trim() !== filters.tipo.toLowerCase().trim()) return false;
    }
    if (filters.habitaciones) {
      const hab = Number(p.habitaciones) || 0;
      if (filters.habitaciones === "6+") { if (hab < 6) return false; }
      else { if (hab < parseInt(filters.habitaciones)) return false; }
    }
    if (filters.precio && !matchPrice(Number(p.precio), filters.precio)) return false;
    return true;
  });

  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const pageEl = entry.target as HTMLElement;
          const idx = Number(pageEl.dataset.pageIdx);
          if (animatedPages.current.has(idx)) return;
          animatedPages.current.add(idx);

          const cards = pageEl.querySelectorAll(".carousel-card");
          gsap.fromTo(
            cards,
            { opacity: 0, scale: 0.88, y: 40 },
            { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.18 }
          );
        });
      },
      { root, threshold: 0.5 }
    );

    const pages = root.querySelectorAll("[data-page-idx]");
    pages.forEach((p) => observer.observe(p));

    return () => observer.disconnect();
  }, [filtered.length]);

  const toggleFilter = (id: string, val: string) => {
    setFilters(prev => ({ ...prev, [id]: prev[id] === val ? "" : val }));
    setActiveFilter(null);
  };

  const getFilterLabel = (f: typeof FILTERS_DEF[0]) => {
    const v = filters[f.id];
    if (!v) return f.label;
    if (f.id === "precio") return PRICE_LABELS[v] || v;
    if (f.id === "habitaciones") return `${HAB_LABELS[v] || v} Hab`;
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  return (
    <div ref={rootRef} style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", overflow:"hidden", background:BG }}>
      {/* DEBUG TEMPORAL — quitar después */}
      <div style={{
        position:"absolute", top:0, left:0, zIndex:99999,
        background:"#00ff00", color:"#000", font:"13px monospace", fontWeight:700,
        padding:"10px 14px", pointerEvents:"none", whiteSpace:"pre",
        border:"3px solid red",
      }}>
        {`vh: ${typeof window!=="undefined"?window.innerHeight:0}\ncarouselHeight: ${carouselHeight ?? "null"}\nprops: ${properties.length} / filtered: ${filtered.length}`}
      </div>

      {/* Header + Filtros */}
      <div data-masonry-header style={{
        flexShrink:0,
        padding:"clamp(3.5rem,6vw,4.5rem) clamp(1.5rem,4vw,3rem) 0",
        borderBottom:`1px solid ${BORDER}`,
        background:BG,
      }}>
        {/* THE EDITS + Filtros */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", marginBottom:"0", paddingBottom:"0" }}>

          {/* Label centrado en móvil, izquierda en desktop */}
          <span style={{
            fontFamily:"'Montserrat',sans-serif",
            fontSize:"0.85rem",
            letterSpacing:"0.5em",
            textTransform:"uppercase",
            color:ACCENT,
            whiteSpace:"nowrap",
            flexShrink:0,
            textAlign:"center",
            display:"block",
            paddingTop:"clamp(0.8rem,2vw,1.2rem)",
            textShadow:`0 0 20px rgba(45,74,62,0.2)`,
          }}>
            THE EDITS · {filtered.length}
          </span>

          {/* Filtros en fila ordenada */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0", flexWrap:"wrap" }}>
          {FILTERS_DEF.map((f, idx) => {
            const active = !!filters[f.id];
            return (
              <div key={f.id} style={{ position:"relative" }}>
                <button
                  onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                  style={{
                    background:"none",
                    border:"none",
                    borderBottom: active
                      ? `1.5px solid ${ACCENT}`
                      : activeFilter === f.id
                      ? `0.5px solid ${TEXT2}`
                      : `0.5px solid transparent`,
                    padding:"0.6rem 1.2rem 0.5rem",
                    cursor:"pointer",
                    fontFamily:"'Montserrat',sans-serif",
                    fontSize:"0.55rem",
                    letterSpacing:"0.25em",
                    textTransform:"uppercase",
                    color: active ? ACCENT : activeFilter === f.id ? TEXT : TEXT2,
                    opacity: active || activeFilter === f.id ? 1 : 0.65,
                    transition:"all 0.2s ease",
                    marginBottom:"-1px",
                  }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.opacity="1"; (e.currentTarget as HTMLElement).style.color=ACCENT;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.opacity=active||activeFilter===f.id?"1":"0.65"; (e.currentTarget as HTMLElement).style.color=active?ACCENT:activeFilter===f.id?TEXT:TEXT2;}}
                >
                  {getFilterLabel(f)} {active ? "×" : "∨"}
                </button>

                {/* Dropdown */}
                {activeFilter === f.id && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 1px)", left:0, zIndex:50,
                    background:BG,
                    border:`1px solid ${BORDER}`,
                    minWidth:"160px",
                    boxShadow:"0 8px 24px rgba(26,23,20,0.08)",
                  }}>
                    {f.options.map((opt, i) => (
                      <button key={opt} onClick={() => toggleFilter(f.id, opt)} style={{
                        display:"block", width:"100%", textAlign:"left",
                        background: filters[f.id] === opt ? BG_SOFT : "none",
                        border:"none",
                        borderBottom: i < f.options.length-1 ? `1px solid ${BORDER}` : "none",
                        padding:"0.7rem 1.2rem",
                        cursor:"pointer",
                        fontFamily:"'Montserrat',sans-serif",
                        fontSize:"0.55rem",
                        letterSpacing:"0.2em",
                        textTransform:"uppercase",
                        color: filters[f.id] === opt ? ACCENT : TEXT2,
                        transition:"all 0.15s",
                      }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=BG_SOFT; (e.currentTarget as HTMLElement).style.color=ACCENT;}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=filters[f.id]===opt?BG_SOFT:"none"; (e.currentTarget as HTMLElement).style.color=filters[f.id]===opt?ACCENT:TEXT2;}}
                      >
                        {f.id === "precio" ? PRICE_LABELS[opt] : f.id === "habitaciones" ? `${opt} hab.` : opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({})} style={{
              background:"none", border:"none", cursor:"pointer",
              fontFamily:"'Montserrat',sans-serif", fontSize:"0.5rem",
              letterSpacing:"0.25em", textTransform:"uppercase",
              color:MUTED, padding:"0.6rem 1rem",
              opacity:0.7, transition:"opacity 0.2s",
            }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="1")}
            onMouseLeave={e=>(e.currentTarget.style.opacity="0.7")}
            >
              Limpiar ×
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Carrusel horizontal — páginas de 2 propiedades, snap nativo */}
      <div ref={carouselRef} data-masonry-scroll style={{
        flex: carouselHeight === null ? 1 : "0 0 auto",
        height: carouselHeight === null ? undefined : `${carouselHeight}px`,
        overflowX:"auto", overflowY:"auto",
        WebkitOverflowScrolling:"touch",
        scrollSnapType:"x mandatory",
        display:"flex",
        padding:"0.5rem 0.5rem 1rem",
        position:"relative",
      }}>
        {Array.from({ length: Math.ceil(filtered.length / 2) }).map((_, pageIdx) => {
          const pair = filtered.slice(pageIdx * 2, pageIdx * 2 + 2);
          return (
            <div key={pageIdx} data-page-idx={pageIdx} style={{
              flex:"0 0 100%",
              minHeight: carouselHeight === null ? "100%" : `${carouselHeight - 16}px`,
              scrollSnapAlign:"start",
              scrollSnapStop:"always",
              display:"flex",
              flexDirection:"column",
              gap:"clamp(0.3rem,0.8vw,0.6rem)",
              paddingRight:"0.5rem",
              boxSizing:"border-box",
            }}>
              {pair.map((p) => {
                const img = p.galeria_urls?.[0] ? convertGDriveUrl(p.galeria_urls[0]) : "";
                const title = getTitle(p, locale);

                return (
                  <div
                    key={p.slug}
                    className="carousel-card"
                    onClick={() => setPreview(p)}
                    style={{
                      cursor:"pointer",
                      background:BG,
                      border:`1px solid ${BORDER}`,
                      boxShadow:`0 1px 4px rgba(26,23,20,0.06)`,
                      display:"flex",
                      flex:"1 1 auto",
                      minHeight:"180px",
                      opacity:0,
                    }}
                  >
                    {/* Imagen */}
                    <div style={{ position:"relative", overflow:"hidden", width:"45%", flexShrink:0 }}>
                      {img ? (
                        <img src={img} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                      ) : (
                        <div style={{ width:"100%", height:"100%", background:BG_SOFT }}/>
                      )}
                      {p.tipo && (
                        <div style={{
                          position:"absolute", top:"0.6rem", left:"0.6rem",
                          background:ACCENT,
                          padding:"0.25rem 0.6rem",
                          fontFamily:"'Montserrat',sans-serif",
                          fontSize:"0.35rem", letterSpacing:"0.2em",
                          textTransform:"uppercase", color:"#FAF8F4",
                          fontWeight:500,
                        }}>
                          {p.tipo}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{
                      padding:"0.7rem 0.9rem", background:BG,
                      display:"flex", flexDirection:"column", flex:1, minWidth:0,
                    }}>
                      <div style={{ flex:"1 1 auto", minHeight:0, overflow:"hidden" }}>
                        <h3 style={{
                          fontFamily:"'Cormorant Garamond',serif",
                          fontSize:"clamp(1rem,2.5vw,1.4rem)", fontWeight:600,
                          letterSpacing:"0.02em",
                          color:TEXT, margin:"0 0 0.2rem", lineHeight:1.2,
                          display:"-webkit-box",
                          WebkitLineClamp:2,
                          WebkitBoxOrient:"vertical" as any,
                          overflow:"hidden",
                        }}>
                          {title}
                        </h3>
                        <p style={{
                          fontFamily:"'Montserrat',sans-serif",
                          fontSize:"0.42rem", letterSpacing:"0.12em",
                          color:MUTED, margin:0, fontWeight:300,
                          textTransform:"uppercase",
                        }}>
                          {p.ubicacion}
                        </p>
                      </div>
                      <div style={{ marginTop:"0.5rem", flexShrink:0 }}>
                        <p style={{
                          fontFamily:"'Cormorant Garamond',serif",
                          fontSize:"clamp(1rem,2.8vw,1.3rem)", fontWeight:500,
                          color:ACCENT, margin:"0 0 0.35rem", lineHeight:1,
                        }}>
                          €{p.precio?.toLocaleString()}
                        </p>
                        {(p.m2_construidos > 0 || p.habitaciones > 0) && (
                          <div style={{ display:"flex", gap:"0.8rem", borderTop:`1px solid ${BORDER}`, paddingTop:"0.4rem", flexWrap:"wrap" }}>
                            {p.m2_construidos > 0 && <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.42rem", letterSpacing:"0.1em", color:MUTED }}>{p.m2_construidos} m²</span>}
                            {p.habitaciones > 0 && <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.42rem", letterSpacing:"0.1em", color:MUTED }}>{p.habitaciones} {t.bedrooms}</span>}
                            {p.banos > 0 && <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.42rem", letterSpacing:"0.1em", color:MUTED }}>{p.banos} {t.bathrooms}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ flex:"0 0 100%", textAlign:"center", padding:"4rem", color:MUTED, fontFamily:"'Montserrat',sans-serif", fontSize:"0.6rem", letterSpacing:"0.3em", textTransform:"uppercase" }}>
            Sin propiedades con estos filtros
          </div>
        )}
      </div>

      {/* Indicador de páginas */}
      <div data-masonry-footer style={{ display:"flex", justifyContent:"center", gap:"0.4rem", padding:"0 0 1.2rem" }}>
        {Array.from({ length: Math.ceil(filtered.length / 2) }).map((_, i) => (
          <span key={i} style={{ width:"0.4rem", height:"0.4rem", borderRadius:"50%", background:BORDER }}/>
        ))}
      </div>
      
            {preview && typeof document !== "undefined" && createPortal(
        <PropertyPreview property={preview} locale={locale} onClose={() => setPreview(null)} />,
        document.body
      )}
    </div>
  );
}
