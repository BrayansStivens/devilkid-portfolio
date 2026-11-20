export const site = {
  name: 'Devil Kid',
  person: 'Juan José Díaz',
  roles: ['Fashion Designer', 'Graphic Designer', 'Illustrator', '3D Artist'],
  location: 'Bello, Antioquia — Colombia',
  email: 'jdiazosorio31@gmail.com',
  whatsapp: '573246870016',
  whatsappDisplay: '+57 324 687 0016',
  reel: { vimeoId: '1143666685', seconds: 64 },
  socials: [
    { id: 'instagram', mark: 'IG', label: 'Instagram', handle: '@___devilkid', href: 'https://www.instagram.com/___devilkid' },
    { id: 'x', mark: 'X', label: 'X', handle: '@devilkid___', href: 'https://x.com/devilkid___' },
    { id: 'behance', mark: 'Be', label: 'Behance', handle: 'devilkid', href: 'https://www.behance.net/devilkid' },
    { id: 'artstation', mark: 'AS', label: 'ArtStation', handle: 'juan_xo', href: 'https://www.artstation.com/juan_xo' },
    { id: 'youtube', mark: 'YT', label: 'YouTube', handle: '@devilkid_artist', href: 'https://www.youtube.com/@devilkid_artist' },
    { id: 'linkedin', mark: 'in', label: 'LinkedIn', handle: 'devilkid', href: 'https://www.linkedin.com/in/devilkid' },
  ],
} as const;

export const waLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
export const mailLink = (subject: string, body = '') =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;

/** Which profile each section sends people to for more of that kind of work. */
const follow = { fashion: 'instagram', art: 'artstation', visuals: 'youtube', typography: 'behance' } as const;
export const followFor = (section: keyof typeof follow) => site.socials.find((x) => x.id === follow[section])!;

export const sections = ['fashion', 'art', 'visuals', 'typography', 'aboutme'] as const;
export type SectionId = (typeof sections)[number];
