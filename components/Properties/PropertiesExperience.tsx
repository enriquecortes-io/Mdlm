"use client";
import { getT } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Property } from "@/types/property";
import Navbar from "@/components/Experience/Navbar";
import MobileCarousel from "./MobileCarousel";

interface Props {
  properties: Property[];
  locale: string;
  filters: { zona?: string; tipo?: string; precio?: string };
  isMobile?: boolean;
}

export default function PropertiesExperience({ properties, locale, filters, isMobile = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const urlLocale = pathname.split("/")[1] || locale;
  const lang = urlLocale as "es" | "en" | "fr" | "ru";
  const tp = getT(urlLocale).properties;
  const rotationRef = useRef(0);       // grados actuales suavizados
  const targetRotRef = useRef(0);      // grados objetivo (múltiplos de step)
  const currentIdxRef = useRef(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const rafRef = useRef<number>(0);

  // Click normal de ratón
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playClick = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const len = ctx.sampleRate * 0.008;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/len, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3, now);
      noise.connect(g);
      g.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.008);
    } catch(e) {}
  };
  const scrollAccum = useRef(0);
  const SCROLL_THRESHOLD = 180;
  const n = properties.length;
  const STEP = 360 / n;               // grados entre paneles
  const RADIUS = 600;
  const PERSPECTIVE = 800;
  // isMobile viene del servidor via user-agent

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Suavizado con lerp — efecto de inercia tipo trinquete
      rotationRef.current = lerp(rotationRef.current, targetRotRef.current, 0.04);

      // Actualizar cada panel
      for (let i = 0; i < n; i++) {
        const el = document.getElementById(`prop-card-${i}`);
        if (!el) continue;

        // Ángulo de este panel en la rueda
        const angle = (i * STEP + rotationRef.current) % 360;
        const rad = (angle * Math.PI) / 180;

        // Posición en el círculo — eje Y (tiovivo)
        const x = Math.sin(rad) * RADIUS;
        const z = Math.cos(rad) * RADIUS - RADIUS; // restar RADIUS para que el frente quede en z=0

        // Opacidad y escala según la profundidad z
        const normalized = (z + RADIUS) / (RADIUS * 2); // 0=atrás, 1=frente
        const scale = 0.85 + normalized * 0.15;
        const opacity = normalized < 0.05 ? 0 : Math.min(1, (normalized - 0.05) / 0.25);
        const blur = 0;

        // Inclinacion leve proporcional a posicion en la rueda — 0.25 del angulo
        // Tilt proporcional al seno del angulo — max ~8deg en laterales, 0 al frente
        const tilt = -Math.sin(rad) * 10;
        el.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${tilt}deg)`;
        el.style.opacity = String(Math.min(1, opacity));
        el.style.scale = String(scale);
        el.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
        el.style.zIndex = String(Math.round(normalized * 100));
        el.style.pointerEvents = normalized > 0.9 ? "auto" : "none";
      }

      // Detectar panel activo
      const rawIdx = Math.round(-targetRotRef.current / STEP);
      const idx = ((rawIdx % n) + n) % n;
      if (idx !== currentIdxRef.current) {
        currentIdxRef.current = idx;
        setDisplayIdx(idx);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const advance = (dir: 1 | -1) => {
      targetRotRef.current -= dir * STEP;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollAccum.current += e.deltaY;
      if (Math.abs(scrollAccum.current) >= SCROLL_THRESHOLD) {
        const dir = scrollAccum.current > 0 ? 1 : -1;
        scrollAccum.current = 0;
        advance(dir);
      }
    };

    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) advance(dx > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [n, STEP]);

  if (properties.length === 0) {
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(4,3,2,0.7)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <Navbar locale={locale} />
        <div style={{ textAlign:"center", padding:"2rem" }}>
          <p style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.5rem", letterSpacing:"0.5em", color:"rgba(201,169,110,0.7)", textTransform:"uppercase", marginBottom:"2rem" }}>
            No properties found
          </p>
          <h2 style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:100, textTransform:"uppercase", color:"white", letterSpacing:"-0.02em", marginBottom:"3rem" }}>
            Refine your search
          </h2>
          <button
            onClick={() => router.push(`/${locale}`)}
            style={{ background:"none", border:"1px solid rgba(201,169,110,0.4)", color:"#c9a96e", fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.45rem", letterSpacing:"0.5em", textTransform:"uppercase", padding:"1.2rem 3rem", cursor:"pointer" }}
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) return (
    <>
      <Navbar locale={urlLocale} />
      <MobileCarousel properties={properties} locale={urlLocale} tp={tp} />
      <button
        onClick={() => router.push(`/${locale}`)}
        style={{
          position:"fixed", bottom:"1.5rem", left:"50%", transform:"translateX(-50%)",
          zIndex:500, background:"rgba(4,3,2,0.7)",
          border:"1px solid rgba(201,169,110,0.35)",
          color:"rgba(201,169,110,0.8)",
          fontFamily:"'Montserrat',sans-serif",
          fontSize:"0.5rem", letterSpacing:"0.4em", textTransform:"uppercase",
          padding:"0.7rem 2rem", cursor:"pointer",
        }}
      >{tp.search}</button>
    </>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(4,3,2,0.7)", overflow:"hidden" }}>
      <Navbar locale={locale} />

      {/* Filtros activos — barra editorial superior */}
      <div style={{
        position:"absolute", top:0, left:0, right:0,
        minHeight:"4.5rem",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexWrap:"wrap",
        gap:"0", zIndex:100,
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(8,6,4,0.7)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
      }}>


        {/* Filtros seleccionados */}
        {Object.entries(filters).filter(([,v])=>v).map(([k,v], fi) => (
          <div key={k} style={{
            display:"flex", alignItems:"center",
            height:"100%",
            padding:"0 1rem",
            borderRight:"1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{
              fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
              fontSize:"clamp(0.35rem,1.5vw,0.45rem)", fontWeight:200,
              color:"rgba(201,169,110,0.5)",
              letterSpacing:"0.3em", textTransform:"uppercase",
              marginRight:"0.5rem",
            }}>{k}</span>
            <span style={{
              fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
              fontSize:"clamp(0.4rem,1.8vw,0.6rem)", fontWeight:300,
              color:"rgba(201,169,110,0.9)",
              letterSpacing:"0.15em", textTransform:"uppercase",
            }}>{v}</span>
          </div>
        ))}

        {/* Contador derecha */}
        <div style={{
          marginLeft:"auto",
          padding:"0 2rem",
          fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          fontSize:"0.5rem", fontWeight:200,
          color:"rgba(255,255,255,0.2)",
          letterSpacing:"0.3em",
        }}>
          {String(displayIdx+1).padStart(2,"0")} / {String(n).padStart(2,"0")}
        </div>
      </div>

      {/* RUEDA — escena 3D */}
      <div style={{
        position:"absolute", inset:0,
        perspective:`${PERSPECTIVE}px`,
        perspectiveOrigin:"50% 50%",
      }}>
        <div style={{
          position:"absolute",
          top:"50%", left:"50%",
          transform:"translate(-50%, -50%)",
          transformStyle:"preserve-3d",
          width:0, height:0,
        }}>
          {properties.map((property, i) => (
            <div
              key={property.id}
              id={`prop-card-${i}`}
              style={{
                position:"absolute",
                width:"clamp(220px,72vw,900px)", height:"clamp(400px,75vh,900px)",
                marginLeft:"calc(clamp(220px,72vw,900px) / -2)", marginTop:"calc(clamp(400px,75vh,900px) / -2)",
                willChange:"transform, opacity, filter",
                cursor:"pointer",
                transformStyle:"preserve-3d",
              }}
              onClick={() => {
                const activeIdx = currentIdxRef.current;
                if (activeIdx === i) {
                  playClick();
                  router.push(`/${locale}/propiedades/${property.slug}`);
                }
              }}
              onMouseEnter={e => {
                if (currentIdxRef.current === i) {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 60px rgba(201,169,110,0.3), inset 0 0 40px rgba(201,169,110,0.05)`;
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <video
                src={property.video_url} muted playsInline autoPlay loop
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
              />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.95) 100%)", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", inset:0, border:"1px solid rgba(201,169,110,0.15)", pointerEvents:"none" }}/>

              {/* Info */}
              <div style={{ position:"absolute", bottom:"3rem", left:"3rem", right:"3rem" }}>
                <p style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.5rem", fontWeight:300, letterSpacing:"0.45em", color:"#c9a96e", textTransform:"uppercase", margin:"0 0 1rem" }}>
                  {property.ubicacion}
                </p>
                <h2 style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"clamp(1.8rem,3.5vw,3rem)", fontWeight:100, textTransform:"uppercase", color:"#fff", letterSpacing:"0.02em", lineHeight:1.1, margin:"0 0 1.5rem" }}>
                  {property.titulo[lang]}
                </h2>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"1.5rem" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:"0.4rem" }}>
                    <span style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"1rem", fontWeight:200, color:"#c9a96e" }}>€</span>
                    <span style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"clamp(1.4rem,2.5vw,2rem)", fontWeight:100, color:"white", letterSpacing:"0.05em" }}>
                      {(property.precio/1000000 % 1 === 0 ? (property.precio/1000000).toFixed(0) : property.precio >= 100000 ? (property.precio/1000000).toFixed(3).replace(/\.?0+$/, '') : (property.precio/1000000).toFixed(1))}<span style={{color:"#c9a96e",fontSize:"0.7em"}}>M</span>
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:"2rem" }}>
                    <span style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.75rem", color:"rgba(255,255,255,0.55)", letterSpacing:"0.25em" }}>
                      {property.habitaciones} {tp.bed}
                    </span>
                    <span style={{ fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.75rem", color:"rgba(255,255,255,0.55)", letterSpacing:"0.25em" }}>
                      {property.m2_construidos} M²
                    </span>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay de click — siempre encima, no afectado por RAF */}
      <div
        style={{
          position:"absolute",
          top:"50%", left:"50%",
          width:"clamp(220px,72vw,900px)", height:"clamp(400px,75vh,900px)",
          marginLeft:"calc(clamp(220px,72vw,900px) / -2)", marginTop:"calc(clamp(400px,75vh,900px) / -2)",
          zIndex:200,
          cursor:"pointer",
        }}
        onClick={() => {
          playClick();
          const slug = properties[currentIdxRef.current]?.slug;
          if (slug) router.push(`/${locale}/propiedades/${slug}`);
        }}

      />

      {/* SEARCH — botón gemelo abajo izquierda */}
      <button
        onClick={() => router.push(`/${locale}`)}
        onMouseEnter={e => {
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.9)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(201,169,110,0.5), 0 0 60px rgba(201,169,110,0.2)";
          e.currentTarget.style.background = "rgba(201,169,110,0.12)";
          e.currentTarget.style.letterSpacing = "0.5em";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "rgba(201,169,110,0.8)";
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.letterSpacing = "0.4em";
        }}
        style={{
          position:"fixed",
          bottom:"2rem",
          left:"3rem",
          zIndex:500,
          background:"rgba(4,3,2,0.7)",
          border:"1px solid rgba(201,169,110,0.35)",
          color:"rgba(201,169,110,0.8)",
          fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          fontSize:"clamp(0.5rem,2vw,0.75rem)",
          letterSpacing:"clamp(0.2em,1vw,0.4em)",
          textTransform:"uppercase",
          padding:"clamp(0.6rem,2vw,1rem) clamp(1rem,3vw,2.5rem)",
          cursor:"pointer",
          transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {tp.search}
      </button>

      {/* DISCOVER — botón fijo independiente del RAF */}
      <button
        id="discover-btn"
        onClick={() => {
          playClick();
          const slug = properties[currentIdxRef.current]?.slug;
          if (slug) router.push(`/${locale}/propiedades/${slug}`);
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.9)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(201,169,110,0.5), 0 0 60px rgba(201,169,110,0.2)";
          e.currentTarget.style.background = "rgba(201,169,110,0.12)";
          e.currentTarget.style.letterSpacing = "0.5em";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "rgba(201,169,110,0.8)";
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.letterSpacing = "0.4em";
        }}
        style={{
          position:"fixed",
          bottom:"2rem",
          right:"3rem",
          left:"auto",
          zIndex:500,
          background:"rgba(4,3,2,0.7)",
          border:"1px solid rgba(201,169,110,0.35)",
          color:"rgba(201,169,110,0.8)",
          fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          fontSize:"clamp(0.5rem,2vw,0.75rem)",
          letterSpacing:"clamp(0.2em,1vw,0.4em)",
          textTransform:"uppercase",
          padding:"clamp(0.6rem,2vw,1rem) clamp(1rem,3vw,2.5rem)",
          cursor:"pointer",
          transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {tp.discover}
      </button>

      {/* Scroll indicator — solo desktop */}
      <style>{`
        @keyframes neonBreathProp {
          0%,100% { height:1.5rem; opacity:0.3; box-shadow:0 0 4px 1px rgba(201,169,110,0.4); }
          50%     { height:3.5rem; opacity:1;   box-shadow:0 0 12px 3px rgba(201,169,110,0.9); }
        }
        @keyframes fadeScroll { 0%,100%{opacity:0.3;} 50%{opacity:0.8;} }
        .neon-prop { animation: neonBreathProp 2.4s ease-in-out infinite; }
        .scroll-prop { animation: fadeScroll 2.4s ease-in-out infinite; }
        @media (max-width: 768px) { .scroll-indicator-prop { display: none !important; } }
      `}</style>
      <div className="scroll-indicator-prop" style={{
        position:"fixed", bottom:"1rem", left:"50%", transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"0.6rem",
        zIndex:500,
      }}>
        <span className="scroll-prop" style={{
          color:"rgba(201,169,110,0.5)", fontSize:"0.4rem",
          letterSpacing:"0.5em", fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          textTransform:"uppercase",
        }}>
          {String(displayIdx+1).padStart(2,"0")} / {String(n).padStart(2,"0")}
        </span>
        <div className="neon-prop" style={{
          width:"1px",
          background:"rgba(201,169,110,0.8)",
        }}/>
      </div>



    </div>
  );
}
