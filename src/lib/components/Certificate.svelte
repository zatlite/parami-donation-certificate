<script>
  import "@fontsource/eb-garamond/400.css";
  import "@fontsource/eb-garamond/500.css";
  import "@fontsource/eb-garamond/600.css";
  import "@fontsource/eb-garamond/700.css";
  import "@fontsource/padauk/400.css";
  import "@fontsource/padauk/700.css";
  import { CONTENT } from "$lib/certificate-content.js";
  import fancyBorder from "$lib/assets/fancy-border.js";

  let {
    form,
    lang = "en",
    node = $bindable(),
    logoLeft = null,
    logoRight = null,
  } = $props();

  let c = $derived(CONTENT[lang] ?? CONTENT.en);
</script>

{#snippet field(label, value, trailing = "")}
  <div class="c-field">
    {#if label}<span class="c-label">{label}</span>{/if}
    <span class="c-value">{value}</span>
    {#if trailing}<span class="c-particle">{trailing}</span>{/if}
  </div>
{/snippet}

<div class="cert-frame lang-{lang}" bind:this={node}>
  <img class="cert-frame-border" src={fancyBorder} alt="" aria-hidden="true" />
  <div class="cert-border">
    <!-- <header class="c-head"> -->
    <!--   <div class="c-head-mid"> -->
    <!--     <p class="c-location">{c.location}</p> -->
    <!--   </div> -->
    <!-- </header> -->
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

    <section class="c-fields">
      {#if lang === "my"}
        {@render field(c.labels.date, form.date)}
        {@render field(c.labels.name, form.name)}
        {@render field(c.labels.address, form.address, c.particles.from)}
        {@render field("", form.towards, c.particles.for)}
        {@render field(c.labels.amount, form.amount, c.particles.object)}
      {:else}
        {@render field(c.labels.date, form.date)}
        {@render field(c.labels.name, form.name)}
        {@render field(c.labels.address, form.address)}
        {@render field(c.labels.towards, form.towards)}
        {@render field(c.labels.amount, form.amount)}
      {/if}
    </section>

    <p class="c-ack">{c.acknowledgement}</p>

    <div class="c-sign">
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
    padding: 62px 66px;
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

  .c-location {
    margin: 0 0 4px;
    font-size: 15px;
    color: #444;
  }

  .c-temple {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #7c2d12;
    line-height: 1.3;
  }

  .c-address {
    margin: 6px 0 0;
    font-size: 14px;
    color: #444;
  }

  .c-title-wrap {
    text-align: center;
    margin: 26px 0 22px;
  }

  .c-title {
    display: inline-block;
    margin: 0;
    font-size: 21px;
    font-weight: 700;
    color: #1a1a1a;
    padding: 8px 20px;
    border-top: 2px solid #b8860b;
    border-bottom: 2px solid #b8860b;
    line-height: 1.5;
  }

  .c-fields {
    margin: 8px 0 18px;
  }

  .c-field {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 14px 0;
    font-size: 17px;
  }

  .c-label {
    font-weight: 600;
    white-space: nowrap;
    color: #333;
  }

  .c-value {
    flex: 1 1 auto;
    min-height: 1.4em;
    padding: 0 6px 2px;
    border-bottom: 1px dotted #777;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .c-particle {
    white-space: nowrap;
    color: #333;
  }

  .c-ack {
    margin: 6px 0 0;
    font-size: 16px;
    text-align: center;
    line-height: 1.7;
  }

  .c-sign {
    margin-top: auto;
    padding-top: 40px;
    align-self: flex-end;
    text-align: center;
    width: 260px;
  }

  .c-sign-line {
    border-top: 1px solid #333;
    margin-bottom: 8px;
  }

  .c-sign-name {
    margin: 2px 0;
    font-size: 15px;
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
    margin: 6px 0;
    font-size: 15px;
    font-style: italic;
  }

  .lang-my .c-quotes p {
    font-style: normal;
  }

  .c-quote-small {
    font-size: 14px !important;
  }
</style>
