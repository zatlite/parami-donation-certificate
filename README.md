# Donation Acknowledgement Certificate

A Svelte **static site** for **Pāramī Santikara Vihāra Dhamma Centre** that generates a
_Certificate of Honor for Offering of The Four Requisites_ from a short form, then lets
you **export it as PNG or PDF** and **copy the image to the clipboard**.

Built with **SvelteKit** (`adapter-static`), **html-to-image**, and **jsPDF**.

> Rasterizing uses **html-to-image** (SVG `foreignObject` + embedded web fonts) rather
> than html2canvas, because html2canvas cannot shape complex scripts — Myanmar stacked
> consonants (e.g. `သန္တိ`, `ဓမ္မ`) break in its output. html-to-image uses the browser's
> native text rendering, so exports match the on-screen certificate exactly.

## Features

- Form fields: **Name, Address, Donation Towards, Amount** (plus **Date**, pre-filled
  with today's date).
- **Language toggle** — render the certificate **English-only** or **Burmese-only**.
  The fixed template text switches language; the values you type are shown as-is.
- Live certificate preview that scales to fit the screen.
- **Export PNG** and **Export PDF** (A4 portrait), and **Copy Image** to the clipboard.
- Self-hosted fonts so Burmese renders correctly in the browser _and_ in exports:
  [Padauk](https://fontsource.org/fonts/padauk) (Myanmar) and
  [EB Garamond](https://fontsource.org/fonts/eb-garamond) (English serif).
- Fully client-side — donor data never leaves the browser.

## Getting started

```sh
npm install
npm run dev        # start the dev server
npm run dev -- --open
```

## Build & preview (static output)

```sh
npm run build      # outputs a static site to ./build
npm run preview    # serve the production build locally
```

The `build/` directory is a plain static bundle and can be hosted on any static host
(GitHub Pages, Netlify, Cloudflare Pages, S3, nginx, etc.).

## Project structure

```
src/
  app.css                         Global styles / CSS variables
  routes/
    +layout.js                    prerender = true (static)
    +layout.svelte                Loads global CSS
    +page.svelte                  Page: form + preview + export buttons + state
  lib/
    certificate-content.js        Fixed EN/MY certificate text (from notes.md)
    export.js                     PNG / PDF / clipboard helpers
    components/
      CertificateForm.svelte      Inputs + language toggle
      Certificate.svelte          Certificate layout (EN & MY) + styling
notes.md                          Source content for the certificate template
```

## Logos

The two temple logos are included as **transparent-background SVGs** in
`src/lib/assets/` (`santikara-logo.svg`, `parami-logo.svg`) and are wired into the
certificate header — **Santikara** on the left, **Parami** on the right. Because their
backgrounds are transparent, they sit cleanly on any background colour.

They are imported and passed to the certificate in `src/routes/+page.svelte`:

```svelte
import santikaraLogo from '$lib/assets/santikara-logo.svg';
import paramiLogo from '$lib/assets/parami-logo.svg';
...
<Certificate
  {form}
  {lang}
  bind:node={certNode}
  logoLeft={santikaraLogo}
  logoRight={paramiLogo}
/>
```

To **swap sides**, exchange `logoLeft` / `logoRight`. To use **different artwork**,
replace the SVG (or PNG) files and update the imports. Keep the assets under `src/lib/`
(bundled, same-origin) so html-to-image can include them in the PNG/PDF exports.

> The SVGs were generated from the original JPEGs by removing the (border-connected)
> white background and embedding the result as a base64 PNG inside an SVG wrapper — the
> artwork looks identical but now has a transparent, any-background background.

## Editing the certificate text

All fixed wording lives in `src/lib/certificate-content.js`, split into `en` and `my`
objects (location, temple name, title, field labels, acknowledgement, signatures, and
footer quotes). Edit those strings to adjust the certificate.

## Browser notes

- **Copy Image** uses the async Clipboard API and requires a **secure context**
  (works on `localhost` and any `https://` site). It is best supported in
  **Chrome / Edge**; on unsupported browsers the app shows a friendly message and you
  can use **Export PNG** instead.
- PNG/PDF export works in all modern browsers.
