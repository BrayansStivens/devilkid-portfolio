// Pulls the page data and original images from the current Portfoliobox site
// into raw/site/ (gitignored). Run once; re-running skips files already on disk.
//   node scripts/fetch-site.mjs
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';

const ORIGIN = 'https://www.devilkid.net';
const OUT = path.resolve('raw/site');

function extractCall(html, marker) {
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`marker not found: ${marker}`);
  let i = start + marker.length;
  const from = i;
  let depth = 0, inStr = false, esc = false;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return JSON.parse(html.slice(from, i));
}

async function exists(p) {
  try { return (await stat(p)).size > 0; } catch { return false; }
}

async function download(url, dest) {
  if (await exists(dest)) return 'skip';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return 'ok';
}

const html = await (await fetch(`${ORIGIN}/fashion`)).text();
const pages = extractCall(html, 'pages.actions.init.serverPages(');
const site = extractCall(html, 'site.actions.init.site(');

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'pages.json'), JSON.stringify(pages, null, 2));
await writeFile(path.join(OUT, 'site.json'), JSON.stringify(site, null, 2));

const jobs = [];
const manifest = {};
for (const page of pages) {
  const section = page.Url.replace('/', '');
  for (const s of page.Sections ?? []) {
    const items = s.ElementsFixed?.Items1?.Content;
    if (Array.isArray(items)) {
      manifest[section] = items.map((it, idx) => {
        const c = it.Content;
        const file = path.basename(new URL(c.Src).pathname);
        jobs.push({ url: c.Src, dest: path.join(OUT, section, file) });
        return {
          idx,
          file,
          width: c.Width,
          height: c.Height,
          link: c.Link || null,
          embed: c.IFrameSrc || null,
        };
      });
    }
    for (const el of s.ElementsTop ?? []) {
      const src = el?.Content?.Src;
      if (typeof src === 'string' && src.includes('cloudfront')) {
        const file = path.basename(new URL(src).pathname);
        jobs.push({ url: src, dest: path.join(OUT, section, file) });
      }
    }
  }
}

const siteUrls = new Set(
  JSON.stringify(site).match(/https?:[^"\\]+?\.(?:png|webp|jpe?g|svg|gif)/g) ?? [],
);
for (const url of siteUrls) {
  jobs.push({ url, dest: path.join(OUT, 'brand', path.basename(new URL(url).pathname)) });
}

await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

let done = 0, failed = 0;
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      try {
        await download(job.url, job.dest);
        done++;
      } catch (err) {
        failed++;
        console.error('FAIL', err.message);
      }
    }
  }),
);
console.log(`files: ${done}/${jobs.length} ok, ${failed} failed`);
for (const [k, v] of Object.entries(manifest)) console.log(k, v.length);

// Video posters: YouTube visualizers + the Vimeo reel used on the old cover.
const ytJobs = (manifest.visuals ?? []).map((v) => {
  const id = v.embed?.split('/embed/')[1];
  return { id, dest: path.join(OUT, 'yt', `${id}.jpg`) };
});
let yt = 0;
for (const { id, dest } of ytJobs) {
  for (const name of ['maxresdefault', 'sddefault', 'hqdefault']) {
    try {
      await download(`https://i.ytimg.com/vi/${id}/${name}.jpg`, dest);
      yt++;
      break;
    } catch { /* try the next size */ }
  }
}
console.log(`youtube posters: ${yt}/${ytJobs.length}`);

const cover = pages.find((p) => p.Url === '/home')?.Sections?.[0]?.ElementsFixed?.SingleImageBg1?.Content;
if (cover?.Src) {
  const big = cover.Src.replace(/_\d+x\d+/, '_1280x720');
  await download(big, path.join(OUT, 'reel', 'poster.jpg')).catch((e) => console.error('reel', e.message));
}
