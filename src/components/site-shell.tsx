"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type MouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { EASE, useReducedMotion } from "@/lib/motion";
import { OpeningProvider, useOpening } from "./opening";

const NavigationContext = createContext<(href: string) => void>(() => {});
export function useTransitionNavigate() { return useContext(NavigationContext); }

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const navigate = useTransitionNavigate();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === "_blank") return;
    const target = String(href);
    if (target.startsWith("/")) { event.preventDefault(); navigate(target); }
  };
  return <Link href={href} onClick={handleClick} {...props} />;
}

function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const cursorElement = ref.current;
    const x = gsap.quickTo(cursorElement, "x", { duration: .25, ease: "power3.out" });
    const y = gsap.quickTo(cursorElement, "y", { duration: .25, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      x(event.clientX); y(event.clientY);
      const active = (event.target as HTMLElement).closest("a, button, canvas, input, textarea");
      ref.current?.classList.toggle("cursor-active", Boolean(active));
      ref.current?.classList.add("cursor-visible");
    };
    const leave = () => ref.current?.classList.remove("cursor-visible");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); gsap.killTweensOf(cursorElement); };
  }, [reduced]);
  return <div className="custom-cursor" ref={ref} aria-hidden="true"><span /></div>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pendingNavigation = useRef<string | null>(null);
  const reduced = useReducedMotion();
  const navigate = useCallback((href: string) => {
    if (busy.current) { pendingNavigation.current = href; return; }
    if (pathname.replace(/\/$/,"") === href.replace(/\/$/,"")) {
      if (href === "/") window.dispatchEvent(new Event("orbit:home"));
      return;
    }
    if (reduced) { router.push(href); return; }
    busy.current = true;
    gsap.set(curtain.current, { y: 0, yPercent: 100, visibility: "visible" });
    gsap.to(curtain.current, { yPercent: 0, duration: .5, ease: EASE, onComplete: () => router.push(href) });
  }, [pathname, reduced, router]);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (busy.current) {
        gsap.to(curtain.current, { yPercent: -100, duration: .65, delay: .1, ease: EASE, onComplete: () => {
          busy.current = false;
          gsap.set(curtain.current, { visibility: "hidden" });
          const queued = pendingNavigation.current;
          pendingNavigation.current = null;
          if (queued) navigate(queued);
        } });
      }

    });
    return () => context.revert();
  }, [pathname, reduced, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (reduced || pathname === "/") return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, [pathname, reduced]);

  return <NavigationContext.Provider value={navigate}><OpeningProvider needsScene={pathname === "/"}>
    <a href="#main" className="skip-link">Skip to content</a>
    <Header pathname={pathname} />
    {children}
    <div ref={curtain} className="transition-curtain" aria-hidden="true" />
    <Cursor />
  </OpeningProvider></NavigationContext.Provider>;
}

function Header({ pathname }: { pathname: string }) {
  const root = useRef<HTMLElement>(null);
  const { canAnimate } = useOpening();
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!canAnimate || reduced) return;
    const context = gsap.context(() => {
      gsap.fromTo(".wordmark, nav", { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: .75, stagger: .08, ease: "power3.out" });
    }, root);
    return () => context.revert();
  }, [canAnimate, reduced]);
  return <header className="site-header" ref={root}>
      <TransitionLink href="/" aria-label="Filip Radojković — home" className="wordmark">fr<span className="wordmark-dot">.</span><span className="wordmark-caption">FILIP<br />RADOJKOVIĆ</span></TransitionLink>
      <nav aria-label="Main navigation">{[{href:"/",label:"Work"},{href:"/about",label:"About"},{href:"/contact",label:"Contact"}].map(({href,label}) => <TransitionLink key={href} href={href} aria-current={pathname===href || (href==="/" && pathname.startsWith("/work")) ? "page" : undefined}>{label}{label==="Contact" && <ArrowUpRight size={13} />}</TransitionLink>)}</nav>
    </header>;
}
