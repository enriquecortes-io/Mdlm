"use client";
import { useEffect, useRef } from "react";

type Phase = "header" | "manifesto1" | "manifesto2" | "manifesto3" | "masonry" | "captacion";

interface Props {
  headerRef: React.RefObject<HTMLDivElement | null>;
  manifestoRef: React.RefObject<HTMLDivElement | null>;
  filtersRef: React.RefObject<HTMLDivElement | null>;
  carouselRef?: React.RefObject<HTMLDivElement | null>;
  captacionRef?: React.RefObject<HTMLDivElement | null>;
  panelRefs: React.RefObject<(HTMLDivElement | null)[]>;
  totalPanels: number;
}

export function useHomeScroll({ headerRef, manifestoRef, filtersRef, carouselRef, captacionRef, panelRefs, totalPanels }: Props) {
  const phaseRef = useRef<Phase>("header");
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    let rafId: number;
    let smoothHeader = 0;
    let targetHeader = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let lastPhaseChange = 0;
    const PHASE_COOLDOWN = 900;

    const emitPhase = (phase: Phase) => {
      window.dispatchEvent(new CustomEvent("scrollphase", { detail: phase }));
    };

    const setPhase = (next: Phase) => {
      if (phaseRef.current !== next) {
        phaseRef.current = next;
        emitPhase(next);
      }
    };

    const lerpOpacity = (el: HTMLDivElement | null, target: number) => {
      if (!el) return;
      const cur = parseFloat(el.style.opacity || "0");
      const next = lerp(cur, target, 0.08);
      el.style.opacity = String(next);
      el.style.pointerEvents = next > 0.3 ? "auto" : "none";
    };

    const prepareElements = () => {
      [headerRef.current, manifestoRef.current, carouselRef?.current, filtersRef.current].forEach(el => {
        if (el) el.style.willChange = "opacity, transform";
      });
    };
    prepareElements();

    const tick = () => {
      smoothHeader = lerp(smoothHeader, targetHeader, 0.055);
      const phase = phaseRef.current;
      const isManifesto = phase === "manifesto1" || phase === "manifesto2" || phase === "manifesto3";

      if (headerRef.current) {
        headerRef.current.style.opacity = String(1 - smoothHeader);
        headerRef.current.style.transform = `translate3d(0,${-smoothHeader * 80}px,0) scale(${1 - smoothHeader * 0.03})`;
        headerRef.current.style.pointerEvents = smoothHeader > 0.85 ? "none" : "auto";
      }

      lerpOpacity(manifestoRef.current, isManifesto ? 1 : 0);
      if (isManifesto) {
        window.dispatchEvent(new CustomEvent("manifestophase", { detail: phase }));
      }

      lerpOpacity(carouselRef?.current ?? null, phase === "masonry" ? 1 : 0);
      lerpOpacity(captacionRef?.current ?? null, phase === "captacion" ? 1 : 0);

      progressRef.current = lerp(progressRef.current, targetProgressRef.current, 0.07);
      for (let i = 0; i < totalPanels; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;
        const diff = i - progressRef.current;
        let opacity = 0, scale = 1, zPos = 0, blur = 0;
        if (diff > 1 || diff < -1.5) {
          opacity = 0; scale = 0.3; zPos = diff > 0 ? 450 : -450; blur = 30;
        } else if (diff > 0 && diff <= 1) {
          const t = diff;
          opacity = Math.max(0, 1 - t * 0.7);
          scale = 1 + t * 1.5; zPos = t * 450; blur = t * 20;
        } else if (diff >= -0.3 && diff <= 0.05) {
          opacity = 1; scale = 1; zPos = 0; blur = 0;
        } else {
          const t = Math.abs(diff);
          opacity = Math.max(0, 1 - t * 1.5);
          scale = Math.max(0.4, 1 - t * 0.5);
          zPos = -t * 350; blur = t * 12;
        }
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(0,0,${zPos}px) scale(${scale})`;
        el.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
        el.style.pointerEvents = Math.abs(diff) < 0.4 ? "auto" : "none";
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    (window as any).__advancePanel = (next: number) => {
      targetProgressRef.current = Math.max(0, Math.min(totalPanels - 1, next));
    };

    const PHASE_ORDER: Phase[] = ["header", "manifesto1", "manifesto2", "manifesto3", "masonry", "captacion"];

    const goNext = () => {
      const idx = PHASE_ORDER.indexOf(phaseRef.current);
      const next = PHASE_ORDER[Math.min(PHASE_ORDER.length - 1, idx + 1)];
      
      if (next !== "header") targetHeader = 1;
      setPhase(next);
    };

    const goPrev = () => {
      const idx = PHASE_ORDER.indexOf(phaseRef.current);
      const next = PHASE_ORDER[Math.max(0, idx - 1)];
      if (next === "header") targetHeader = 0;
      setPhase(next);
    };

    let wheelAccum = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;
    const WHEEL_SNAP = 300;

    const handleWheel = (e: WheelEvent) => {
      // Si el wheel ocurre dentro del carrusel de Masonry, dejamos que su propio
      // listener (en MasonrySection.tsx) gestione el scroll horizontal (raton/trackpad)
      // sin interferencia de este handler global de cambio de fase.
      if (phaseRef.current === "masonry") {
        const target = e.target as HTMLElement;
        if (target?.closest?.("[data-masonry-scroll], .carousel-card")) return;
      }
      e.preventDefault();
      const now = Date.now();
      if (now - lastPhaseChange < PHASE_COOLDOWN) return;
      if (phaseRef.current === "header") {
        targetHeader = Math.max(0, Math.min(1, targetHeader + e.deltaY * 0.002));
        if (targetHeader >= 1) { targetHeader = 1; lastPhaseChange = now; setPhase("manifesto1"); }
        return;
      }
      if (phaseRef.current === "masonry" && e.deltaY < 0 && targetProgressRef.current > 0) return;
      wheelAccum += e.deltaY;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelAccum = 0; }, 300);
      if (Math.abs(wheelAccum) >= WHEEL_SNAP) {
        const dir = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0; lastPhaseChange = now;
        if (dir > 0) goNext(); else goPrev();
      }
    };

    let touchStartY = 0;
    let touchStartTime = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; touchStartTime = Date.now(); };
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastPhaseChange < PHASE_COOLDOWN) return;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const elapsed = now - touchStartTime;
      const velocity = Math.abs(deltaY) / elapsed;
      const isSwipeDown = deltaY > 60 || (deltaY > 30 && velocity > 0.3);
      const isSwipeUp   = deltaY < -60 || (deltaY < -30 && velocity > 0.3);
      if (!isSwipeDown && !isSwipeUp) return;

      // En fase masonry, si el carrusel aun tiene scroll vertical interno pendiente,
      // dejamos que ese scroll consuma el gesto en vez de saltar de seccion.
      if (phaseRef.current === "masonry" && carouselRef?.current) {
        // Cada "pagina" del carrusel horizontal tiene su propio scroll vertical
        // marcado con data-masonry-scroll. Buscamos la que esta realmente visible
        // (centrada en el viewport horizontal) para no mirar una pagina oculta.
        const pages = Array.from(carouselRef.current.querySelectorAll("[data-masonry-scroll]")) as HTMLElement[];
        let closest: HTMLElement | undefined;
        let minDist = Infinity;
        for (const p of pages) {
          const dist = Math.abs(p.getBoundingClientRect().left);
          if (dist < minDist) { minDist = dist; closest = p; }
        }
        if (closest) {
          const atTop = closest.scrollTop <= 2;
          const atBottom = closest.scrollTop + closest.clientHeight >= closest.scrollHeight - 2;
          if (isSwipeDown && !atBottom) return;
          if (isSwipeUp && !atTop) return;
        }
      }

      lastPhaseChange = now;
      if (isSwipeDown) goNext(); else goPrev();
    };
    const handleTouchMove = (e: TouchEvent) => { if (phaseRef.current !== "captacion" && phaseRef.current !== "masonry") e.preventDefault(); };

    let touchMovePassive = false;
    const registerListeners = (passive: boolean) => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchmove", handleTouchMove, { passive });
      touchMovePassive = passive;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    const handlePhaseChange = (e: Event) => {
      const phase = (e as CustomEvent).detail;
      if (phase === "captacion" || phase === "masonry") registerListeners(true);
      else if (touchMovePassive) registerListeners(false);
    };
    window.addEventListener("scrollphase", handlePhaseChange);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scrollphase", handlePhaseChange);
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [headerRef, manifestoRef, filtersRef, carouselRef, panelRefs, totalPanels]);
}
