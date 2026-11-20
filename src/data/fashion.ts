// Fashion archive. Order follows the old site. Titles come from the original
// file names (or from lettering visible on the garment); edit freely.
import type { Lang } from '../lib/paths';

export type Category = 'outerwear' | 'tops' | 'footwear' | 'more';
type Text = Record<Lang, string>;

export interface View {
  file: string;
  label: Text;
  swatch?: string;
}

export interface Piece {
  title: string;
  category: Category;
  /** sides: front/back flip · colorways: swatches · series: several designs · single */
  kind: 'sides' | 'colorways' | 'series' | 'single';
  client?: string;
  views: View[];
}

const front: Text = { en: 'Front', es: 'Frente' };
const back: Text = { en: 'Back', es: 'Espalda' };
const sides = (f: string, b: string): View[] => [
  { file: f, label: front },
  { file: b, label: back },
];
const same = (s: string): Text => ({ en: s, es: s });

export const pieces: Piece[] = [
  { title: 'La K Hoodie', category: 'outerwear', kind: 'single', views: [{ file: 'la-k-hoodie-5036d9.webp', label: front }] },
  { title: 'La K Tee', category: 'tops', kind: 'single', views: [{ file: 'la-ka-tshirt-5a1177.webp', label: front }] },
  { title: 'Ferrari Hoodie', category: 'outerwear', kind: 'sides', views: sides('ferrari-hoodie-front-bf76d7.webp', 'ferrari-hoodie-back-0626cc.webp') },
  { title: 'Miniso x DK', category: 'more', kind: 'sides', views: sides('miniso-x-dk-front-b2fea6.webp', 'miniso-x-dk-front-back-816bf6.webp') },
  { title: '91 Rodman', category: 'tops', kind: 'sides', views: sides('91-rodman-front-c803c0.webp', '91-rodman-back-573dbf.webp') },
  { title: 'Colombia x Devil Kid — 11', category: 'tops', kind: 'sides', views: sides('colombia-x-devilkid-front-ba499f.webp', 'colombia-x-devilkid-back-ba499f.webp') },
  { title: 'Colombia x Devil Kid — 10', category: 'tops', kind: 'sides', views: sides('colombia-x-devilkid-front-2-61fde9.webp', 'colombia-x-devilkid-back-2-8f5108.webp') },
  { title: 'Colombia x Devil Kid — 2', category: 'tops', kind: 'sides', views: sides('colombia-x-devilkid-front-3-33398e.webp', 'colombia-x-devilkid-back-3-902fcb.webp') },
  { title: 'Stillz Hoodie', category: 'outerwear', kind: 'sides', views: sides('stillz-hoodie-front-14da66.webp', 'stillz-hoodie-back-7b2232.webp') },
  {
    title: 'Low-Top Sneaker',
    category: 'footwear',
    kind: 'colorways',
    views: [
      { file: 'devil-kid-edition-c36a23.webp', label: same('Devil Kid Edition'), swatch: '#e0a21b' },
      { file: 'loyal-1da4c9.webp', label: same('Loyal'), swatch: '#2f5a45' },
      { file: 'lemon-vibes-1da4c9.webp', label: same('Lemon Vibes'), swatch: '#7fae1f' },
      { file: 'sky-blue-220865.webp', label: same('Sky Blue'), swatch: '#3f87d9' },
      { file: 'jazz-1da4c9.webp', label: same('Jazz'), swatch: '#5b3fb0' },
      { file: 'iverson-1da4c9.webp', label: same('Iverson'), swatch: '#15171c' },
    ],
  },
  { title: 'Saco FITV', category: 'outerwear', kind: 'sides', views: sides('saco-fitv-e8a71e.webp', 'saco-fitv-back-e8a71e.webp') },
  { title: 'Camisa Azul', category: 'tops', kind: 'sides', client: 'Lugó Lugó', views: sides('camisa-azul-lugo-lugo-front-582841.webp', 'camisa-azul-lugo-lugo-back-582841.webp') },
  {
    title: 'Rodman x Jordan',
    category: 'tops',
    kind: 'series',
    views: [
      { file: 'rodman-x-jordan-tshirt-portfolio-038fa1.webp', label: { en: 'Sleeveless', es: 'Sin mangas' } },
      { file: 'rodman-x-jordan-tshirt-2-portfolio-038fa1.webp', label: { en: 'Tee', es: 'Camiseta' } },
    ],
  },
  { title: 'FITV Official Hoodie', category: 'outerwear', kind: 'sides', views: sides('mockup-hoodie-fitv-official-front-33cb9f.png', 'mockup-hoodie-fitv-official-back-ab144f.png') },
  { title: 'Abrigo', category: 'outerwear', kind: 'sides', views: sides('abrigo-front-portfolio-bcffed.png', 'abrigo-back-portfolio-2060b6.png') },
  {
    title: 'Runner',
    category: 'footwear',
    kind: 'colorways',
    views: [
      { file: 'chrome-52558d.png', label: same('Chrome'), swatch: '#c9ccd1' },
      { file: 'gris-52558d.png', label: same('Gris'), swatch: '#8f96a3' },
      { file: 'negro-fc0ad4.png', label: same('Negro'), swatch: '#2a2620' },
      { file: 'rojo-fc0ad4.png', label: same('Rojo'), swatch: '#c8321e' },
      { file: 'naranja-fc0ad4.png', label: same('Naranja'), swatch: '#c9712a' },
      { file: 'tropical-69618c.png', label: same('Tropical'), swatch: '#7a8a2a' },
      { file: 'amarillo-fec236.png', label: same('Amarillo'), swatch: '#c9a81e' },
      { file: 'azul-52558d.png', label: same('Azul'), swatch: '#1f4fd0' },
    ],
  },
  { title: 'Leather Jacket', category: 'outerwear', kind: 'sides', views: sides('jacket-front-73d191.png', 'jacket-back-b48627.png') },
  { title: 'Devil Shirt', category: 'tops', kind: 'sides', views: sides('devil-shirt-design-front-70c8c3.png', 'devil-shirt-design-back-70c8c3.png') },
  { title: 'White Dead Hoodie', category: 'outerwear', kind: 'sides', views: sides('16-8c940e.png', '162-8c8ef7.png') },
  { title: 'Texana 01', category: 'footwear', kind: 'single', views: [{ file: 'texana-1-08f09e.png', label: same('Texana 01') }] },
  { title: 'Western Jacket', category: 'outerwear', kind: 'single', views: [{ file: 'western-jacket-back-73d191.png', label: back }] },
  {
    title: 'Bolso',
    category: 'more',
    kind: 'colorways',
    views: [
      { file: 'bolso-1-4336d6.png', label: { en: 'Cream', es: 'Crema' }, swatch: '#e8dccb' },
      { file: 'bolso-2-b2f5f7.png', label: { en: 'Tan', es: 'Miel' }, swatch: '#a8642f' },
      { file: 'bolso-3-b2f5f7.png', label: { en: 'Black', es: 'Negro' }, swatch: '#1c1c1e' },
    ],
  },
  {
    title: 'Texana Star',
    category: 'footwear',
    kind: 'colorways',
    views: [
      { file: 'texana-5-17b1a3.png', label: { en: 'Black / Silver', es: 'Negro / Plata' }, swatch: '#1b1b1d' },
      { file: 'texana-2-08f09e.png', label: { en: 'Olive', es: 'Oliva' }, swatch: '#4f5a3a' },
      { file: 'texana-3-08f09e.png', label: { en: 'Burgundy', es: 'Vinotinto' }, swatch: '#5a1f2a' },
      { file: 'texana-4-08f09e.png', label: { en: 'Silver', es: 'Plata' }, swatch: '#8d8f94' },
    ],
  },
  { title: 'White Jacket', category: 'outerwear', kind: 'sides', views: sides('white-jacket-front-c639be.png', 'white-jacket-back-c639be.png') },
  { title: 'Cowboy Jean', category: 'more', kind: 'single', views: [{ file: 'cowboy-jean-70c8c3.png', label: front }] },
  {
    title: 'Hand Bag',
    category: 'more',
    kind: 'colorways',
    views: [
      { file: 'hand-bag-1-43f227.png', label: { en: 'Cream', es: 'Crema' }, swatch: '#e8dccb' },
      { file: 'hand-bag-2-b0d657.png', label: { en: 'Tan', es: 'Miel' }, swatch: '#b5773c' },
      { file: 'hand-bag-3-b0d657.png', label: { en: 'Black', es: 'Negro' }, swatch: '#1c1c1e' },
    ],
  },
  { title: 'Tee 14', category: 'tops', kind: 'single', views: [{ file: '14-ae2c0c.png', label: front }] },
  { title: 'Graduation Tee', category: 'tops', kind: 'single', views: [{ file: '15-8c8ef7.png', label: front }] },
  { title: 'Flashback Hoodie', category: 'outerwear', kind: 'single', client: 'Flash Back', views: [{ file: 'flashback-345225.png', label: front }] },
  { title: 'DLRM Hoodie', category: 'outerwear', kind: 'single', client: 'Delirium', views: [{ file: 'dlrm-hoodie-345225.png', label: back }] },
  {
    title: 'DLRM Tee Series',
    category: 'tops',
    kind: 'series',
    client: 'Delirium',
    views: ['1-888848', '2-883dbb', '3-9d3aed', '4-d807a6', '5-e6aed5', '6-cf72fa', '7-8f2ad9', '8-c12df5'].map((f, i) => ({
      file: `${f}.png`,
      label: same(`0${i + 1}`),
    })),
  },
  { title: 'Donda Hoodie', category: 'outerwear', kind: 'sides', views: sides('donda-hoodie-front-035624.png', 'donda-hoodie-back-0549b4.png') },
  { title: 'Wonderful World Tee', category: 'tops', kind: 'single', views: [{ file: '9-b82112.png', label: front }] },
  { title: 'Get Rich or Die Trying I', category: 'tops', kind: 'single', views: [{ file: '10-1d646c.png', label: front }] },
  { title: 'Get Rich or Die Trying II', category: 'tops', kind: 'single', views: [{ file: '11-2f4f77.png', label: front }] },
  { title: 'Tee 12', category: 'tops', kind: 'single', views: [{ file: '12-053ac2.png', label: front }] },
  { title: 'Tee 13', category: 'tops', kind: 'single', views: [{ file: '13-2304c0.png', label: front }] },
];
