import sharp from "sharp";
await sharp("public/art/social-card.svg").png().toFile("public/art/social-card.png");
console.log("Generated 1200×630 social preview.");
