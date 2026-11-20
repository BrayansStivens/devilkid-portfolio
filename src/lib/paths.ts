import media from '../data/media.json';

export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Public file under the configured base. */
export const asset = (p: string) => `${BASE}/${p.replace(/^\//, '')}`;

/** Page URL for a language. Old-site slugs are kept so existing links survive. */
export const route = (lang: Lang, slug = '') => {
  const prefix = lang === 'es' ? '/es' : '';
  return `${BASE}${prefix}/${slug ? `${slug}/` : ''}`;
};

/** getStaticPaths entries shared by every page: `/…` and `/es/…`. */
export const langPaths = () => [
  { params: { lang: undefined }, props: { lang: 'en' as Lang } },
  { params: { lang: 'es' }, props: { lang: 'es' as Lang } },
];

type MediaEntry = { src: string; w: number; h: number; sizes: number[]; alpha: boolean };
const table = media as Record<string, MediaEntry>;

export function pic(key: string) {
  const m = table[key];
  if (!m) throw new Error(`media not found: ${key}`);
  const url = (w?: number) => {
    const size = w ? (m.sizes.find((s) => s >= w) ?? m.sizes[m.sizes.length - 1]) : m.sizes[m.sizes.length - 1];
    return asset(`${m.src}-${size}.webp`);
  };
  return {
    w: m.w,
    h: m.h,
    alpha: m.alpha,
    src: url(),
    url,
    srcset: m.sizes.map((s) => `${asset(`${m.src}-${s}.webp`)} ${s}w`).join(', '),
  };
}
