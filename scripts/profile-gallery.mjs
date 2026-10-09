import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const label = process.argv[2] || "current";
const baseUrl = process.argv[3] || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  window.galleryProfile = { uploads: 0, draws: 0, frames: [] };
  for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
    for (const method of ["texImage2D", "texSubImage2D", "drawArrays", "drawElements"]) {
      const original = type.prototype[method];
      type.prototype[method] = function (...args) {
        window.galleryProfile[method.startsWith("tex") ? "uploads" : "draws"]++;
        return original.apply(this, args);
      };
    }
  }
  let previous = 0;
  const sample = (now) => {
    if (previous) window.galleryProfile.frames.push(now - previous);
    previous = now;
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
});
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 30000 });
await expect(page.locator(".intro")).toBeHidden();
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(() => window.galleryProfile.draws > 40, { timeout: 30000 });
const initial = await page.evaluate(() => ({ ...window.galleryProfile, frames: undefined }));
await page.evaluate(() => { window.galleryProfile.frames = []; });
// Repeatedly entering and leaving different posters reproduces project selection stutter.
for (let pass = 0; pass < 4; pass++) {
  for (const [x, y] of [[230, 350], [720, 450], [1180, 350], [720, 450], [560, 300], [720, 450]]) {
    await page.mouse.move(x, y, { steps: 4 });
  }
}
const result = await page.evaluate((initial) => {
  const frames = window.galleryProfile.frames.slice().sort((a, b) => a - b);
  const canvas = document.querySelector("canvas");
  return {
    textureUploadsDuringHover: window.galleryProfile.uploads - initial.uploads,
    drawCallsDuringHover: window.galleryProfile.draws - initial.draws,
    medianFrameMs: Number((frames[Math.floor(frames.length * .5)] || 0).toFixed(1)),
    p95FrameMs: Number((frames[Math.floor(frames.length * .95)] || 0).toFixed(1)),
    canvasPixels: canvas.width * canvas.height,
    canvasSize: [canvas.width, canvas.height],
  };
}, initial);
await mkdir("artifacts", { recursive: true });
await writeFile(`artifacts/gallery-performance-${label}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ label, ...result }));
await browser.close();
