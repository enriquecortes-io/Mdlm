"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Property } from "@/types/property";
import { convertGDriveUrl } from "@/lib/gdrive";
import { useScrollEngine } from "./useScrollEngine";
import Navbar from "./Navbar";
import ScrollIndicator from "./ScrollIndicator";
import VideoSection from "./VideoSection";
import GallerySection from "./GallerySection";
import PrivateAccessForm from "./PrivateAccessForm";
import { createPortal } from "react-dom";

interface Props {
  property: Property;
  locale: string;
}

const descStyles = ".desc-columns{columns:2;column-gap:clamp(1.5rem,3vw,3rem);column-rule:1px solid rgba(26,23,20,0.1)} .desc-columns p::first-letter{font-family:Cormorant Garamond,serif;font-size:3.5rem;font-weight:700;color:#c9a96e;float:left;line-height:0.75;margin-right:0.08em;margin-top:0.05em} @media(max-width:768px){.desc-columns{columns:1}}";


export default function PropertyExperience({ property, locale }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const images = property.galeria_urls || [];
  const firstImageUrl = images[0] ? convertGDriveUrl(images[0]) : undefined;
  const ref = property.referencia || "";
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Posicionar galería dinámicamente según alto real de descripción
  useEffect(() => {
    const updateGalleryPos = () => {
      const desc = descRef.current;
      const gallery = document.querySelector(".gallery-section") as HTMLElement;
      if (!desc || !gallery) return;
      const descHeight = desc.offsetHeight;
      const descTop = window.innerHeight; // 100vh
      gallery.style.top = `${descTop + descHeight}px`;
    };
    updateGalleryPos();
    window.addEventListener("resize", updateGalleryPos);
    return () => window.removeEventListener("resize", updateGalleryPos);
  }, []);
  const infographic1Ref = useRef<HTMLDivElement>(null);
  const infographic2Ref = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const urlLocale = pathname.split("/")[1] || locale;
  const lang = urlLocale as "es" | "en" | "fr" | "ru";
  const inf1 = property.infografias?.[0] || null;

  // Extraer primera frase de la descripción traducida
  const getFirstSentence = (text: string) => {
    const match = text?.match(/^[^.!?\n]+[.!?]?/);
    return match ? match[0].trim() : text;
  };

  const desc = property.descripcion;
  const descText = desc && typeof desc === "object"
    ? (desc as any)[lang] || (desc as any)["es"] || (desc as any)["en"] || ""
    : desc || "";

  const inf2 = {
    label: { es:"Perspectiva", en:"Perspective", fr:"Perspective", ru:"Перспектива" },
    titulo: {
      es: getFirstSentence(typeof desc === "object" ? (desc as any)["es"] || "" : descText),
      en: getFirstSentence(typeof desc === "object" ? (desc as any)["en"] || "" : descText),
      fr: getFirstSentence(typeof desc === "object" ? (desc as any)["fr"] || "" : descText),
      ru: getFirstSentence(typeof desc === "object" ? (desc as any)["ru"] || "" : descText),
    },
    subtitulo: { es:"", en:"", fr:"", ru:"" },
    texto: { es:"", en:"", fr:"", ru:"" },
  };

  useScrollEngine({
    videoRef,
    stageRef,
    galleryTrackRef,
    infographic1Ref,
    infographic2Ref,
    descRef,
  });

  return (
    <div style={{ position: "fixed", inset: 0, width: "100%", height: "100vh", overflow: "hidden", background: "#FAF8F4" }}>
      <Navbar locale={locale} onPrivateAccess={() => setShowForm(true)} />
      <ScrollIndicator />
      <div ref={stageRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", willChange: "height, transform" }}>
        <VideoSection
          videoRef={videoRef}
          infographic1Ref={infographic1Ref}
          infographic2Ref={infographic2Ref}
          videoUrl={property.video_url}
          imageUrl={firstImageUrl}
          m2Construidos={property.m2_construidos}
          m2Parcela={property.m2_parcela}
          habitaciones={property.habitaciones}
          banos={property.banos}
          precio={property.precio}
          inf2={inf2}
          locale={urlLocale}
        />
        {/* Descripción enmarcada — revista de lujo */}
        <div ref={descRef} style={{
          position:"absolute", top:"100vh", left:0, right:0,
          minHeight:"100vh", display:"flex", alignItems:"flex-start", paddingTop:"1rem", paddingBottom:"1rem",
          justifyContent:"center", padding:"clamp(1rem,3vw,3rem)",
          opacity:0, pointerEvents:"none", transition:"opacity 0.5s ease",
          boxSizing:"border-box",
        }}>
          <div style={{
            maxWidth:"1100px", width:"100%",
            border:"1px solid rgba(201,169,110,0.3)",
            background:"rgba(250,248,244,0.97)",
            backdropFilter:"blur(24px)",
            boxShadow:"0 0 100px rgba(0,0,0,0.8)",
            display:"flex", flexDirection:"column",
          }}>

            {/* Header — ubicación + título */}
            <div style={{
              padding:"clamp(1.5rem,3vw,3rem) clamp(1.5rem,4vw,4rem)",
              borderBottom:"1px solid rgba(201,169,110,0.2)",
              display:"flex", flexDirection:"column", gap:"0.8rem",
            }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.45rem", fontWeight:500, color:"#c9a96e", letterSpacing:"0.5em", textTransform:"uppercase", margin:0 }}>
                {property.ubicacion}
              </p>
              <div style={{ width:"2rem", height:"1px", background:"rgba(201,169,110,0.5)" }}/>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,3rem)", fontWeight:600, color:"#1A1714", lineHeight:1.1, margin:0, letterSpacing:"-0.01em" }}>
                {typeof property.titulo === "object" ? (property.titulo as any)[lang] || (property.titulo as any)["en"] || "" : property.titulo}
              </h2>
            </div>

            {/* Body — datos + texto */}
            <div style={{ display:"flex", flexDirection:"column" }}>

              {/* Datos en fila horizontal */}
              <div style={{
                display:"flex", flexWrap:"wrap",
                borderBottom:"1px solid rgba(255,255,255,0.06)",
                padding:"clamp(1rem,2vw,1.5rem) clamp(1.5rem,4vw,4rem)",
                gap:"0",
              }}>
                {[
                  { label:"Construido", value: property.m2_construidos ? `${property.m2_construidos} m²` : null },
                  { label:"Parcela", value: property.m2_parcela ? `${property.m2_parcela} m²` : null },
                  { label:"Hab.", value: property.habitaciones || null },
                  { label:"Baños", value: property.banos || null },
                  { label:"Precio", value: property.precio ? `€${property.precio/1000000 % 1 === 0 ? (property.precio/1000000).toFixed(0) : (property.precio/1000000).toFixed(3).replace(/\.?0+$/, "")}M` : null, gold:true },
                  { label:"Ref.", value: ref || null, mono:true },
                ].filter(d => d.value).map((d,i,arr) => (
                  <div key={d.label} style={{ flex:"1 1 80px", padding:"0.5rem 1rem 0.5rem 0", borderRight: i < arr.length-1 ? "1px solid rgba(255,255,255,0.07)" : "none", marginRight: i < arr.length-1 ? "1rem" : "0" }}>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.62rem", fontWeight:600, color:"#8a7550", letterSpacing:"0.25em", textTransform:"uppercase", margin:"0 0 0.35rem" }}>{d.label}</p>
                    <p style={{ fontFamily:(d as any).mono ? "'Courier New',monospace" : "'Cormorant Garamond',serif", fontSize:(d as any).mono ? "clamp(0.85rem,1.4vw,1.05rem)" : "clamp(1.3rem,2.4vw,1.9rem)", color:(d as any).gold ? "#a8842f" : "#1A1714", fontWeight:(d as any).mono ? 500 : 500, margin:0, lineHeight:1.1, letterSpacing:(d as any).mono ? "0.1em" : "normal" }}>{String(d.value)}</p>
                  </div>
                ))}
              </div>

              {/* Texto revista — drop cap + 2 columnas */}
              <div style={{ padding:"clamp(1rem,2vw,2.5rem) clamp(1rem,3vw,3rem)" }}>
                {(() => {
                  const fullText = property.descripcion && typeof property.descripcion === "object"
                    ? (property.descripcion as any)[lang] || (property.descripcion as any)["en"] || ""
                    : property.descripcion || "";
                  const firstChar = fullText[0] || "";
                  const dotIndex = fullText.indexOf(".");
                  const firstSentence = dotIndex > 0 ? fullText.slice(1, dotIndex).trim() : fullText.slice(1, 120).trim();
                  const rest = dotIndex > 0 ? fullText.slice(dotIndex + 1).trim() : fullText.slice(120).trim();
                  return (
                    <div>
                      {/* Lead paragraph con drop cap */}
                      <p style={{
                        fontFamily:"'Cormorant Garamond',serif",
                        fontSize:"clamp(1.3rem,2vw,1.7rem)",
                        fontStyle:"italic",
                        fontWeight:600,
                        color:"#1A1714",
                        lineHeight:1.6,
                        margin:"0 0 1.5rem",
                        paddingBottom:"1.5rem",
                        borderBottom:"1px solid rgba(201,169,110,0.15)",
                      }}>
                        {firstChar}{firstSentence}
                      </p>

                      {/* Resto en 2 columnas */}
                      <style>{descStyles}</style>
                      <div className="desc-columns">
                        <p style={{
                          fontFamily:"'Montserrat',sans-serif",
                          fontSize:"clamp(0.85rem,1vw,0.95rem)",
                          fontWeight:300,
                          color:"rgba(26,23,20,0.9)",
                          lineHeight:2,
                          margin:0,
                          letterSpacing:"0.01em",
                          textAlign:"justify",
                        }}>{rest}</p>
                      </div>

                      {/* Firma */}
                      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginTop:"1.5rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ width:"1.5rem", height:"1px", background:"rgba(201,169,110,0.4)" }}/>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.38rem", color:"rgba(201,169,110,0.35)", letterSpacing:"0.4em", textTransform:"uppercase", margin:0 }}>The Edit · Marbella</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>

                <GallerySection
          galleryTrackRef={galleryTrackRef}
          images={images}
          onImageClick={setLightbox}
          titulo={property.titulo[lang]}
          ubicacion={property.ubicacion}
          locale={urlLocale}
        />
      </div>
      {/* LIGHTBOX — fuera del stageRef */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position:"fixed", inset:0, zIndex:1000,
            background:"rgba(250,248,244,0.97)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"zoom-out",
            backdropFilter:"blur(8px)",
            animation:"fadeInLB 0.3s ease both",
          }}
        >
          <style>{`
            @keyframes fadeInLB{0%{opacity:0;}100%{opacity:1;}}
            @keyframes scaleInLB{0%{opacity:0;transform:scale(0.92);}100%{opacity:1;transform:scale(1);}}
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:"80vw", height:"80vh",
              position:"relative",
              animation:"scaleInLB 0.35s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <img
              src={lightbox}
              alt=""
              style={{ width:"100%", height:"100%", objectFit:"contain" }}
            />
            <button
              onClick={() => setLightbox(null)}
              style={{
                position:"absolute", top:"-2.5rem", right:0,
                background:"none", border:"none",
                color:"rgba(26,23,20,0.5)",
                fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
                fontSize:"0.5rem", letterSpacing:"0.4em",
                textTransform:"uppercase", cursor:"pointer",
              }}
            >CLOSE ✕</button>
            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); const i = images.indexOf(lightbox); setLightbox(images[(i-1+images.length)%images.length]); }}
                  style={{ position:"absolute", left:"-3rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"1px solid rgba(26,23,20,0.2)", color:"rgba(26,23,20,0.5)", width:"2.2rem", height:"2.2rem", cursor:"pointer", fontSize:"0.9rem", display:"flex", alignItems:"center", justifyContent:"center" }}
                >←</button>
                <button
                  onClick={e => { e.stopPropagation(); const i = images.indexOf(lightbox); setLightbox(images[(i+1)%images.length]); }}
                  style={{ position:"absolute", right:"-3rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"1px solid rgba(26,23,20,0.2)", color:"rgba(26,23,20,0.5)", width:"2.2rem", height:"2.2rem", cursor:"pointer", fontSize:"0.9rem", display:"flex", alignItems:"center", justifyContent:"center" }}
                >→</button>
              </>
            )}
            <div style={{ position:"absolute", bottom:"-2rem", left:"50%", transform:"translateX(-50%)", fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.4rem", color:"rgba(26,23,20,0.3)", letterSpacing:"0.4em" }}>
              {String(images.indexOf(lightbox)+1).padStart(2,"0")} / {String(images.length).padStart(2,"0")}
            </div>
          </div>
        </div>
      )}

      {/* Modal formulario */}
      {showForm && typeof document !== "undefined" && createPortal(
        <div
          onClick={e => { if(e.target===e.currentTarget) setShowForm(false); }}
          onWheel={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
          style={{
            position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:9999,
            background:"#FAF8F4",
            overflowY:"auto",
            overflowX:"hidden",
            WebkitOverflowScrolling:"touch",
          } as React.CSSProperties}
        >
          <div style={{
            width:"100%", maxWidth:"680px",
            margin:"0 auto",
            background:"rgba(250,248,244,0.97)",
            border:"1px solid rgba(201,169,110,0.2)",
            padding:"clamp(2rem,5vw,4rem)",
            position:"relative",
            minHeight:"100%",
            boxSizing:"border-box",
          }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                position:"absolute", top:"1.5rem", right:"1.5rem",
                background:"none", border:"none",
                color:"rgba(26,23,20,0.3)",
                fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
                fontSize:"0.45rem", letterSpacing:"0.4em",
                cursor:"pointer", textTransform:"uppercase",
              }}
            >CLOSE ✕</button>
            <PrivateAccessForm
              locale={urlLocale}
              propertyTitle={property.titulo[lang]}
              propertySlug={property.slug}
            />
          </div>
        </div>
      , document.body)}
    </div>
  );
}
