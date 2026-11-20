// Bio and CV content. English copy is his own from the old site; Spanish from his CV.
import type { Lang } from '../lib/paths';
type Text = Record<Lang, string>;

export const bio: Text = {
  en: 'My name is Juan Diaz, or Devil Kid online. Multidisciplinary creative with over 6 years of experience in Graphic Design (agency and freelance) and Strategic Branding. Expert in visual conceptualization, from Concept Art to 3D modeling. I complement my profile with 1 year of experience as Creative Director and Fashion Designer for emerging brands, leading product vision and brand identity from scratch.',
  es: 'Mi nombre es Juan Díaz, o Devil Kid en línea. Creativo multidisciplinario con más de 6 años de experiencia en Diseño Gráfico (agencia y freelance) y Branding estratégico. Experto en conceptualización visual, desde Arte Conceptual hasta modelado 3D. Complemento mi perfil técnico con 1 año de experiencia como Director Creativo y Diseñador de Moda en marcas emergentes, liderando la visión de producto y la identidad de marca desde cero.',
};

export const clients: { name: string; what: Text }[] = [
  { name: 'Lugó Lugó', what: { en: 'Fashion Brand', es: 'Marca de moda' } },
  { name: 'Ryan Castro / AWOO Team', what: { en: 'Singer', es: 'Cantante' } },
  { name: 'Auto Real Dream', what: { en: 'Drift Team & Clothing Brand', es: 'Equipo de drift y marca de ropa' } },
  { name: 'Dave', what: { en: 'Videographer and Director at AWOOTeam | SauceBoyz', es: 'Videógrafo y director en AWOOTeam | SauceBoyz' } },
  { name: 'Sebastian Rodriguez', what: { en: 'ERA Pictures Cars', es: 'ERA Pictures Cars' } },
  { name: 'Whiteboyem', what: { en: 'Content Creator', es: 'Creador de contenido' } },
  { name: 'Paper Crowns', what: { en: 'Design Agency', es: 'Agencia de diseño' } },
  { name: 'OTF Gaming', what: { en: 'eSport Team', es: 'Equipo de eSports' } },
  { name: 'Soniqs eSports', what: { en: 'eSport Team', es: 'Equipo de eSports' } },
  { name: 'Horizon Union', what: { en: 'eSport Team', es: 'Equipo de eSports' } },
  { name: 'Delirium', what: { en: 'eSport Team', es: 'Equipo de eSports' } },
  { name: 'Flash Back', what: { en: 'Clothing Brand', es: 'Marca de ropa' } },
  { name: 'Theory Nine', what: { en: 'Clothing Brand', es: 'Marca de ropa' } },
  { name: 'Roan', what: { en: 'Founder, Overtime Gaming', es: 'Fundador, Overtime Gaming' } },
  { name: 'Cyborg', what: { en: 'Content Creator', es: 'Creador de contenido' } },
  { name: 'ChrisTDickson', what: { en: 'Content Creator', es: 'Creador de contenido' } },
  { name: 'Koi', what: { en: 'Content Producer & Editor', es: 'Productor y editor de contenido' } },
  { name: 'The Truth Experiment', what: { en: 'Musician', es: 'Músico' } },
  { name: 'Cult Vega', what: { en: 'Director & Post Production', es: 'Director y posproducción' } },
  { name: 'VALACY', what: { en: 'Clothing Brand', es: 'Marca de ropa' } },
  { name: 'Axyzera', what: { en: 'Clothing Brand', es: 'Marca de ropa' } },
];

export const experience: { org: string; when: Text; what: Text }[] = [
  {
    org: 'Lugó Lugó',
    when: { en: 'Mar 2026 — Present', es: 'Mar 2026 — Actualidad' },
    what: {
      en: 'Concept and design of garments, patterns, textures and textile graphics. Social media design.',
      es: 'Conceptualización y diseño de prendas, patrones, texturas y gráficos para textiles. Diseño para redes sociales.',
    },
  },
  {
    org: 'Cueros Vélez',
    when: { en: 'Jun — Dec 2025', es: 'Jun — Dic 2025' },
    what: {
      en: 'Design, adaptation and creation of typefaces for laser marking on premium leather goods.',
      es: 'Diseño, manipulación y creación de tipografías para marcación a láser de productos de alta calidad en cuero.',
    },
  },
  {
    org: 'Paper Crowns',
    when: { en: 'Feb 2021 — Sep 2023', es: 'Feb 2021 — Sep 2023' },
    what: {
      en: 'Independent professional. Illustration, logos, typography and motion graphics for companies such as Astro Gaming, Coca-Cola and Stermy.',
      es: 'Profesional independiente. Ilustraciones, logos, tipografías y motion graphics para empresas como Astro Gaming, Coca-Cola y Stermy.',
    },
  },
  {
    org: 'Soniqs Esports',
    when: { en: 'Aug — Sep 2021', es: 'Ago — Sep 2021' },
    what: {
      en: 'Illustration and concept art for the international PUBG team.',
      es: 'Ilustración y arte conceptual para el equipo internacional de PUBG.',
    },
  },
  {
    org: 'Horizon Union LTD',
    when: { en: 'Jul — Oct 2020', es: 'Jul — Oct 2020' },
    what: {
      en: 'Lead for illustration and branding.',
      es: 'Encargado de la sección de ilustración y branding.',
    },
  },
];

export const education: { title: Text; school: string; when: string }[] = [
  { title: { en: 'Fashion Design', es: 'Diseño de Modas' }, school: 'CESDE', when: '2023 — 2025' },
  { title: { en: 'Graphic Design', es: 'Diseño Gráfico' }, school: 'CESDE', when: '2018 — 2020' },
];

/** Levels out of 5, as he rates them on his CV. */
export const software: { name: string; level: number }[] = [
  { name: 'Adobe Photoshop', level: 5 },
  { name: 'Adobe Illustrator', level: 5 },
  { name: 'Adobe Premiere', level: 3 },
  { name: 'Adobe After Effects', level: 3 },
  { name: 'Blender 3D', level: 3 },
  { name: 'Optitex', level: 2 },
];

export const strengths: Text[] = [
  { en: 'Strategic Branding', es: 'Branding estratégico' },
  { en: 'Illustration', es: 'Ilustración' },
  { en: 'Research', es: 'Investigación' },
  { en: 'Vision', es: 'Visión' },
  { en: 'Teamwork', es: 'Trabajo en equipo' },
];

export const languages: Text[] = [
  { en: 'Spanish — native', es: 'Español — nativo' },
  { en: 'English — conversational', es: 'Inglés — conversacional' },
];
