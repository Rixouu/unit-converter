import { readFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const iconPath = join(publicDir, "icon-unit-converter.png");

const BG_HEX = "#E91E63";

const iconOutputs = [
  { size: 192, file: "web-app-manifest-192x192.png" },
  { size: 512, file: "web-app-manifest-512x512.png" },
  { size: 180, file: "apple-touch-icon.png" },
  { size: 96, file: "favicon-96x96.png" },
  { size: 32, file: "favicon-32x32.png" },
  { size: 16, file: "favicon-16x16.png" },
];

const splashOutputs = [
  { w: 2048, h: 2732, file: "apple-splash-2048-2732.jpg" },
  { w: 1668, h: 2388, file: "apple-splash-1668-2388.jpg" },
  { w: 1536, h: 2048, file: "apple-splash-1536-2048.jpg" },
  { w: 1640, h: 2360, file: "apple-splash-1640-2360.jpg" },
  { w: 1668, h: 2224, file: "apple-splash-1668-2224.jpg" },
  { w: 1620, h: 2160, file: "apple-splash-1620-2160.jpg" },
  { w: 1488, h: 2266, file: "apple-splash-1488-2266.jpg" },
  { w: 1320, h: 2868, file: "apple-splash-1320-2868.jpg" },
  { w: 1206, h: 2622, file: "apple-splash-1206-2622.jpg" },
  { w: 1260, h: 2736, file: "apple-splash-1260-2736.jpg" },
  { w: 1290, h: 2796, file: "apple-splash-1290-2796.jpg" },
  { w: 1179, h: 2556, file: "apple-splash-1179-2556.jpg" },
  { w: 1170, h: 2532, file: "apple-splash-1170-2532.jpg" },
  { w: 1284, h: 2778, file: "apple-splash-1284-2778.jpg" },
  { w: 1125, h: 2436, file: "apple-splash-1125-2436.jpg" },
  { w: 1242, h: 2688, file: "apple-splash-1242-2688.jpg" },
  { w: 828, h: 1792, file: "apple-splash-828-1792.jpg" },
  { w: 1242, h: 2208, file: "apple-splash-1242-2208.jpg" },
  { w: 750, h: 1334, file: "apple-splash-750-1334.jpg" },
  { w: 640, h: 1136, file: "apple-splash-640-1136.jpg" },
];

async function main() {
  const iconBuf = await readFile(iconPath);
  
  // Generate Icons
  for (const { size, file } of iconOutputs) {
    const outPath = join(publicDir, file);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_HEX
      }
    })
    .composite([{ 
      input: await sharp(iconBuf).resize(Math.round(size * 0.8)).toBuffer(),
      gravity: 'centre'
    }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
    console.log(`Wrote icon: ${file}`);
  }

  // Generate Splash Screens
  const splashDir = join(publicDir, "splash");
  await mkdir(splashDir, { recursive: true });

  for (const { w, h, file } of splashOutputs) {
    const outPath = join(splashDir, file);
    const iconSize = Math.round(Math.min(w, h) * 0.3);
    
    await sharp({
      create: {
        width: w,
        height: h,
        channels: 3,
        background: BG_HEX
      }
    })
    .composite([{ 
      input: await sharp(iconBuf).resize(iconSize).toBuffer(),
      gravity: 'centre'
    }])
    .jpeg({ quality: 90 })
    .toFile(outPath);
    console.log(`Wrote splash: ${file}`);
  }
}

main().catch(console.error);
