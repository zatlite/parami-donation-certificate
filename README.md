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

## Adding the two logos

The header shows two dashed **placeholder** circles by default. To use real logos:

1. Drop the images into the `static/` folder, e.g. `static/logo-left.png` and
   `static/logo-right.png` (files in `static/` are served from the site root).
2. Pass them to the certificate in `src/routes/+page.svelte`:

   ```svelte
   <Certificate
     {form}
     {lang}
     bind:node={certNode}
     logoLeft="/logo-left.png"
     logoRight="/logo-right.png"
   />
   ```

Keeping the logos in `static/` (same origin) ensures html-to-image can include them in
the exported image and PDF.

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
