import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const directory = "public/art/gallery";
await mkdir(directory, { recursive: true });
const posters = (await readdir("public/art")).filter((name) => name.endsWith(".svg") && name !== "social-card.svg");
for (const poster of posters) {
  const slug = path.basename(poster, ".svg");
  for (const [suffix, width] of [["", 512], ["-mobile", 384]]) {
    await sharp(path.join("public/art", poster))
      .resize(width, Math.round(width * 1.25))
      .webp({ quality: 88, effort: 6 })
      .toFile(path.join(directory, `${slug}${suffix}.webp`));
  }
}
console.log(`Generated desktop and mobile gallery textures for ${posters.length} posters.`);
