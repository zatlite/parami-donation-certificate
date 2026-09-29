<script>
  import "@fontsource/eb-garamond/400.css";
  import "@fontsource/eb-garamond/500.css";
  import "@fontsource/eb-garamond/600.css";
  import "@fontsource/eb-garamond/700.css";
  import "@fontsource/padauk/400.css";
  import "@fontsource/padauk/700.css";
  import { CONTENT } from "$lib/certificate-content.js";
  import fancyBorder from "$lib/assets/fancy-border.js";
  import lotus from "$lib/assets/lotus.js";
  import { formatCertDate } from "$lib/date.js";
  import { onMount } from "svelte";

  let {
    form,
    lang = "en",
    node = $bindable(),
    logoLeft = null,
    logoRight = null,
    signature = null,
  } = $props();

  let c = $derived(CONTENT[lang] ?? CONTENT.en);

  let bodyEl = $state(null);
  const BASE_BODY_FS = 26;
  const MIN_BODY_FS = 13;
  // Keep the footer clear of the frame's bottom edge (> bottom border thickness).
  // `.cert-border` padding-bottom is SAFE_BOTTOM; the small buffer avoids treating the
  // pinned (margin-top:auto) footer sitting at the padding edge as an overflow.
  const SAFE_BOTTOM = 80;
  const FIT_LIMIT = 1123 - SAFE_BOTTOM + 4;

  // Shrink the body prose only while doing so actually lifts the footer toward the border.
  function fitBody() {
    if (!node || !bodyEl) return;
    const quotes = node.querySelector(".c-quotes");
    if (!quotes) return;
    // offsetTop/offsetHeight are layout px (unaffected by the preview transform).
    const footerBottom = () => quotes.offsetTop + quotes.offsetHeight;
    let fs = BASE_BODY_FS;
    bodyEl.style.fontSize = fs + "px";
    let prev = footerBottom();
    while (fs > MIN_BODY_FS && prev > FIT_LIMIT) {
      fs -= 1;
      bodyEl.style.fontSize = fs + "px";
      const now = footerBottom();
      if (now >= prev) break; // footer is pinned by margin-top:auto; shrinking won't help
      prev = now;
    }
  }

  $effect(() => {
    // Re-fit whenever the entered values, language, or signature change.
    void (form.name,
    form.address,
    form.towards,
    form.amount,
    form.date,
    form.customBody,
    lang,
    signature);
    fitBody();
  });

  onMount(() => {
    // Fonts can finish loading after the first measurement; re-fit once they're ready.
    if (
      typeof document !== "undefined" &&
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(fitBody);
    }
  });
</script>

<div class="cert-frame lang-{lang}" bind:this={node}>
  <img class="cert-frame-border" src={fancyBorder} alt="" aria-hidden="true" />
  <img class="c-lotus" src={lotus} alt="" aria-hidden="true" />
  <div class="cert-border">
    <header class="c-head">
      {#if logoLeft}
        <img class="c-logo c-logo-img" src={logoLeft} alt="" />
      {:else}
        <div class="c-logo" aria-hidden="true">{c.logoLabels[0]}</div>
      {/if}
      <div class="c-head-mid">
        <h1 class="c-temple">{c.templeName}</h1>
        <p class="c-address">{c.address}</p>
      </div>
      {#if logoRight}
        <img class="c-logo c-logo-img" src={logoRight} alt="" />
      {:else}
        <div class="c-logo" aria-hidden="true">{c.logoLabels[1]}</div>
      {/if}
    </header>

    <div class="c-title-wrap">
      <h2 class="c-title">{c.title}</h2>
    </div>

    <div class="c-date">
      <span class="c-date-label">{c.labels.date}</span>
      <span class="c-date-value">{formatCertDate(form.date, lang)}</span>
    </div>

    <p class="c-body" class:c-body-custom={form.customBody} bind:this={bodyEl}>
      {#if form.customBody}{form.customBody}{:else}{#each c.body as seg}{#if seg.field}<span
              class="c-fill"
              >{form[seg.field] || "\u00A0\u00A0\u00A0\u00A0"}</span
            >{:else}{seg.text}{/if}{/each}{/if}
    </p>

    <div class="c-sign">
      {#if signature}
        <img class="c-sign-img" src={signature} alt="Signature" />
      {/if}
      <div class="c-sign-line"></div>
      <p class="c-sign-name">{c.signatures[0]}</p>
      <p class="c-sign-name">{c.signatures[1]}</p>
    </div>

    <footer class="c-quotes">
      <p>{c.quotes[0]}</p>
      <p class="c-quote-small">{c.quotes[1]}</p>
    </footer>
  </div>
</div>

<style>
  .cert-frame {
    position: relative;
    width: 794px;
    height: 1123px;
    background: #ffffff;
    color: #1a1a1a;
    overflow: hidden;
  }

  .cert-frame-border {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
  }

  .c-lotus {
    position: absolute;
    left: 50%;
    top: 56%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: auto;
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
  }

  .cert-frame.lang-en {
    font-family: "EB Garamond", Georgia, "Times New Roman", serif;
  }

  .cert-frame.lang-my {
    font-family: "Padauk", "EB Garamond", sans-serif;
    line-height: 1.9;
  }

  .cert-border {
    position: relative;
    z-index: 1;
    height: 100%;
    box-sizing: border-box;
    padding: 72px 68px 80px;
    display: flex;
    flex-direction: column;
  }

  .c-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .c-logo {
    flex: 0 0 120px;
    width: 120px;
    height: 120px;
    border: 2px dashed #b8860b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b8860b;
    font-size: 13px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .c-logo-img {
    border: none;
    border-radius: 0;
    object-fit: contain;
    background: transparent;
  }

  .c-head-mid {
    flex: 1 1 auto;
    text-align: center;
  }

  .c-temple {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #7c2d12;
    line-height: 1.3;
  }

  .lang-my .c-temple {
    font-size: 34px;
  }

  .c-address {
    margin: 6px 0 0;
    font-size: 14px;
    color: #444;
  }

  .c-date {
    align-self: flex-end;
    text-align: right;
    margin: 0 0 30px;
    font-size: 18px;
  }

  .c-date-label {
    font-weight: 600;
    color: #333;
  }

  .c-date-value {
    padding: 0 4px 2px;
  }

  .c-title-wrap {
    text-align: center;
    margin: 16px 0 14px;
  }

  .c-title {
    display: inline-block;
    margin: 0;
    font-size: 27px;
    font-weight: 700;
    color: #7c2d12;
    padding: 8px 20px;
    border-top: 2px solid #b8860b;
    border-bottom: 2px solid #b8860b;
    line-height: 1.5;
  }

  .c-body {
    margin: 8px 0 0;
    font-size: 26px;
    line-height: 1.75;
    text-align: center;
    text-wrap: pretty;
  }

  .c-body-custom {
    white-space: pre-wrap;
  }

  .c-fill {
    font-weight: 700;
    color: #1f1fbc;
    -webkit-text-stroke: 0.5px #b8860b;
    word-break: break-word;
  }

  .c-sign {
    margin-top: auto;
    padding-top: 40px;
    align-self: flex-end;
    text-align: center;
    width: 260px;
  }

  .c-sign-img {
    display: block;
    max-width: 100%;
    height: 64px;
    object-fit: contain;
    margin: 0 auto -6px;
  }

  .c-sign-line {
    border-top: 1px solid #333;
    margin-bottom: 8px;
  }

  .c-sign-name {
    margin: 2px 0;
    font-size: 18px;
    color: #333;
  }

  .c-quotes {
    margin-top: 26px;
    padding-top: 16px;
    border-top: 1px solid #e0d6c3;
    text-align: center;
    color: #6b4423;
  }

  .c-quotes p {
    margin: 8px 0;
    font-size: 15px;
    font-weight: 700;
    font-style: italic;
  }

  .lang-my .c-quotes p {
    font-style: normal;
  }

  .c-quote-small {
    font-size: 14px !important;
  }
</style>
