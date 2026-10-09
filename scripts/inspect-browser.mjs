import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("artifacts",{recursive:true});
const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true,args:["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]});
const reference = await browser.newPage({viewport:{width:1440,height:1000}, deviceScaleFactor:1});
const errors = [];
await reference.goto("https://funnydayz.com/portfolio", {waitUntil:"domcontentloaded",timeout:30000}).then(async()=>{
  await reference.screenshot({path:"artifacts/reference.png",timeout:15000});
  console.log("Reference title:",await reference.title());
  console.log("Reference visible interface:",(await reference.locator("body").innerText()).slice(0,2000));
}).catch(error=>console.log("Reference browser limit:",error.message));
await reference.close();
const page = await browser.newPage({viewport:{width:1440,height:1000}, deviceScaleFactor:1});
page.on("pageerror",error=>errors.push(error.message));
await page.goto("http://127.0.0.1:3000",{waitUntil:"networkidle",timeout:60000});
await page.locator(".intro").waitFor({state:"hidden",timeout:10000});
await page.screenshot({path:"artifacts/home-desktop.png"});
console.log("Homepage title:",await page.title());
console.log("Canvas:",await page.locator("canvas").count());
console.log("Browser errors:",JSON.stringify(errors));
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:"artifacts/home-mobile.png"});
await browser.close();
