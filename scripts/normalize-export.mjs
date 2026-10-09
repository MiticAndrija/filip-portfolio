import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

// Next.js 16 can export segment payloads as nested paths on Windows, while
// its client requests the same segments using dot-separated filenames.
// Keep both forms so client navigation works on an ordinary static host.
const exportRoot = path.resolve("out");
let aliases = 0;
async function visit(directory) {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    const source = path.join(directory,entry.name);
    if (entry.isDirectory()) { await visit(source); continue; }
    if (!entry.name.endsWith(".txt")) continue;
    const segments = path.relative(exportRoot,source).split(path.sep);
    const firstPayload = segments.findIndex((segment)=>segment.startsWith("__next."));
    if (firstPayload < 0 || firstPayload === segments.length - 1) continue;
    const target = path.join(exportRoot,...segments.slice(0,firstPayload),segments.slice(firstPayload).join("."));
    if (!target.startsWith(exportRoot + path.sep)) throw new Error("Payload target must stay within the static export.");
    await copyFile(source,target);
    aliases++;
  }
}
await visit(exportRoot);
console.log(`Static export ready. Added ${aliases} compatible segment payload paths.`);
