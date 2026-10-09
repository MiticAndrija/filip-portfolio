# Creative Orbit — Filip Radojković

An original experimental portfolio prototype built with Next.js App Router, React,
TypeScript, Three.js, React Three Fiber, Drei, GSAP/ScrollTrigger and Lenis.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Production: `npm run build`, then `npm run preview`.
The static export in `out/` can be deployed to any static host.
The postbuild step adds compatible segment payload paths for Next.js exports
created on Windows, keeping animated client navigation on ordinary static hosts.

## Check

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser checks use the installed Chrome browser; set `PLAYWRIGHT_CHROME_PATH` if
Chrome lives in a different location. Tests start a local server automatically.

## Experience

- Eight original, fictional project identities with self-contained SVG artwork.
- Perspective WebGL gallery, pointer parallax, drag rotation, focus transitions.
- Swipe browsing and project selectors on mobile.
- Accessible project index with discipline filters.
- Animated reusable case studies at `/work/[slug]/`, About and Contact.
- GSAP typography and page transitions; Lenis on editorial pages.
- First-paint CSS opening, followed by synchronized typography and poster
  entrances once the gallery is ready. View switches and filters replay their
  reveals, and each page manages its own motion after navigation.
- Reduced-motion support, keyboard navigation and a non-WebGL gallery fallback.
- Locally bundled fonts, lazy-loaded Three.js and compact vector textures.
- Gallery textures are pre-rendered WebP at 512px (384px on mobile), with stable
  GPU uploads. Gentle desktop floating uses 30fps; interactions target 60fps.
  Mobile rendering sleeps once motion settles, and hidden tabs stop rendering.

Project content is in `src/lib/projects.ts`. Artwork is in `public/art/`; regenerate
it with `node scripts/generate-art.mjs`. Styling is in `src/app/globals.css`.
After changing a poster, run `node scripts/generate-gallery-textures.mjs` to
refresh its optimized gallery textures. Case studies keep the full SVG artwork.

All work is fictional prototype content; no real client work or personal imagery
is used. Contact downloads a text brief locally, without storing or submitting
personal information. Add a public `NEXT_PUBLIC_CONTACT_EMAIL` in `.env.local`
before building to enable email draft links to the real recipient.

## Dependency audit

The production dependency audit passes. The installed development toolchain has
seven npm advisory findings through the Next.js ESLint glob dependencies and the
local `serve` preview dependency. These are excluded from the static export.
Update their transitive `braces` and `compression` dependencies when patched
versions can be installed; this environment blocks the extra registry access.
