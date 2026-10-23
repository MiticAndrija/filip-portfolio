"use client";

import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getNextProject, projects, type Project } from "@/lib/projects";
import { useReducedMotion } from "@/lib/motion";
import { TransitionLink } from "./site-shell";
import { Footer } from "./footer";
import { usePageMotion } from "@/lib/page-motion";

export function ProjectCaseStudy({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const next = getNextProject(project.slug);
  const index = projects.findIndex((entry)=>entry.slug===project.slug);
  usePageMotion(ref, project.slug);
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to(".case-hero-art", { yPercent: 12, rotation: 2, ease: "none", scrollTrigger: { trigger: ".case-hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".showcase-center", { y: 100, rotate: -9 }, { y: -60, rotate: 6, ease: "none", scrollTrigger: { trigger: ".case-showcase", start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.to(".case-marquee-track", { xPercent: -25, ease: "none", scrollTrigger: { trigger: ".case-showcase", start: "top bottom", end: "bottom top", scrub: 1.5 } });
    }, ref);
    return ()=>context.revert();
  }, [project.slug, reduced]);

  return <main id="main" ref={ref} className={`case-study case-${project.slug}`} style={{ "--project-color": project.color, "--project-bg": project.background } as CSSProperties}>
    <section className="case-hero">
      <div className="case-topline page-reveal"><TransitionLink href="/" className="back-link"><ArrowLeft size={15} /> NAZAD U ORBITU</TransitionLink><span className="eyebrow">PROJEKAT {String(index+1).padStart(2,"0")} / 08</span></div>
      <div className="case-title-area"><span className="eyebrow page-reveal">{project.category} / {project.year}</span><h1 className="case-title page-reveal">{project.title.split(" ").map((word,i)=><span key={i}>{word} </span>)}</h1><p className="case-tagline page-reveal">{project.tagline}</p></div>
      <div className="case-hero-art page-reveal"><Image src={project.artwork} alt={`${project.title} — glavni plakat`} width={800} height={1000} loading="eager" fetchPriority="high" /></div>
      <a href="#concept" className="case-scroll"><ArrowDown size={20} /><span className="eyebrow">POGLEDAJ VIŠE</span></a>
    </section>
    <section className="case-concept" id="concept">
      <div className="concept-copy"><h2 data-reveal>{project.tagline}</h2><p data-reveal>{project.description}</p><div className="case-deliverables" data-reveal>{project.deliverables.map((item)=><span key={item}>{item}</span>)}</div></div>
    </section>
    <section className="case-showcase" aria-label={`${project.title} — vizuelni prikaz`}>
      <div className="case-marquee" aria-hidden="true"><div className="case-marquee-track">{Array.from({length:4},(_,i)=><span key={i}>{project.title}</span>)}</div></div>
      <div className="showcase-ghost showcase-ghost-left"><Image src={project.artwork} alt="" width={800} height={1000} loading="lazy" /></div>
      <div className="showcase-center"><Image src={project.artwork} alt={`${project.title} — glavni vizual kampanje`} width={800} height={1000} loading="lazy" /></div>
      <div className="showcase-ghost showcase-ghost-right"><Image src={project.artwork} alt="" width={800} height={1000} loading="lazy" /></div>
    </section>
    <section className="case-direction">
      <div className="direction-copy"><span className="eyebrow" data-reveal>Kreativni pravac</span><h2 data-reveal>Jedan svet.<br />Svi formati.</h2><p data-reveal>{project.direction}</p></div>
      <div className="format-composition" data-reveal><div className="format-square"><Image src={project.artwork} alt={`${project.title} — kvadratni format kampanje`} width={500} height={625} /></div><div className="format-phone"><div className="phone-notch"/><Image src={project.artwork} alt={`${project.title} — vertikalni format za mreže`} width={400} height={500} /><span className="phone-caption">{project.tagline}</span><span className="phone-progress" /></div></div>
    </section>
    <section className="next-project" style={{ "--next-color": next.color } as CSSProperties}><div className="next-heading"><span className="eyebrow">Sledeći projekat</span><TransitionLink href="/" className="text-link">Svih osam projekata <ArrowUpRight size={16} /></TransitionLink></div><TransitionLink href={`/work/${next.slug}/`}><h2>{next.title}</h2><ArrowUpRight strokeWidth={.8} /><Image src={next.artwork} alt={`${next.title} — najava projekta`} width={240} height={300} /></TransitionLink><Footer /></section>
  </main>;
}
