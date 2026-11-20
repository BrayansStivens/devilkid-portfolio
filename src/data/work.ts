// Art, Visuals and Typography. Same order as the old site.
import type { Lang } from '../lib/paths';
type Text = Record<Lang, string>;

/** Airbrush plates. `title` is only set when the lettering is in the piece itself. */
export const plates: { file: string; no: string; title?: string }[] = [
  { file: '8-225ec6.png', no: '08' },
  { file: '7-225ec6.png', no: '07', title: 'White Dead 2001' },
  { file: '6-225ec6.png', no: '06' },
  { file: '5-170588.png', no: '05', title: 'Devil Tunes' },
  { file: '4-170588.png', no: '04' },
  { file: '3-170588.png', no: '03', title: 'Auto Real Dream' },
  { file: '2-999b6e.png', no: '02' },
  { file: '1-999b6e.png', no: '01' },
];

/** Visualizers. Titles and dates as he wrote them on the old thumbnails. */
export const films: { id: string; title: string; date: Text; ratio: string }[] = [
  { id: 'GXZlyjH7jEs', title: 'AutoReal Dream Visualizer', date: { en: 'April 2025', es: 'Abril 2025' }, ratio: '4 / 3' },
  { id: 'pACHPcwUeJ8', title: 'Devil Kid Experimental Visualizer_1', date: { en: 'Jan. 2025', es: 'Ene. 2025' }, ratio: '9 / 16' },
  { id: 'kohSUIPgNK8', title: 'Devil Kid Experimental Visualizer_2', date: { en: 'Jan. 2025', es: 'Ene. 2025' }, ratio: '9 / 16' },
  { id: 'vI2O_K26R00', title: 'Medellín Visualizer', date: { en: 'Dec. 2024', es: 'Dic. 2024' }, ratio: '16 / 9' },
  { id: 'ckNZXd3eEZU', title: 'Mind Blow Visualizer', date: { en: 'Nov. 2024', es: 'Nov. 2024' }, ratio: '16 / 9' },
  { id: 'DKcGTcPMLR8', title: 'John John Freestyle Visualizer', date: { en: 'Nov. 2024', es: 'Nov. 2024' }, ratio: '16 / 9' },
  { id: 'wwR4XaDXatw', title: 'Kyoto Visualizer', date: { en: 'Oct. 2024', es: 'Oct. 2024' }, ratio: '16 / 9' },
  { id: 'U01MzOsXpak', title: 'Butterfly Effect Visualizer', date: { en: 'Oct. 2024', es: 'Oct. 2024' }, ratio: '16 / 9' },
  { id: 'ZgbT25WaWXg', title: 'Divine Pressure Visualizer', date: { en: 'Oct. 2024', es: 'Oct. 2024' }, ratio: '16 / 9' },
  { id: 'K8sBJoy42WY', title: "Praise D' Lord Visualizer", date: { en: 'Aug. 2024', es: 'Ago. 2024' }, ratio: '16 / 9' },
  { id: 'WgPi_yWl1z0', title: 'Yakuza Visualizer', date: { en: 'Aug. 2024', es: 'Ago. 2024' }, ratio: '16 / 9' },
  { id: '3ZfsxAN_CsA', title: 'Hola Demonio Visualizer', date: { en: 'Aug. 2024', es: 'Ago. 2024' }, ratio: '16 / 9' },
  { id: '3D35LghDKF8', title: 'Brightness Visualizer', date: { en: 'July 2024', es: 'Julio 2024' }, ratio: '16 / 9' },
  { id: 'Fy9emv9L2sc', title: 'Nightmares Visualizer', date: { en: 'July 2024', es: 'Julio 2024' }, ratio: '16 / 9' },
  { id: 'wSNZ3WHra54', title: 'Ego Visualizer', date: { en: 'July 2024', es: 'Julio 2024' }, ratio: '16 / 9' },
];

/** Logotypes. `client` + `href` are the links he had on the old site. */
export const marks: { file: string; client?: string; href?: string }[] = [
  { file: '41-0a308a.png', client: 'Auto Real Dream', href: 'https://www.instagram.com/autorealdream.us/' },
  { file: 'artboard-1-52f48e.png', client: 'Whiteboyem', href: 'https://www.instagram.com/whiteboyem/' },
  { file: '36-53f4d4.png', client: 'XPulse', href: 'https://www.instagram.com/xpulse.event' },
  { file: '40-416906.png', client: 'Obey Alliance', href: 'https://x.com/ObeyAlliance' },
  { file: '32-e9f0f9.png', client: 'Sanctus Hood', href: 'https://www.instagram.com/sanctushood/' },
  { file: '31-c97570.png', client: 'Axyzera', href: 'https://www.instagram.com/axyzera' },
  { file: '6-1c3254.png', client: 'Paper Crowns', href: 'https://papercrowns.com/' },
  { file: '5-1c3254.png', client: 'Stermy', href: 'https://stermy.com/' },
  { file: '37-178fe3.png', client: 'Noisy Butters', href: 'https://www.youtube.com/noisybutters' },
  { file: '4-1c3254.png', client: 'The Break Down', href: 'https://www.youtube.com/watch?v=gHFYYwKo7sU' },
  { file: '33-e9f0f9.png', client: 'Whiteboyem', href: 'https://www.instagram.com/whiteboyem/' },
  { file: '2-8b7f94.png' },
  { file: '34-e9f0f9.png', client: 'Whiteboyem', href: 'https://www.instagram.com/whiteboyem/' },
  { file: '16-406fca.png', client: 'Grilla', href: 'https://x.com/Grilla' },
  { file: '35-8260ec.png', client: 'Whiteboyem', href: 'https://www.instagram.com/whiteboyem/' },
  { file: '38-178fe3.png', client: 'Whiteboyem', href: 'https://www.instagram.com/whiteboyem/' },
  { file: '3-8b7f94.png', client: 'Theory Nine', href: 'https://www.instagram.com/theoryninee/' },
  { file: '13-433fbc.png', client: 'JokerD', href: 'https://www.twitch.tv/jokerdtv' },
  { file: '8-9391ae.png' },
  { file: '25-3c1e21.png', client: 'Delirium', href: 'https://x.com/DLRMTV' },
  { file: '23-bf841e.png' },
  { file: '9-9391ae.png' },
  { file: '1-bb7a30.png' },
  { file: '10-de4801.png' },
  { file: '12-a049fb.png' },
  { file: '20-12da06.png' },
  { file: '7-9391ae.png' },
  { file: '11-a73430.png' },
  { file: '19-8f130c.png' },
  { file: '14-433fbc.png' },
  { file: '24-3c1e21.png' },
  { file: '15-433fbc.png' },
  { file: '17-406fca.png' },
  { file: '27-5511b9.png' },
  { file: '29-c97570.png' },
  { file: '30-c97570.png' },
  { file: '22-bf841e.png' },
  { file: '18-406fca.png' },
  { file: '21-bf841e.png' },
  { file: '26-3c1e21.png' },
  { file: '28-5511b9.png' },
];
