"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useOpening } from "@/components/opening";
import { useReducedMotion } from "./motion";

// Each page owns its reveals, so streamed route content and reused project
// components animate when their real DOM is mounted, not on a pathname guess.
export function usePageMotion(root: RefObject<HTMLElement | null>, revision = "") {
  const { canAnimate } = useOpening();
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = root.current;
    if (!element || !canAnimate || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    const context = gsap.context(() => {
      gsap.set(".page-reveal", { y: 36, opacity: 0 });
    }, element);
    const frame = requestAnimationFrame(() => {
      context.add(() => {
        gsap.to(".page-reveal", { y: 0, opacity: 1, duration: .85, stagger: .07, ease: "power3.out" });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((item) => {
          gsap.fromTo(item, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: .9, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 90%", once: true },
          });
        });
        ScrollTrigger.refresh();
      });
    });
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; cancelAnimationFrame(frame); context.revert(); };
  }, [root, canAnimate, reduced, revision]);
}
