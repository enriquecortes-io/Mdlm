"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { getT } from "@/lib/i18n";

interface Props { locale: string; }

const SCENE_CONFIG = [
 { start:0,  end:5,  align:"left",   pos:"65% top" },
 { start:5,  end:10, align:"right",  pos:"center top" },
 { start:10, end:15, align:"center", pos:"center top" },
 { start:15, end:20, align:"left",   pos:"center top" },
 { start:20, end:25, align:"right",  pos:"center top" },
 { start:25, end:30, align:"center", pos:"center center" },
];

export default function SkyHeader({ locale }: Props) {
 const pathname = usePathname();
 const urlLocale = pathname.split("/")[1] || locale;
 const t = getT(urlLocale);
 const scenes = (t.header as any).scenes as Array<{word:string;phrase:string}> || [];
 const SCENES = SCENE_CONFIG.map((s,i) => ({...s, word:scenes[i]?.word||"", phrase:scenes[i]?.phrase||""}));

 const videoRef  = useRef<HTMLVideoElement>(null);
 const wordRef   = useRef<HTMLDivElement>(null);
 const phraseRef = useRef<HTMLDivElement>(null);

 const [sceneIdx,   setSceneIdx]   = useState(0);
 const [animKey,    setAnimKey]    = useState(0);
 const [videoReady, setVideoReady] = useState(false);

 // Sync escenas con el video
 useEffect(() => {
   const video = videoRef.current;
   if (!video) return;
   video.muted = true;
   video.play().catch(() => {});
   video.addEventListener("canplay", () => setVideoReady(true));

   const handleTime = () => {
     const ct = video.currentTime;
     const idx = SCENES.findIndex(s => ct >= s.start && ct < s.end);
     if (idx !== -1 && idx !== sceneIdx) {
       setSceneIdx(idx);
       setAnimKey(p => p + 1);
     }
   };

   video.addEventListener("timeupdate", handleTime);
   return () => video.removeEventListener("timeupdate", handleTime);
 }, [sceneIdx]);

 // GSAP entrada inicial
 useEffect(() => {
   const ctx = gsap.context(() => {
     const tl = gsap.timeline();
     if (wordRef.current)
       tl.fromTo(wordRef.current,
         { autoAlpha:0, y:80, scaleY:2.5, scaleX:0.8, transformOrigin:"bottom center" },
         { autoAlpha:1, y:0,  scaleY:1,   scaleX:1,   duration:1.1, ease:"expo.out" },
         0.1
       );
     if (phraseRef.current)
       tl.fromTo(phraseRef.current,
         { autoAlpha:0, x:-40 },
         { autoAlpha:1, x:0, duration:0.9, ease:"power4.out" },
         0.8
       );
   });
   return () => ctx.revert();
 }, []);

 // GSAP transición entre escenas
 useEffect(() => {
   const raf = requestAnimationFrame(() => {
     if (!wordRef.current || !phraseRef.current) return;
     gsap.fromTo(wordRef.current,
       { autoAlpha:0, y:80, scaleY:2.5, scaleX:0.8, transformOrigin:"bottom center" },
       { autoAlpha:1, y:0,  scaleY:1,   scaleX:1,   duration:0.9, ease:"expo.out" }
     );
     gsap.fromTo(phraseRef.current,
       { autoAlpha:0, x:-30 },
       { autoAlpha:1, x:0, duration:0.7, ease:"power4.out", delay:0.5 }
     );
   });
   return () => cancelAnimationFrame(raf);
 }, [animKey]);

 const scene = SCENES[sceneIdx];
 const alignMap = { left:"flex-start", right:"flex-end", center:"center" };

 return (
   <>
     <style>{`
       @keyframes progressBar {
         0%   { width:0%; }
         100% { width:100%; }
       }
       .progress-bar { animation: progressBar 5s linear both; }
     `}</style>

     {/* Fondo fallback */}
     <div style={{
       position:"absolute", inset:0, zIndex:0,
       background:"linear-gradient(135deg, #0a0a0f 0%, #0f0a08 50%, #080a0f 100%)",
       opacity: videoReady ? 0 : 1,
       transition:"opacity 0.4s ease",
       pointerEvents:"none",
     }}/>

     {/* Video */}
     <video
       ref={videoRef}
       src="/videos/HeroHeader.webm"
       poster="/videos/hero-poster.jpg"
       muted playsInline loop autoPlay preload="metadata"
       onCanPlay={() => setVideoReady(true)}
       style={{
         position:"absolute", inset:0,
         width:"100%", height:"100%",
         objectFit:"cover",
         objectPosition: scene?.pos || "center top",
         zIndex:0,
       }}
     />

     {/* Overlay */}
     <div style={{
       position:"absolute", inset:0, zIndex:1,
       background:"linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.88) 100%)",
     }}/>

     {/* Tipografía */}
     <div style={{
       position:"relative", zIndex:10,
       width:"100%", height:"100%",
       display:"flex", flexDirection:"column",
       justifyContent:"center",
       paddingLeft:  scene?.word?.length > 7 ? "5vw" : scene?.align === "left" ? "clamp(1.5rem,8vw,12vw)" : scene?.align === "center" ? "clamp(1.5rem,8vw,12vw)" : "0",
       paddingRight: scene?.word?.length > 7 ? "5vw" : scene?.align === "right" ? "clamp(1.5rem,8vw,12vw)" : scene?.align === "center" ? "clamp(1.5rem,8vw,12vw)" : "0",
       alignItems: alignMap[(scene?.align || "left") as keyof typeof alignMap] as any,
     }}>
       <div style={{
         display:"flex", flexDirection:"column",
         alignItems: scene?.word?.length > 7 ? "center" : scene?.align === "right" ? "flex-end" : scene?.align === "center" ? "center" : "flex-start",
         maxWidth:"90vw",
       }}>
         <div key={`word-${animKey}`} ref={wordRef} style={{ willChange:"transform,opacity", opacity:0 }}>
           <h1 style={{
             fontFamily:"'Cormorant Garamond','Cormorant',serif",
             fontSize:"clamp(6rem,16vw,16rem)",
             fontWeight:900, color:"#ffffff",
             letterSpacing:"-0.02em", lineHeight:0.75,
             userSelect:"none", margin:0,
             textShadow:"0 4px 60px rgba(0,0,0,0.7)",
             textAlign: scene?.align === "center" ? "center" : scene?.align === "right" ? "right" : "left",
           }}>
             {(()=>{
               const breaks: Record<string,string[]> = {
                 "CONDUCE":  ["CON","DUCE"],
                 "MARBELLA": ["MAR","BELLA"],
                 "CONDUIRE": ["CON","DUIRE"],
               };
               const parts = breaks[scene?.word || ""];
               if (parts) return <>{parts.map((p,i)=>(
                 <span key={i} style={{display:"block"}}>
                   {p}
                   {scene?.word === "MARBELLA" && i === parts.length - 1 && (
                     <span style={{ marginLeft:"0.15em", fontSize:"0.75em", verticalAlign:"middle", display:"inline-block" }}>♥</span>
                   )}
                 </span>
               ))}</>;
               return <>{scene?.word}</>;
             })()}
           </h1>
         </div>

         <div key={`phrase-${animKey}`} ref={phraseRef} style={{ marginTop:"3.5rem", willChange:"transform,opacity", opacity:0 }}>
           <p style={{
             fontFamily:"'Montserrat',sans-serif",
             fontSize:"clamp(0.65rem,1.8vw,2rem)",
             fontWeight:200, color:"rgba(255,255,255,0.75)",
             letterSpacing:"0.25em", lineHeight:1.2,
             textTransform:"uppercase", userSelect:"none", margin:0,
             textShadow:"0 2px 20px rgba(0,0,0,0.6)",
             textAlign: scene?.align === "center" ? "center" : scene?.align === "right" ? "right" : "left",
           }}>
             {scene?.phrase}
           </p>
         </div>

       </div>
     </div>

     {/* CTA fijo abajo centro */}
     <div style={{
       position:"absolute", bottom:"48px", left:0, right:0,
       zIndex:20, display:"flex", justifyContent:"center",
     }}>
       <button
         onClick={() => {
           window.dispatchEvent(new CustomEvent("scrollphase", { detail: "masonry" }));
         }}
         style={{
           fontFamily:"'Montserrat',sans-serif",
           fontSize:"clamp(0.6rem,1.2vw,0.85rem)",
           fontWeight:500,
           letterSpacing:"0.2em",
           textTransform:"uppercase",
           color:"white",
           background:"transparent",
           border:"1px solid rgba(255,255,255,0.6)",
           padding:"14px 36px",
           cursor:"pointer",
           transition:"all 0.3s ease",
         }}
         onMouseEnter={e => {
           (e.currentTarget as HTMLButtonElement).style.background = "white";
           (e.currentTarget as HTMLButtonElement).style.color = "#0a0a0f";
         }}
         onMouseLeave={e => {
           (e.currentTarget as HTMLButtonElement).style.background = "transparent";
           (e.currentTarget as HTMLButtonElement).style.color = "white";
         }}
       >
         Ver propiedades
       </button>
     </div>

     {/* Barras de progreso */}
     <div style={{
       position:"absolute", bottom:0, left:0, right:0,
       zIndex:20, display:"flex", gap:"2px", height:"2px",
     }}>
       {SCENES.map((_, i) => (
         <div key={i} style={{
           flex:1, background:"rgba(255,255,255,0.1)",
           position:"relative", overflow:"hidden",
         }}>
           {i === sceneIdx && (
             <div key={animKey} className="progress-bar" style={{
               position:"absolute", top:0, left:0, height:"100%",
               background:"rgba(201,169,110,0.8)",
             }}/>
           )}
           {i < sceneIdx && (
             <div style={{ position:"absolute", inset:0, background:"rgba(201,169,110,0.5)" }}/>
           )}
         </div>
       ))}
     </div>
   </>
 );
}
