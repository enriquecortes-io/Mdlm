"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export type Phase = "video" | "transition" | "description" | "gallery";

interface ScrollEngineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  galleryTrackRef: React.RefObject<HTMLDivElement | null>;
  infographic1Ref: React.RefObject<HTMLDivElement | null>;
  infographic2Ref: React.RefObject<HTMLDivElement | null>;
  descRef?: React.RefObject<HTMLDivElement | null>;
}

export function useScrollEngine({
  videoRef,
  stageRef,
  galleryTrackRef,
  infographic1Ref,
  infographic2Ref,
  descRef,
}: ScrollEngineProps) {
  const phaseRef = useRef<Phase>("video");
  const videoProgressRef = useRef(0);
  const transitionProgressRef = useRef(0);
  const galleryProgressRef = useRef(0);
  const inf1LockedRef = useRef(false);
  const inf2LockedRef = useRef(false);
  const descProgressRef = useRef(0);

  // Arrancar video en primer touch/scroll — necesario para iOS Safari
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const start = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = true;
      v.play().catch(() => {});
    };
    window.addEventListener("touchstart", start, { passive: true, once: true });
    window.addEventListener("wheel", start, { passive: true, once: true });
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("wheel", start);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current; // puede ser null si estamos en modo imagen (sin video_url)
    const stage = stageRef.current;
    const galleryTrack = galleryTrackRef.current;
    if (!stage || !galleryTrack) return;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    gsap.set(stage, { height: "100vh" });

    // Video en autoplay loop — sin scrubbing (solo si existe video real)
    if (video) { video.muted = true; video.play().catch(()=>{}); }

    let smoothTransition = 0;
    let smoothGallery = 0;
    let targetTransition = 0;
    let targetGallery = 0;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      smoothTransition = lerp(smoothTransition, targetTransition, 0.08);
      smoothGallery = lerp(smoothGallery, targetGallery, 0.08);

      if (smoothTransition > 0.001) {
        const vh = window.innerHeight;
        const descH = descRef?.current?.offsetHeight || vh;
        const galleryEl = document.querySelector(".gallery-section") as HTMLElement;
        const galleryH = galleryEl?.offsetHeight || vh * 0.5;
        
        // Total scroll = video(vh) + desc(descH) + gallery(galleryH)
        const totalScroll = descH + galleryH;
        const scrollY = smoothTransition * totalScroll;
        const newHeight = vh + totalScroll;
        
        gsap.set(stage, { y: -scrollY + "px", height: newHeight + "px" });
        
        // Posicionar galería justo después de la descripción
        if (galleryEl) {
          galleryEl.style.top = (vh + descH) + "px";
        }
        
        // Descripción visible desde el inicio de la transición
        if (descRef?.current) {
          const descOpacity = Math.max(0, Math.min(1, smoothTransition / 0.15));
          descRef.current.style.opacity = String(descOpacity);
          descRef.current.style.pointerEvents = descOpacity > 0.05 ? "auto" : "none";
        }
      }


      if (smoothGallery > 0.001) {
        const maxX = galleryTrack.scrollWidth - window.innerWidth;
        gsap.set(galleryTrack, { x: -smoothGallery * maxX });
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;

      // ── FASE 1: VIDEO ────────────────────────────────────────────────────
      if (phaseRef.current === "video") {
        videoProgressRef.current = Math.max(0, Math.min(1,
          videoProgressRef.current + delta * 0.0006
        ));
        // Sin scrubbing — video en autoplay

        const p = videoProgressRef.current;

        // Infografico 1 — entra 10-25%, sale 75-90%
        if (infographic1Ref.current) {
          if (p < 0.10) {
            infographic1Ref.current.style.opacity = "0";
            infographic1Ref.current.style.transform = "translate3d(0px, 120px, 0)";
            inf1LockedRef.current = false;
          } else if (p < 0.25) {
            const t = (p - 0.10) / 0.15;
            infographic1Ref.current.style.opacity = String(t);
            infographic1Ref.current.style.transform = `translate3d(0px, ${120 - t * 120}px, 0)`;
            inf1LockedRef.current = false;
          } else if (p < 0.75) {
            infographic1Ref.current.style.opacity = "1";
            infographic1Ref.current.style.transform = "translate3d(0px, 0px, 0)";
            inf1LockedRef.current = true;
          } else if (p < 0.90) {
            const t = (p - 0.75) / 0.15;
            infographic1Ref.current.style.opacity = String(1 - t);
            infographic1Ref.current.style.transform = `translate3d(0px, ${-t * 120}px, 0)`;
            inf1LockedRef.current = false;
          } else {
            infographic1Ref.current.style.opacity = "0";
            infographic1Ref.current.style.transform = "translate3d(0px, -120px, 0)";
            inf1LockedRef.current = false;
          }
        }

        // Infografico 2 — entra 50-65%, sale 85-99%
        if (infographic2Ref.current) {
          if (p < 0.50) {
            infographic2Ref.current.style.opacity = "0";
            infographic2Ref.current.style.transform = "translate3d(0px, 120px, 0)";
            inf2LockedRef.current = false;
          } else if (p < 0.65) {
            const t = (p - 0.50) / 0.15;
            infographic2Ref.current.style.opacity = String(t);
            infographic2Ref.current.style.transform = `translate3d(0px, ${120 - t * 120}px, 0)`;
            inf2LockedRef.current = false;
          } else if (p < 0.85) {
            infographic2Ref.current.style.opacity = "1";
            infographic2Ref.current.style.transform = "translate3d(0px, 0px, 0)";
            inf2LockedRef.current = true;
          } else if (p < 0.99) {
            const t = (p - 0.85) / 0.14;
            infographic2Ref.current.style.opacity = String(1 - t);
            infographic2Ref.current.style.transform = `translate3d(0px, ${-t * 120}px, 0)`;
            inf2LockedRef.current = false;
          } else {
            infographic2Ref.current.style.opacity = "0";
            infographic2Ref.current.style.transform = "translate3d(0px, -120px, 0)";
            inf2LockedRef.current = false;
          }
        }

        if (videoProgressRef.current >= 0.999 && delta > 0) {
          phaseRef.current = "transition";
          transitionProgressRef.current = 0;
          targetTransition = 0;
        }
      }

      // ── FASE 2: TRANSICION ───────────────────────────────────────────────
      else if (phaseRef.current === "transition") {
        const isMobile = window.innerWidth < 768;
        const sensitivity = isMobile ? 0.0005 : 0.0015;
        transitionProgressRef.current = Math.max(0, Math.min(1,
          transitionProgressRef.current + delta * sensitivity
        ));
        targetTransition = transitionProgressRef.current;

        if (transitionProgressRef.current >= 0.999 && delta > 0) {
          phaseRef.current = "description";
          descProgressRef.current = 0;
          if (descRef?.current) {
            descRef.current.style.opacity = "1";
            descRef.current.style.pointerEvents = "auto";
            descRef.current.scrollTop = 0;
          }
        }
        if (transitionProgressRef.current <= 0.001 && delta < 0) {
          phaseRef.current = "video";
          videoProgressRef.current = 1;
          if (descRef?.current) { descRef.current.style.opacity = "0"; descRef.current.style.pointerEvents = "none"; }
        }
      }

      // ── FASE 3: DESCRIPTION ─────────────────────────────────────────────
      else if (phaseRef.current === "description") {
        // Acumular progreso con scroll — más lento en mobile
        const isMobileDesc = window.innerWidth < 768;
        const descSensitivity = isMobileDesc ? 0.0012 : 0.004;
        descProgressRef.current = Math.max(0, Math.min(1,
          descProgressRef.current + delta * descSensitivity
        ));

        // Mostrar enmarcado
        if (descRef?.current) {
          descRef.current.style.opacity = "1";
          descRef.current.style.pointerEvents = "auto";
        }

        if (descProgressRef.current >= 0.999 && delta > 0) {
          phaseRef.current = "gallery";
          galleryProgressRef.current = 0;
          targetGallery = 0;
          if (descRef?.current) {
            descRef.current.style.opacity = "0";
            descRef.current.style.pointerEvents = "none";
          }
        }
        if (delta < 0 && descProgressRef.current <= 0.001) {
          phaseRef.current = "transition";
          transitionProgressRef.current = 1;
          targetTransition = 1;
          if (descRef?.current) {
            descRef.current.style.opacity = "0";
            descRef.current.style.pointerEvents = "none";
          }
        }
      }

      // ── FASE 4: GALERIA ──────────────────────────────────────────────────
      else if (phaseRef.current === "gallery") {
        galleryProgressRef.current = Math.max(0, Math.min(1,
          galleryProgressRef.current + delta * 0.0006
        ));
        targetGallery = galleryProgressRef.current;

        if (galleryProgressRef.current <= 0.001 && delta < 0) {
          phaseRef.current = "description";
          descProgressRef.current = 0.99;
          if (descRef?.current) {
            descRef.current.style.opacity = "1";
            descRef.current.style.pointerEvents = "auto";
          }
        }
      }
    };

    // Touch mobile — mismo comportamiento que wheel
    let touchStartY = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const delta = (lastTouchY - currentY) * 2.5; // sensibilidad similar a wheel
      lastTouchY = currentY;
      handleWheel({ deltaY: delta, preventDefault: () => {} } as WheelEvent);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
}
