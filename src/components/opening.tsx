"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { EASE, useReducedMotion } from "@/lib/motion";

const OpeningContext = createContext({ canAnimate: true, onReady: () => {} });
export function useOpening() { return useContext(OpeningContext); }

function Intro({ ready, onReveal }: { ready: boolean; onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const progress = useRef({ value: 0 });
  const loadingTween = useRef<gsap.core.Tween | null>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const tween = gsap.to(progress.current, {
      value: 94, duration: 1.6, ease: "power2.out", roundProps: "value",
      onUpdate: () => { if (count.current) count.current.textContent = String(progress.current.value).padStart(3, "0"); },
    });
    loadingTween.current = tween;
    return () => { tween.kill(); };
  }, [reduced]);

  useLayoutEffect(() => {
    if (!ready && !reduced) return;
    const element = root.current;
    if (!element) return;
    let disposed = false;
    let timeline: gsap.core.Timeline | undefined;
    let frame = 0;
    const finish = async () => {
      await document.fonts.ready;
      if (disposed) return;
      if (reduced) {
        gsap.set(element, { display: "none" });
        frame = requestAnimationFrame(onReveal);
        return;
      }
      // CSS has already been animating since the first paint. Continue its
      // timing instead of restarting the letters after React hydrates.
      const letter = element.querySelector<HTMLElement>(".intro-character");
      const animation = letter?.getAnimations()[0];
      const elapsed = performance.now() - Number(animation?.startTime ?? performance.now());
      const remaining = Math.max(0, 1150 - elapsed) / 1000;
      timeline = gsap.timeline({ delay: remaining, onStart: () => { loadingTween.current?.kill(); } });
      timeline.to(progress.current, {
        value: 100, duration: .12, roundProps: "value",
        onUpdate: () => { if (count.current) count.current.textContent = String(progress.current.value).padStart(3, "0"); },
      }).to(element, {
        yPercent: -100, duration: .8, ease: EASE,
        onStart: onReveal,
        onComplete: () => gsap.set(element, { display: "none" }),
      }, ">-.04");
    };
    void finish();
    return () => { disposed = true; timeline?.kill(); cancelAnimationFrame(frame); };
  }, [ready, reduced, onReveal]);

  return <div className="intro" ref={root} aria-hidden="true">
    <div className="intro-name">{["FILIP", "RADOJKOVIĆ"].map((word, wordIndex) =>
      <div key={word}>{[...word].map((letter, index) =>
        <span className="intro-clip" key={index}><span className="intro-character" style={{ "--opening-delay": `${(index + (wordIndex ? 4 : 0)) * 24}ms` } as CSSProperties}>{letter}</span></span>
      )}</div>
    )}</div>
    <div className="intro-bottom"><span className="eyebrow">TUNING IN</span><span ref={count} className="eyebrow">000</span></div>
    <div className="intro-rule"><span /></div>
  </div>;
}

export function OpeningProvider({ children, needsScene }: { children: ReactNode; needsScene: boolean }) {
  const [canAnimate, setCanAnimate] = useState(false);
  const [ready, setReady] = useState(!needsScene);
  const onReady = useCallback(() => setReady(true), []);
  const onReveal = useCallback(() => setCanAnimate(true), []);
  const value = useMemo(() => ({ canAnimate, onReady }), [canAnimate, onReady]);

  useEffect(() => {
    if (ready) return;
    // Keep navigation available even if a device cannot finish loading WebGL.
    const timeout = setTimeout(onReady, 5000);
    return () => clearTimeout(timeout);
  }, [ready, onReady]);

  return <OpeningContext.Provider value={value}>{children}<Intro ready={ready} onReveal={onReveal} /></OpeningContext.Provider>;
}
