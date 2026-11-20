# Devil Kid — portfolio

Portfolio de Juan José Díaz (Devil Kid): moda, arte, visuales y tipografía.
Sitio estático en Astro, con el logo y los logotipos fundidos en cromo 3D (three.js).

## Uso

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # genera dist/
pnpm check      # tipos
```

## Dónde se edita el contenido

| Qué | Archivo |
| --- | --- |
| Prendas, nombres, colores, categorías | `src/data/fashion.ts` |
| Láminas, visualizers y logotipos | `src/data/work.ts` |
| Bio, clientes, experiencia, software | `src/data/about.ts` |
| Contacto y redes | `src/data/site.ts` |
| Textos de interfaz (EN / ES) | `src/i18n/ui.ts` |

Las rutas conservan las del sitio anterior (`/fashion`, `/art`, `/visuals`,
`/typography`, `/aboutme`); la versión en español vive bajo `/es/`.

## Imágenes

Los originales no se versionan. Para regenerar el set web:

```bash
pnpm media:fetch   # baja los originales del sitio anterior a raw/site
pnpm media:build   # genera public/media, íconos, texturas y src/data/media.json
```

Para añadir una pieza nueva: dejar el original en la carpeta correspondiente de
`raw/site/`, registrarlo en `raw/site/manifest.json`, correr `pnpm media:build`
y referenciarlo en el archivo de datos.

## Despliegue

`SITE_URL` y `SITE_BASE` controlan el dominio y la subruta. El workflow de
`.github/workflows/deploy.yml` publica en GitHub Pages; en su dominio propio
basta con `pnpm build` (sin `SITE_BASE`) y subir `dist/`.
