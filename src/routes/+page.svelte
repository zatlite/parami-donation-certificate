<script>
  import { onMount } from "svelte";
  import CertificateForm from "$lib/components/CertificateForm.svelte";
  import Certificate from "$lib/components/Certificate.svelte";
  import { exportPng, exportPdf, copyImageToClipboard } from "$lib/export.js";
  import paramiBuilding from "$lib/assets/parami-building.jpg";
  import paramiLogo from "$lib/assets/parami-logo.svg";
  import SignatureField from "$lib/components/SignatureField.svelte";
  import HistoryTab from "$lib/components/HistoryTab.svelte";
  import { saveEntry, getEntries } from "$lib/history.js";

  const CERT_W = 794;
  const CERT_H = 1123;

  let form = $state({
    name: "",
    address: "",
    towards: "",
    amount: "",
    date: "",
    customBody: "",
  });
  let lang = $state("my");
  let signature = $state(null);
  let certNode = $state(null);
  let busy = $state(false);
  let status = $state(null);
  let activeTab = $state("create");
  let saveOnExport = $state(true);

  let previewWidth = $state(CERT_W);
  let scale = $derived(Math.min(1, previewWidth / CERT_W));

  let historySelected = $state(null);

  const EMPTY_FORM = {
    name: "",
    address: "",
    towards: "",
    amount: "",
    date: "",
    customBody: "",
  };

  let previewData = $derived(
    activeTab === "history"
      ? {
          form: historySelected ?? EMPTY_FORM,
          lang: historySelected?.lang ?? "my",
          signature,
        }
      : { form, lang, signature },
  );

  function handleHistorySelect(entry) {
    historySelected = entry;
  }

  function todayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  onMount(() => {
    if (!form.date) form.date = todayIso();
    try {
      const v = localStorage.getItem("parami-save-on-export");
      if (v !== null) saveOnExport = v === "1";
    } catch {
      /* localStorage unavailable */
    }
  });

  function filename(ext, who = form.name) {
    const slug = (who || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
    return `donation-certificate${slug ? "-" + slug : ""}.${ext}`;
  }

  async function saveToHistory() {
    const { name, address, towards, amount, date, customBody } = form;
    if (!name && !address && !towards && !amount && !customBody) return;
    try {
      const entries = await getEntries();
      const match = entries.find(
        (e) =>
          e.lang === lang &&
          e.name === name &&
          e.address === address &&
          e.towards === towards &&
          e.amount === amount &&
          e.date === date &&
          e.customBody === customBody,
      );
      const now = Date.now();
      if (match) {
        await saveEntry({ ...match, updatedAt: now });
      } else {
        await saveEntry({
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          lang,
          name,
          address,
          towards,
          amount,
          date,
          customBody,
        });
      }
    } catch (err) {
      console.error("history save failed", err);
    }
  }

  function toggleSaveOnExport(e) {
    saveOnExport = e.currentTarget.checked;
    try {
      localStorage.setItem("parami-save-on-export", saveOnExport ? "1" : "0");
    } catch {
      /* localStorage unavailable */
    }
  }

  function cloneEntry(entry) {
    if (!entry) return;
    form.name = entry.name ?? "";
    form.address = entry.address ?? "";
    form.towards = entry.towards ?? "";
    form.amount = entry.amount ?? "";
    form.customBody = entry.customBody ?? "";
    form.date = todayIso();
    lang = entry.lang ?? lang;
    activeTab = "create";
  }

  async function run(action, successText, opts = {}) {
    if (!certNode || busy) return;
    busy = true;
    status = null;
    try {
      await action();
      if (opts.save !== false && saveOnExport) await saveToHistory();
      status = { type: "success", text: successText };
    } catch (err) {
      console.error(err);
      status = {
        type: "error",
        text: (err && err.message) || "Something went wrong.",
      };
    } finally {
      busy = false;
    }
  }

  const onPng = () =>
    run(() => exportPng(certNode, filename("png")), "PNG downloaded.");
  const onPdf = () =>
    run(() => exportPdf(certNode, filename("pdf")), "PDF downloaded.");
  const onCopy = () =>
    run(
      () => copyImageToClipboard(certNode),
      "Certificate image copied to clipboard.",
    );

  const onPngHist = () =>
    run(
      () => exportPng(certNode, filename("png", historySelected?.name)),
      "PNG downloaded.",
      {
        save: false,
      },
    );
  const onPdfHist = () =>
    run(
      () => exportPdf(certNode, filename("pdf", historySelected?.name)),
      "PDF downloaded.",
      {
        save: false,
      },
    );
  const onCopyHist = () =>
    run(
      () => copyImageToClipboard(certNode),
      "Certificate image copied to clipboard.",
      {
        save: false,
      },
    );
</script>

<svelte:head>
  <title>Donation Certificate — Pāramī Dhamma Centre Inc.</title>
</svelte:head>

<main class="page">
  <div class="layout">
    <div class="left">
      <div class="tabs" role="tablist" aria-label="View">
        <button
          class="tab"
          class:active={activeTab === "create"}
          role="tab"
          aria-selected={activeTab === "create"}
          onclick={() => (activeTab = "create")}>Create</button
        >
        <button
          class="tab"
          class:active={activeTab === "history"}
          role="tab"
          aria-selected={activeTab === "history"}
          onclick={() => (activeTab = "history")}>History</button
        >
      </div>
      {#if activeTab === "create"}
        <CertificateForm {form} bind:lang />

        <SignatureField bind:signature />

        <div class="actions">
          <button class="btn primary" onclick={onPng} disabled={busy}
            >Export PNG</button
          >
          <button class="btn" onclick={onPdf} disabled={busy}>Export PDF</button
          >
          <button class="btn" onclick={onCopy} disabled={busy}
            >Copy Image</button
          >
        </div>

        <label class="toggle">
          <input
            type="checkbox"
            checked={saveOnExport}
            onchange={toggleSaveOnExport}
          />
          <span>Save to history on export</span>
        </label>
      {:else}
        <HistoryTab onSelect={handleHistorySelect} />

        <div class="actions">
          <button
            class="btn primary"
            onclick={() => cloneEntry(historySelected)}
            disabled={!historySelected || busy}>Clone</button
          >
          <button
            class="btn"
            onclick={onPngHist}
            disabled={!historySelected || busy}>Export PNG</button
          >
          <button
            class="btn"
            onclick={onPdfHist}
            disabled={!historySelected || busy}>Export PDF</button
          >
          <button
            class="btn"
            onclick={onCopyHist}
            disabled={!historySelected || busy}>Copy Image</button
          >
        </div>
      {/if}

      {#if busy}
        <p class="status working">Working…</p>
      {:else if status}
        <p class="status {status.type}">{status.text}</p>
      {/if}
    </div>

    <div class="right" bind:clientWidth={previewWidth}>
      <div
        class="cert-outer"
        style="width:{CERT_W * scale}px; height:{CERT_H * scale}px;"
      >
        <div class="cert-scale" style="transform: scale({scale});">
          <Certificate
            form={previewData.form}
            lang={previewData.lang}
            bind:node={certNode}
            logoLeft={paramiLogo}
            logoRight={paramiBuilding}
            signature={previewData.signature}
          />
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 20px 60px;
  }

  .page-head {
    text-align: center;
    margin-bottom: 24px;
  }

  .page-head h1 {
    margin: 0 0 4px;
    font-size: 26px;
    color: var(--accent);
  }

  .page-head p {
    margin: 0;
    color: var(--muted);
  }

  .tabs {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .tab {
    flex: 1;
    appearance: none;
    border: none;
    background: transparent;
    color: var(--muted);
    padding: 8px 18px;
    border-radius: 7px;
    font: inherit;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .tab.active {
    background: var(--accent);
    color: #fff;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--ink);
    cursor: pointer;
  }

  .toggle input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 28px;
    align-items: start;
  }

  .left {
    position: sticky;
    top: 20px;
    background: var(--panel-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .btn {
    appearance: none;
    border: 1px solid var(--accent);
    background: #fff;
    color: var(--accent);
    padding: 10px 14px;
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      opacity 0.15s;
  }

  .btn.primary {
    background: var(--btn);
    color: var(--btn-ink);
  }

  .btn:hover:not(:disabled) {
    filter: brightness(0.95);
  }

  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .status {
    margin: 0;
    font-size: 14px;
  }

  .status.success {
    color: #15803d;
  }

  .status.error {
    color: #b91c1c;
  }

  .status.working {
    color: var(--muted);
  }

  .right {
    min-width: 0;
    display: flex;
    justify-content: center;
  }

  .cert-outer {
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    background: #fff;
  }

  .cert-scale {
    transform-origin: top left;
    width: 794px;
  }

  @media (max-width: 820px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .left {
      position: static;
    }
  }
</style>
