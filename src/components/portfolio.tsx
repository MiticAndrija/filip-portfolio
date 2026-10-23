"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Grip, List, Move } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";
import { projects } from "@/lib/projects";
import { useMediaQuery, useReducedMotion } from "@/lib/motion";
import { TransitionLink, useTransitionNavigate } from "@/components/site-shell";
import type { DragState } from "./gallery-scene";
import { Footer } from "./footer";
import { useOpening } from "./opening";
import { usePageMotion } from "@/lib/page-motion";

const Scene = dynamic(() => import("./gallery-scene"), { ssr: false });
const filterOptions = ["All", "Events", "Film", "Identity", "Digital"] as const;
const filterLabels = { All: "Sve", Events: "Događaji", Film: "Film", Identity: "Identitet", Digital: "Digitalno" };

function ArtFallback({ mobile, active, onOpen }: { mobile: boolean; active: number; onOpen: (index: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const { canAnimate, onReady } = useOpening();
  const reduced = useReducedMotion();
  useEffect(() => { onReady(); }, [onReady]);
  useLayoutEffect(() => {
    if (!canAnimate || reduced) return;
    const context = gsap.context(() => {
      gsap.fromTo(".fallback-card", { y: 42, scale: .78, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .9, stagger: .035, ease: "power3.out" });
    }, root);
    return () => context.revert();
  }, [canAnimate, reduced]);
  return <div ref={root} className={`art-fallback ${mobile ? "art-fallback-mobile" : ""}`}>
    {projects.map((project,index) => <button key={project.slug} className={`fallback-card fallback-card-${index}`} hidden={mobile && index!==active} onClick={() => onOpen(index)} aria-label={`Prikaži ${project.title}`}><Image src={`/design/${project.slug}.png`} alt={`${project.title} — originalni plakat projekta`} width={800} height={1000} loading={index===active ? "eager" : "lazy"} /></button>)}
  </div>;
}

export function Portfolio() {
  const navigate = useTransitionNavigate();
  const mobile = useMediaQuery("(max-width: 700px)");
  const reduced = useReducedMotion();
  const { canAnimate, onReady } = useOpening();
  const [mode, setMode] = useState<"space" | "index">("space");
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("All");
  const drag = useRef<DragState>({ x: 0, y: 0, distance: 0, down: false });
  const start = useRef({ x: 0, y: 0, originalX: 0, originalY: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const main = useRef<HTMLElement>(null);
  const current = projects[hover ?? active];
  const contextLost = useCallback(() => setWebgl(false), []);
  usePageMotion(main);

  useEffect(() => {
    const reset = () => { setMode("space"); setActive(0); setHover(null); setFocus(null); setHighlighted(null); drag.current = { x: 0, y: 0, distance: 0, down: false }; window.scrollTo({ top: 0, behavior: "instant" }); };
    window.addEventListener("orbit:home",reset);
    return () => window.removeEventListener("orbit:home",reset);
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const available = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    if (!available) queueMicrotask(() => setWebgl(false));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  useLayoutEffect(() => {
    if (!canAnimate || reduced) return;
    const context = gsap.context(() => {
      if (mode === "space") {
        gsap.fromTo(".gallery-title .title-char", { yPercent: 115 }, { yPercent: 0, duration: 1.05, stagger: .028, ease: "power4.out", delay: .06 });
      } else {
        gsap.fromTo(".index-heading, .index-filters", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .06, ease: "power3.out" });
      }
    }, main);
    return () => context.revert();
  }, [canAnimate, reduced, mode]);

  useLayoutEffect(() => {
    if (!canAnimate || reduced || mode !== "index") return;
    const context = gsap.context(() => {
      gsap.fromTo(".index-row", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .65, stagger: .045, ease: "power3.out" });
    }, main);
    return () => context.revert();
  }, [canAnimate, reduced, mode, filter]);

  const step = (direction: number) => { const next = (active + direction + projects.length) % projects.length; setActive(next); setHighlighted(next); setHover(null); };
  const open = useCallback((index: number) => {
    if (focus !== null || drag.current.distance > 8) return;
    setActive(index); setFocus(index); setHover(null);
    timer.current = setTimeout(() => navigate(`/work/${projects[index].slug}/`), reduced ? 0 : 360);
  }, [focus, navigate, reduced]);
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button,a") || focus !== null) return;
    drag.current.down = true; drag.current.distance = 0;
    start.current = { x: event.clientX, y: event.clientY, originalX: drag.current.x, originalY: drag.current.y };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    drag.current.distance = Math.hypot(dx,dy);
    drag.current.x = start.current.originalX + dx;
    drag.current.y = start.current.originalY + dy;
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    if (mobile && Math.abs(event.clientX - start.current.x) > 45) step(event.clientX < start.current.x ? 1 : -1);
    drag.current.down = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const openFallback = useCallback((index: number) => { drag.current.distance = 0; open(index); }, [open]);
  const fallback = useMemo(() => <ArtFallback mobile={mobile} active={active} onOpen={openFallback} />, [mobile, active, openFallback]);

  return <main id="main" ref={main} aria-busy={!canAnimate} className={`portfolio ${mode === "index" ? "portfolio-index" : ""}`}>
    <div className="work-topline page-reveal"><span className="eyebrow">IZABRANI RADOVI / 2025—2026</span></div>
    <div className="view-switch page-reveal" role="group" aria-label="Prikaz radova"><button aria-label="Prostorna galerija" aria-pressed={mode==="space"} onClick={() => setMode("space")}><Grip size={14} /> Prostor</button><button aria-label="Lista projekata" aria-pressed={mode==="index"} onClick={() => setMode("index")}><List size={14} /> Lista</button></div>

    {mode==="space" ? <>
      <div className="gallery-title" aria-hidden="true"><div className="name-first">{[..."FILIP"].map((letter,index)=><span className="title-clip" key={index}><span className="title-char">{letter}</span></span>)}</div><div className="name-last">{[..."RADOJKOVIĆ"].map((letter,index)=><span className="title-clip" key={index}><span className="title-char">{letter}</span></span>)}</div></div>
      <h1 className="sr-only">Filip Radojković — Kreativna produkcija / Društvene mreže / Događaji</h1>
      <div className="gallery-scene" aria-label="Interaktivna galerija radova. Prevuci za pregled ili koristi kontrole za projekte ispod." onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerLeave={() => { drag.current.down = false; }} onPointerCancel={(event) => { drag.current.down = false; if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
        {webgl ? <Scene active={active} focus={focus} highlighted={highlighted} canAnimate={canAnimate} mobile={mobile} reduced={reduced} drag={drag} onHover={setHover} onOpen={open} onReady={onReady} fallback={fallback} onContextLost={contextLost} /> : fallback}
      </div>
      <div className="gallery-bottom page-reveal">
        <div className="explore-hint"><Move size={18} strokeWidth={1.25} /><span className="eyebrow">{mobile ? "PREVUCI ZA PREGLED" : "POVUCI ZA PREGLED"}<small>KLIKNI ZA DETALJE</small></span></div>
        <div className="selected-project" aria-live="polite"><span className="project-counter">{String((hover??active)+1).padStart(2,"0")}<span>/08</span></span><button className="selected-title" onClick={() => { drag.current.distance = 0; open(hover??active); }} aria-label={`Otvori ${current.title}`}><span>{current.title}<ArrowUpRight size={16} /></span><small>{current.category}</small></button><div className="project-arrows"><button onClick={() => step(-1)} aria-label="Prethodni projekat"><ArrowLeft size={16} /></button><button onClick={() => step(1)} aria-label="Sledeći projekat"><ArrowRight size={16} /></button></div></div>
      </div>
      <div className="mobile-dots" role="group" aria-label="Izaberi projekat">{projects.map((project,index) => <button key={project.slug} className={active===index?"active":""} onClick={()=>setActive(index)} aria-label={`Izaberi ${project.title}`} aria-pressed={active===index} />)}</div>
    </> : <section className="project-index" aria-label="Lista projekata">
      <div className="index-heading"><h1>RAZLIČITE<br />FREKVENCIJE<span className="orange">.</span></h1><p>Osam svetova.<br />Jedna kreativna orbita.</p></div>
      <div className="index-filters" role="group" aria-label="Filtriraj projekte">{filterOptions.map((option) => <button key={option} aria-pressed={filter===option} onClick={()=>setFilter(option)}>{filterLabels[option]}{option==="All" && <span>08</span>}</button>)}</div>
      <div className="index-rows">{projects.map((project,index) => (filter==="All" || project.discipline===filter) && <TransitionLink className="index-row" key={project.slug} href={`/work/${project.slug}/`}><span className="eyebrow">{String(index+1).padStart(2,"0")}</span><Image src={`/design/${project.slug}.png`} width={80} height={100} alt={`${project.title} — plakat`} /><h2>{project.title}</h2><span className="index-category">{project.category}</span><span className="eyebrow index-year">{project.year}</span><ArrowUpRight strokeWidth={1.2} size={30} /></TransitionLink>)}</div>
      <TransitionLink href="/about" className="index-about">Iza radova<ArrowDown size={18} /></TransitionLink>
    </section>}
    <Footer className="site-footer-gallery" />
  </main>;
}
