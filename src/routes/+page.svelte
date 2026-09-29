<script>
  import { onMount } from "svelte";
  import CertificateForm from "$lib/components/CertificateForm.svelte";
  import Certificate from "$lib/components/Certificate.svelte";
  import { exportPng, exportPdf, copyImageToClipboard } from "$lib/export.js";
  import santikaraLogo from "$lib/assets/santikara-logo.svg";
  import paramiLogo from "$lib/assets/parami-logo.svg";
  import SignatureField from "$lib/components/SignatureField.svelte";

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

	let previewWidth = $state(CERT_W);
	let scale = $derived(Math.min(1, previewWidth / CERT_W));

	onMount(() => {
		if (!form.date) {
			form.date = new Intl.DateTimeFormat('en-GB', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}).format(new Date());
		}
	});

	function filename(ext) {
		const who = (form.name || '').trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
		return `donation-certificate${who ? '-' + who : ''}.${ext}`;
	}

	async function run(action, successText) {
		if (!certNode || busy) return;
		busy = true;
		status = null;
		try {
			await action();
			status = { type: 'success', text: successText };
		} catch (err) {
			console.error(err);
			status = { type: 'error', text: (err && err.message) || 'Something went wrong.' };
		} finally {
			busy = false;
		}
	}

	const onPng = () => run(() => exportPng(certNode, filename('png')), 'PNG downloaded.');
	const onPdf = () => run(() => exportPdf(certNode, filename('pdf')), 'PDF downloaded.');
	const onCopy = () =>
		run(() => copyImageToClipboard(certNode), 'Certificate image copied to clipboard.');
</script>

<svelte:head>
	<title>Donation Certificate — Pāramī Santikara Vihāra</title>
</svelte:head>

<main class="page">
	<header class="page-head">
		<h1>Donation Acknowledgement Certificate</h1>
		<p>Pāramī Santikara Vihāra Dhamma Centre</p>
	</header>

      <SignatureField bind:signature />

			<SignatureField bind:signature defaultSrc={defaultSig} />

			<div class="actions">
				<button class="btn primary" onclick={onPng} disabled={busy}>Export PNG</button>
				<button class="btn" onclick={onPdf} disabled={busy}>Export PDF</button>
				<button class="btn" onclick={onCopy} disabled={busy}>Copy Image</button>
			</div>

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
						{form}
						{lang}
						bind:node={certNode}
						logoLeft={santikaraLogo}
						logoRight={paramiLogo}
						{signature}
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
		transition: background 0.15s, color 0.15s, opacity 0.15s;
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
