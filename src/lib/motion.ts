"use client";

import { useSyncExternalStore } from "react";

export const EASE = "power3.inOut";
const noMatch = () => false;

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    noMatch,
  );
}

export function useReducedMotion() { return useMediaQuery("(prefers-reduced-motion: reduce)"); }
