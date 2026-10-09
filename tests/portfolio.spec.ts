import { test, expect, type Page } from "@playwright/test";
import sharp from "sharp";

async function openPage(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator(".intro")).toBeHidden();
}

test("opening moves before JavaScript loads", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    const letter = page.locator(".intro-character").first();
    const opening = await letter.evaluate((letter) => {
      const animation = letter.getAnimations()[0];
      const started = Number(animation.currentTime);
      const initialY = new DOMMatrix(getComputedStyle(letter).transform).m42;
      return { name: getComputedStyle(letter).animationName, started, initialY };
    });
    expect(opening.name).toBe("opening-letter");
    expect(opening.started).toBeLessThan(500);
    await expect.poll(() => letter.evaluate((letter) => Number(letter.getAnimations()[0].currentTime))).toBeGreaterThan(opening.started + 50);
    const currentY = await letter.evaluate((letter) => new DOMMatrix(getComputedStyle(letter).transform).m42);
    expect(currentY).toBeLessThan(opening.initialY);
  } finally { await context.close(); }
});

test("opening replays on reload and the Space view restores its title reveal", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("orbit-entered", "true"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".intro")).toBeVisible();
  await expect(page.locator(".intro")).toBeHidden();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".intro")).toBeVisible();
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page.getByRole("button", { name: "Project index" }).click();
  await expect(page.locator(".index-row")).toHaveCount(8);
  await page.getByRole("button", { name: "Spatial gallery" }).click();
  const title = page.locator(".name-first .title-char").first();
  const offset = () => title.evaluate((letter) => new DOMMatrix(getComputedStyle(letter).transform).m42);
  await expect.poll(offset).toBeGreaterThan(5);
  await expect.poll(offset).toBeLessThan(.2);
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about\/?$/);
  const heading = page.locator(".about-intro h1");
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("opacity", "1");
});

test("spatial gallery renders, dragging does not navigate, and artwork opens a case study", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror",(error)=>errors.push(error.message));
  await openPage(page,"/");
  await expect(page.getByRole("heading",{name:"Filip Radojković — Creative Production / Social Media / Events"})).toBeAttached();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.mouse.move(680,430);
  await page.mouse.down(); await page.mouse.move(830,480,{steps:12}); await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link",{name:"Work",exact:true}).click();
  await page.mouse.move(238,360);
  await expect(page.getByRole("button",{name:"Open NO SIGNAL"})).toBeVisible();
  await page.mouse.click(238,360);
  await expect(page).toHaveURL(/\/work\/no-signal\/?$/);
  await expect(page.getByRole("heading",{level:1})).toHaveText("NO SIGNAL");
  await expect(page.getByRole("contentinfo")).toContainText("Niš, Serbia");
  expect(errors).toEqual([]);
});

test("project index filters work and every project route exists", async ({ page, request }) => {
  await openPage(page,"/");
  await page.evaluate(()=>{ (window as Window & {navigationMarker?:string}).navigationMarker="same-runtime"; });
  await page.getByRole("button",{name:"Project index"}).click();
  await expect(page.locator(".index-row")).toHaveCount(8);
  await page.getByRole("button",{name:"Events",exact:true}).click();
  await expect(page.locator(".index-row")).toHaveCount(2);
  await expect(page.locator(".index-row h2")).toHaveText(["NO SIGNAL","NIGHTSHIFT"]);
  await page.getByRole("button",{name:"Film",exact:true}).click();
  await expect(page.locator(".index-row h2")).toHaveText(["AFTER HOURS","ECHO ROOM"]);
  await page.getByRole("button",{name:"All08",exact:true}).click();
  const links = await page.locator(".index-row").evaluateAll((items)=>items.map((item)=>item.getAttribute("href")!));
  for (const href of links) expect((await request.get(href)).ok()).toBeTruthy();
  await page.locator(".index-row[href='/work/echo-room/']").click();
  await expect(page).toHaveURL(/\/work\/echo-room\/?$/);
  await page.locator(".next-project > a").click();
  await expect(page).toHaveURL(/\/work\/motion-culture\/?$/);
  expect(await page.evaluate(()=>(window as Window & {navigationMarker?:string}).navigationMarker)).toBe("same-runtime");
});

test("about, contact and downloaded project brief are functional", async ({ page }) => {
  await openPage(page,"/about/");
  await expect(page.getByText("Filip Radojković",{exact:true})).toBeVisible();
  await expect(page.locator(".expertise-row")).toHaveCount(6);
  await page.getByRole("link",{name:"Contact",exact:true}).click();
  await expect(page).toHaveURL(/\/contact\/?$/);
  await page.getByLabel("Your name").fill("Alex Example");
  await page.getByLabel("Your email").fill("alex@example.com");
  await page.getByLabel("What’s the frequency?").selectOption("Music video");
  await page.getByLabel("A little about your idea").fill("A cinematic music film for an independent artist.");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button",{name:"CREATE MY PROJECT BRIEF"}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("creative-orbit-project-brief.txt");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const brief = Buffer.concat(chunks).toString("utf8");
  expect(brief).toContain("Name: Alex Example"); expect(brief).toContain("Project: Music video");
  await expect(page.getByText("Your project brief is ready. Download started — nothing was sent.")).toBeVisible();
});

test("mobile browsing responds to swipe and fits the viewport", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await openPage(page,"/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.mouse.move(310,430); await page.mouse.down(); await page.mouse.move(80,430,{steps:15}); await page.mouse.up();
  await expect(page.getByRole("button",{name:"Open AFTER HOURS"})).toBeVisible();
  await page.getByRole("button",{name:"Next project",exact:true}).click();
  await expect(page.getByRole("button",{name:"Open RAW FREQUENCY"})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.getByRole("button",{name:"Open RAW FREQUENCY"}).click();
  await expect(page).toHaveURL(/\/work\/raw-frequency\/?$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("desktop to mobile resize keeps the selected artwork visible", async ({ page }) => {
  await openPage(page,"/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator(".explore-hint")).toContainText("SWIPE TO EXPLORE");
  await expect.poll(async()=>{
    const screenshot = await page.screenshot();
    const {channels} = await sharp(screenshot).extract({left:80,top:555,width:30,height:25}).stats();
    return channels[0].mean - channels[1].mean;
  },{message:"The orange NO SIGNAL artwork should render after the layout changes."}).toBeGreaterThan(20);
});

test("reduced motion and unavailable WebGL preserve access to all projects", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.addInitScript(()=>{
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement,type: string,...args: unknown[]) {
      if(type==="webgl" || type==="webgl2" || type==="experimental-webgl") return null;
      return original.apply(this,[type,...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await openPage(page,"/");
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.getByRole("button",{name:"View NO SIGNAL",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"View NO SIGNAL",exact:true}).click();
  await expect(page).toHaveURL(/\/work\/no-signal\/?$/);
  await expect(page.getByRole("heading",{level:1})).toHaveText("NO SIGNAL");
});
