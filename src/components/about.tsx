"use client";

import { ArrowUpRight } from "lucide-react";
import { expertise } from "@/lib/projects";
import { Footer } from "./footer";
import { TransitionLink } from "./site-shell";
import { useRef } from "react";
import { usePageMotion } from "@/lib/page-motion";

export function About() {
  const root = useRef<HTMLElement>(null);
  usePageMotion(root);
  return <main id="main" ref={root} className="about-page">
    <section className="about-intro"><h1 className="page-reveal">A CREATIVE<br />MIND. <span className="outline-type">AN OPEN</span><br /><span className="outline-type">FREQUENCY.</span></h1><div className="about-intro-bottom page-reveal"><span>Filip Radojković</span><span className="eyebrow">CREATIVE PRODUCER / SOCIAL MEDIA MANAGER<br />DIGITAL CONTENT PROFESSIONAL</span></div></section>
    <section className="about-bio"><div><h2 data-reveal>From the first idea<br />to the last frame.</h2><p data-reveal>Working across creative production, digital content and live events. Bringing ideas from concept to execution through visual storytelling, creative direction and collaborative production.</p></div></section>
    <section className="expertise-section"><div className="expertise-heading" data-reveal><h2>A FEW WAYS<br />TO CREATE<br /><span className="orange">AN IMPACT.</span></h2></div><div className="expertise-rows">{expertise.map((item)=><div key={item} className="expertise-row" data-reveal><h3>{item}</h3></div>)}</div></section>
    <div className="about-work-link" data-reveal><TransitionLink href="/" className="text-link">Explore the creative orbit<ArrowUpRight size={18} /></TransitionLink></div>
    <section className="about-contact"><TransitionLink href="/contact" className="contact-invite"><span>GOT SOMETHING<br />IN MIND?</span><ArrowUpRight strokeWidth={1} /></TransitionLink></section>
    <Footer />
  </main>;
}
