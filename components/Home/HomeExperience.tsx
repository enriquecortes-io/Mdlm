"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useHomeScroll } from "./useHomeScroll";
import SkyHeader from "./SkyHeader";

const MasonrySection   = dynamic(() => import("./MasonrySection"),   { ssr: false });
const Manifesto        = dynamic(() => import("./Manifesto"),        { ssr: false });
const Captacion        = dynamic(() => import("./Captacion"),        { ssr: false }) as any;

interface Props { locale: string; }
const TOTAL_PANELS = 3;

export default function HomeExperience({ locale }: Props) {
  const headerRef    = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const masonryRef   = useRef<HTMLDivElement>(null);
  const captacionRef = useRef<HTMLDivElement>(null);
  const panelRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useHomeScroll({ headerRef, manifestoRef, filtersRef: masonryRef, carouselRef: masonryRef, captacionRef, panelRefs, totalPanels: TOTAL_PANELS });

  return (
    <div style={{position:"fixed",inset:0,width:"100%",height:"100dvh",minHeight:"100vh",overflow:"hidden",background:"#FAFAF7"}}>

      {/* Header */}
      <div ref={headerRef} style={{
        position:"absolute", inset:0, zIndex:20,
        willChange:"opacity,transform",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <SkyHeader locale={locale} />
      </div>

      {/* Manifesto */}
      <Manifesto ref={manifestoRef} locale={locale} />

      {/* Masonry */}
      <div id="masonry-section" ref={masonryRef} style={{
        position:"absolute", inset:0, zIndex:25,
        opacity:0, pointerEvents:"none",
      }}>
        <MasonrySection locale={locale} />
      </div>

      {/* Captación */}
      <Captacion ref={captacionRef} locale={locale} />

    </div>
  );
}
