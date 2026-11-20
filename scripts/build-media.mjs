// Turns the originals in raw/site into the web-ready set under public/.
// Writes src/data/media.json so pages know every image's size and variants.
//   node scripts/build-media.mjs
import sharp from 'sharp';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const RAW = 'raw/site';
const PUB = 'public';
const manifest = JSON.parse(await readFile(`${RAW}/manifest.json`, 'utf8'));
const media = {};

const exists = (p) => stat(p).then(() => true, () => false);

async function variants(key, input, outBase, widths, opts = {}) {
  const { quality = 82, trim = false } = opts;
  let buf = await readFile(input);
  if (trim) buf = await sharp(buf).trim().toBuffer();
  const meta = await sharp(buf).metadata();
  const stats = meta.hasAlpha ? await sharp(buf).stats() : { isOpaque: true };
  const sizes = [...new Set(widths.map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);
  await mkdir(path.dirname(path.join(PUB, outBase)), { recursive: true });
  for (const w of sizes) {
    const dest = path.join(PUB, `${outBase}-${w}.webp`);
    if (await exists(dest)) continue;
    await sharp(buf)
      .resize({ width: w })
      .webp({ quality, alphaQuality: 92, effort: 5 })
      .toFile(dest);
  }
  media[key] = { src: outBase, w: meta.width, h: meta.height, sizes, alpha: !stats.isOpaque };
}

const base = (file) => file.replace(/\.[a-z]+$/i, '');
const jobs = [];
const add = (fn) => jobs.push(fn);

for (const it of manifest.fashion)
  add(() => variants(`fashion/${it.file}`, `${RAW}/fashion/${it.file}`, `media/fashion/${base(it.file)}`, [480, 960, 1600]));
for (const it of manifest.art)
  add(() => variants(`art/${it.file}`, `${RAW}/art/${it.file}`, `media/art/${base(it.file)}`, [480, 960, 1440], { quality: 86 }));
for (const it of manifest.typography)
  add(() => variants(`typography/${it.file}`, `${RAW}/typography/${it.file}`, `media/type/${base(it.file)}`, [480, 960], { trim: true, quality: 90 }));
for (const it of manifest.visuals) {
  const id = it.embed.split('/embed/')[1];
  add(() => variants(`yt/${id}`, `${RAW}/yt/${id}.jpg`, `media/visuals/${id}`, [480, 960, 1280], { quality: 78 }));
}
add(() => variants('about/portrait', `${RAW}/aboutme/devil-kid-pp-3c2efe.webp`, 'media/about/portrait', [480, 960]));
add(() => variants('reel/poster', `${RAW}/reel/poster.jpg`, 'media/reel/poster', [640, 1280], { quality: 78 }));

const queue = [...jobs];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) await job();
  }),
);

// --- Brand marks -----------------------------------------------------------
await mkdir(`${PUB}/brand`, { recursive: true });
const logoSrc = `${RAW}/brand/devilkid-logo-black-cca711.png`;
const logo = sharp(await sharp(logoSrc).trim().toBuffer());
const logoMeta = await logo.metadata();
await logo.clone().resize({ width: 768 }).png({ compressionLevel: 9 }).toFile(`${PUB}/brand/logo-mask.png`);

// Filled silhouette: everything the outside background cannot reach.
{
  const W = 768;
  const { data, info } = await logo.clone().resize({ width: W }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const H = info.height;
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = data[i * 4 + 3] > 127 ? 1 : 0;
  const outside = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (outside[i] || solid[i]) return;
    outside[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W, y = (i / W) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) out[i * 4 + 3] = outside[i] ? 0 : 255;
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .blur(0.6)
    .png({ compressionLevel: 9 })
    .toFile(`${PUB}/brand/logo-silhouette.png`);
  media['brand/logo'] = { src: 'brand/logo-mask', w: W, h: H, sizes: [W], alpha: true };
}

const tile = `${RAW}/brand/web-logo-icon-3-f8e16a.png`;
await sharp(tile).resize(32).png().toFile(`${PUB}/favicon-32.png`);
await sharp(tile).resize(180).png().toFile(`${PUB}/apple-touch-icon.png`);
await sharp(tile).resize(512).png().toFile(`${PUB}/icon-512.png`);
await sharp(`${RAW}/brand/web-icon-21-2396e3.png`).flatten({ background: '#1a1a1a' }).jpeg({ quality: 88 }).toFile(`${PUB}/og.jpg`);

// --- Dock icons (his own work, cropped square) ----------------------------
await mkdir(`${PUB}/ui`, { recursive: true });
const icon = async (name, input, { trim = false, fit = 'cover', pad = 0, extract, bg = '#ffffff' } = {}) => {
  let img = sharp(input);
  if (extract) img = img.extract(extract);
  if (trim) img = sharp(await img.flatten({ background: bg }).trim().toBuffer());
  const inner = 192 - pad * 2;
  const body = await img.flatten({ background: bg }).resize(inner, inner, { fit, background: bg }).toBuffer();
  await sharp({ create: { width: 192, height: 192, channels: 3, background: bg } })
    .composite([{ input: body, left: pad, top: pad }])
    .webp({ quality: 86 })
    .toFile(`${PUB}/ui/dock-${name}.webp`);
};
await icon('fashion', `${RAW}/fashion/chrome-52558d.png`, { trim: true, fit: 'contain', pad: 14 });
await icon('art', `${RAW}/art/1-999b6e.png`, { extract: { left: 180, top: 240, width: 1100, height: 1100 } });
await icon('visuals', `${RAW}/yt/wwR4XaDXatw.jpg`, { extract: { left: 280, top: 0, width: 720, height: 720 }, bg: '#000000' });
await icon('type', `${RAW}/typography/23-bf841e.png`, { trim: true, fit: 'contain', pad: 16 });
await icon('about', `${RAW}/aboutme/devil-kid-pp-3c2efe.webp`, { extract: { left: 186, top: 40, width: 700, height: 700 }, bg: '#000000' });

// --- UI textures -----------------------------------------------------------
// Brushed metal: horizontal streaks, tileable in both directions.
{
  const W = 512, H = 256, K = 12;
  const px = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++) {
    const ctrl = Array.from({ length: K }, () => Math.random());
    const rowBias = (Math.random() - 0.5) * 0.5;
    for (let x = 0; x < W; x++) {
      const t = (x / W) * K;
      const i = Math.floor(t), f = t - i;
      const s = (1 - Math.cos(f * Math.PI)) / 2;
      const v = ctrl[i % K] * (1 - s) + ctrl[(i + 1) % K] * s;
      const grain = (Math.random() - 0.5) * 0.18;
      px[y * W + x] = Math.max(0, Math.min(255, 128 + (v - 0.5 + rowBias + grain) * 120));
    }
  }
  await sharp(px, { raw: { width: W, height: H, channels: 1 } }).webp({ quality: 70 }).toFile(`${PUB}/ui/brushed.webp`);
}

// Monogram wallpaper: the devil mark in a half-drop repeat, like a lining print.
{
  const T = 240, L = 92;
  const lh = Math.round((L * logoMeta.height) / logoMeta.width);
  const mark = await logo
    .clone()
    .resize({ width: L })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < mark.data.length; i += 4) mark.data[i] = mark.data[i + 1] = mark.data[i + 2] = 255;
  const markPng = await sharp(mark.data, { raw: mark.info }).png().toBuffer();
  const star = (s) =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="-10 -10 20 20"><path fill="#fff" d="M0-10Q.9-.9 10 0 .9.9 0 10-.9.9-10 0-.9-.9 0-10Z"/></svg>`,
    );
  const off = (T / 2 - L) / 2;
  const offY = (T / 2 - lh) / 2;
  await sharp({ create: { width: T, height: T, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: markPng, left: Math.round(off), top: Math.round(offY) },
      { input: markPng, left: Math.round(T / 2 + off), top: Math.round(T / 2 + offY) },
      { input: star(22), left: Math.round(T * 0.75 - 11), top: Math.round(T * 0.25 - 11) },
      { input: star(22), left: Math.round(T * 0.25 - 11), top: Math.round(T * 0.75 - 11) },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${PUB}/ui/monogram.png`);
}

await mkdir('src/data', { recursive: true });
await writeFile('src/data/media.json', JSON.stringify(media, null, 1));
console.log(`media entries: ${Object.keys(media).length}`);
