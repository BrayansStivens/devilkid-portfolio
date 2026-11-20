// @ts-check
import { defineConfig } from 'astro/config';

// SITE_BASE lets the same build run under a sub-path (GitHub Pages preview)
// or at the root of his own domain.
const base = process.env.SITE_BASE ?? '/';
const site = process.env.SITE_URL ?? 'https://www.devilkid.net';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
