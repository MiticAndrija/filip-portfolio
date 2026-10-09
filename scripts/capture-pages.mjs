import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts",{recursive:true});
const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true,args:["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.addInitScript(()=>sessionStorage.setItem("orbit-entered","true"));
const errors = [];
page.on("pageerror",error=>errors.push(error.message));
for (const [name,url] of [["case","/work/no-signal/"],["about","/about/"],["contact","/contact/"]]) {
  await page.goto(`http://127.0.0.1:3000${url}`,{waitUntil:"networkidle"});
  await page.locator("h1").waitFor({state:"visible"});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector("h1")).opacity==="1");
  await page.screenshot({path:`artifacts/${name}-desktop.png`});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:`artifacts/${name}-mobile.png`,fullPage:true});
  console.log(`${name} mobile viewport:`,await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth})));
  await page.setViewportSize({width:1440,height:1000});
}
await page.goto("http://127.0.0.1:3000/",{waitUntil:"networkidle"});
await page.getByRole("button",{name:"Project index"}).click();
await page.screenshot({path:"artifacts/index-desktop.png"});
await page.setViewportSize({width:390,height:844});
await page.getByRole("button",{name:"Spatial gallery"}).click();
await page.getByRole("button",{name:"Spatial gallery"}).waitFor({state:"visible"});
await page.waitForFunction(()=>document.querySelector(".view-switch button[aria-label='Spatial gallery']")?.getAttribute("aria-pressed")==="true" && !!document.querySelector("canvas"));
await page.waitForLoadState("networkidle");
await page.screenshot({path:"artifacts/home-mobile-refined.png"});
console.log("Browser errors:",JSON.stringify(errors));
await browser.close();
