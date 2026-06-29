"use client";

const isDriveUrl = (url: string) => url?.includes("drive.google.com");
const getDrivePreviewUrl = (url: string) => {
  const match = url?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url?.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url;
};


type InfText = string | { es: string; en: string; fr: string; ru: string };

function getText(val: InfText | undefined, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return (val as any)[lang] || val.es || "";
}

interface VideoSectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  infographic1Ref: React.RefObject<HTMLDivElement | null>;
  infographic2Ref: React.RefObject<HTMLDivElement | null>;
  videoUrl?: string;
  imageUrl?: string;
  locale?: string;
  m2Construidos?: number;
  m2Parcela?: number;
  habitaciones?: number;
  banos?: number;
  precio?: number;
  inf2?: { label: InfText; titulo: InfText; subtitulo: InfText; texto: InfText } | null;
}

export default function VideoSection({
  videoRef, infographic1Ref, infographic2Ref,
  videoUrl, imageUrl, locale = "es",
  m2Construidos, m2Parcela, habitaciones, banos, precio, inf2,
}: VideoSectionProps) {
  const hasVideo = !!videoUrl;
  const fallbackVideo = "/videos/hero.mp4";
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          /* Dividimos la pantalla en dos mitades verticales sin solape posible,
             en vez de esquinar con padding (que se cruzaba si el contenido era alto). */
          .inf-wrapper-1 {
            top: 0 !important; bottom: 50% !important; left: 0 !important; right: 0 !important; inset: auto !important;
            justify-content: flex-start !important; align-items: flex-end !important;
            padding: 0 0 1rem 1.5rem !important;
          }
          .inf-wrapper-2 {
            top: 50% !important; bottom: 0 !important; left: 0 !important; right: 0 !important; inset: auto !important;
            justify-content: flex-end !important; align-items: flex-start !important;
            padding: 1rem 1.5rem 0 0 !important;
          }
          /* Quitamos overflow:hidden aqui — combinado con backdrop-filter + transform 3D
             en el mismo elemento provoca un bug de WebKit que hace desaparecer
             el elemento entero en vez de solo recortarlo. */
          .inf-box { max-width: 70vw !important; }
          .inf-wrapper-1 { border: 4px solid red !important; }
          .inf-wrapper-2 { border: 4px solid blue !important; }
        }
      `}</style>
      <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"100vh", overflow:"hidden" }}>
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted playsInline autoPlay loop
            style={{ width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none", display:"block" }}
          />
        ) : (
          <video
            ref={videoRef}
            src={fallbackVideo}
            muted playsInline autoPlay loop
            style={{ width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }}
          />
        )}

        {/* INFOGRAFICO 1 — izquierda */}
        <div className="inf-wrapper-1" style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"flex-start", padding:"0 clamp(1.5rem,8vw,8vw)", pointerEvents:"none" }}>
          <div
            ref={infographic1Ref}
            className="inf-box"
            style={{
              opacity:0,
              transform:"translate3d(0px, 120px, 0)",
              transition:"none",
              background:"rgba(250,248,244,0.10)",
              backdropFilter:"blur(12px)",
              WebkitBackdropFilter:"blur(12px)",
              border:"1px solid rgba(250,248,244,0.15)",
              borderRadius:"4px",
              padding:"clamp(1rem,2vw,2rem) clamp(1rem,2vw,2rem)",
              maxWidth:"clamp(180px,32vw,32rem)",
            }}
          >
            {/* Titulo ficha */}
            <span style={{ color:"white", textTransform:"uppercase", letterSpacing:"0.35em", fontSize:"clamp(0.5rem,1vw,0.65rem)", display:"block", marginBottom:"1.5rem", fontStyle:"italic", fontWeight:700 }}>
              {({"es":"Ficha Técnica","en":"Specifications","fr":"Caractéristiques","ru":"Характеристики"} as Record<string,string>)[locale] || "Specifications"}
            </span>

            {/* Filas */}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
              {m2Construidos && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", borderBottom:"1px solid rgba(255,255,255,0.1)", paddingBottom:"0.6rem" }}>
                  <span style={{ color:"rgba(255,255,255,0.9)", fontSize:"clamp(0.5rem,1vw,0.65rem)", letterSpacing:"0.25em", textTransform:"uppercase", fontWeight:600 }}>
                    {({"es":"Construido","en":"Built","fr":"Construit","ru":"Построено"} as Record<string,string>)[locale] || "Built"}
                  </span>
                  <span style={{ color:"#1A1714", fontSize:"clamp(1.1rem,2.2vw,1.7rem)", fontWeight:400, fontFamily:"'Montserrat','Helvetica Neue',sans-serif" }}>
                    {m2Construidos.toLocaleString()} m²
                  </span>
                </div>
              )}
              {m2Parcela && m2Parcela > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", borderBottom:"1px solid rgba(255,255,255,0.1)", paddingBottom:"0.6rem" }}>
                  <span style={{ color:"rgba(255,255,255,0.9)", fontSize:"clamp(0.5rem,1vw,0.65rem)", letterSpacing:"0.25em", textTransform:"uppercase", fontWeight:600 }}>
                    {({"es":"Parcela","en":"Plot","fr":"Terrain","ru":"Участок"} as Record<string,string>)[locale] || "Plot"}
                  </span>
                  <span style={{ color:"#1A1714", fontSize:"clamp(1.1rem,2.2vw,1.7rem)", fontWeight:400, fontFamily:"'Montserrat','Helvetica Neue',sans-serif" }}>
                    {m2Parcela.toLocaleString()} m²
                  </span>
                </div>
              )}
              {habitaciones && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", borderBottom:"1px solid rgba(255,255,255,0.1)", paddingBottom:"0.6rem" }}>
                  <span style={{ color:"rgba(255,255,255,0.9)", fontSize:"clamp(0.5rem,1vw,0.65rem)", letterSpacing:"0.25em", textTransform:"uppercase", fontWeight:600 }}>
                    {({"es":"Dorm / Baños","en":"Bed / Bath","fr":"Ch / SDB","ru":"Сп / Ван"} as Record<string,string>)[locale] || "Bed / Bath"}
                  </span>
                  <span style={{ color:"#1A1714", fontSize:"clamp(1.1rem,2.2vw,1.7rem)", fontWeight:400, fontFamily:"'Montserrat','Helvetica Neue',sans-serif" }}>
                    {habitaciones} / {banos}
                  </span>
                </div>
              )}
              {precio && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <span style={{ color:"rgba(255,255,255,0.9)", fontSize:"clamp(0.5rem,1vw,0.65rem)", letterSpacing:"0.25em", textTransform:"uppercase", fontWeight:600 }}>
                    {({"es":"Precio","en":"Price","fr":"Prix","ru":"Цена"} as Record<string,string>)[locale] || "Price"}
                  </span>
                  <span style={{ color:"#c9a96e", fontSize:"clamp(1rem,2.2vw,1.6rem)", fontWeight:200, fontFamily:"'Montserrat','Helvetica Neue',sans-serif" }}>
                    €{precio/1000000 % 1 === 0 ? (precio/1000000).toFixed(0) : (precio/1000000).toFixed(3).replace(/\.?0+$/, "")}M
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INFOGRAFICO 2 — derecha */}
        <div className="inf-wrapper-2" style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"flex-end", padding:"0 clamp(1.5rem,8vw,8vw)", pointerEvents:"none" }}>
          <div
            ref={infographic2Ref}
            className="inf-box"
            style={{
              opacity:0,
              transform:"translate3d(0px, 120px, 0)",
              transition:"none",
              background:"rgba(250,248,244,0.10)",
              backdropFilter:"blur(12px)",
              WebkitBackdropFilter:"blur(12px)",
              border:"1px solid rgba(250,248,244,0.15)",
              borderRadius:"4px",
              padding:"clamp(1rem,2vw,2rem) clamp(1rem,2vw,2rem)",
              maxWidth:"clamp(180px,32vw,32rem)",
              textAlign:"right",
            }}
          >
            <span style={{ color:"rgba(255,255,255,0.9)", textTransform:"uppercase", letterSpacing:"0.45em", fontSize:"clamp(0.4rem,1vw,0.55rem)", display:"block", marginBottom:"1rem", fontStyle:"italic" }}>
              {getText(inf2?.label, locale)}
            </span>
            <h2 style={{ fontFamily:"Georgia,serif", color:"#1A1714", fontSize:"clamp(1.6rem,3.5vw,4rem)", fontWeight:300, lineHeight:1.15, margin:"0 0 0.8rem" }}>
              {getText(inf2?.titulo, locale)}<br />
              <span style={{ color:"rgba(255,255,255,0.9)", fontSize:"0.75em", fontFamily:"sans-serif", fontWeight:100 }}>
                {getText(inf2?.subtitulo, locale)}
              </span>
            </h2>
            <div style={{ width:"2.5rem", height:"1px", background:"rgba(26,23,20,0.4)", marginBottom:"0.8rem", marginLeft:"auto" }}/>
            <p style={{ color:"rgba(26,23,20,0.85)", textTransform:"uppercase", letterSpacing:"0.15em", fontSize:"clamp(0.4rem,0.9vw,0.6rem)", lineHeight:1.9, margin:0 }}>
              {getText(inf2?.texto, locale)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
