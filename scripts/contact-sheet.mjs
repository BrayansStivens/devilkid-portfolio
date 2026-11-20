// Dev helper: tile a section's originals into labelled contact sheets.
//   node scripts/contact-sheet.mjs <section> <outDir> [cols] [cell] [perSheet] [bg]
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const [section, outDir, cols = '6', cell = '260', perSheet = '36', bg = '#808080'] = process.argv.slice(2);
const manifest = JSON.parse(await readFile('raw/site/manifest.json', 'utf8'));
const items = manifest[section];
const C = +cols, S = +cell, N = +perSheet;

for (let p = 0; p * N < items.length; p++) {
  const chunk = items.slice(p * N, (p + 1) * N);
  const rows = Math.ceil(chunk.length / C);
  const tiles = await Promise.all(
    chunk.map(async (it, i) => {
      const img = await sharp(path.join('raw/site', section, it.file))
        .resize(S - 8, S - 8, { fit: 'inside' })
        .flatten({ background: bg })
        .png()
        .toBuffer();
      const label = Buffer.from(
        `<svg width="${S}" height="18" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Menlo" font-size="11" fill="#0f0">${it.idx} ${it.file.slice(0, 30)}</text></svg>`,
      );
      const x = (i % C) * S, y = Math.floor(i / C) * (S + 18);
      return [
        { input: img, left: x + 4, top: y + 4 },
        { input: label, left: x, top: y + S },
      ];
    }),
  );
  await sharp({ create: { width: C * S, height: rows * (S + 18), channels: 3, background: bg } })
    .composite(tiles.flat())
    .jpeg({ quality: 82 })
    .toFile(path.join(outDir, `${section}-${p + 1}.jpg`));
}
console.log(section, 'ok');
