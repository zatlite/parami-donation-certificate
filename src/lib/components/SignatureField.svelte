<script>
	import { onMount } from 'svelte';

	let { signature = $bindable(null) } = $props();

	const STORAGE_KEY = 'parami-signature';

	const MODES = [
		{ id: 'saved', label: 'Saved' },
		{ id: 'draw', label: 'Draw' },
		{ id: 'upload', label: 'Upload' },
		{ id: 'none', label: 'None' }
	];

	let mode = $state('none');
	let savedSig = $state(null);
	let uploadedUrl = $state(null);
	let uploadName = $state('');
	let drawnUrl = $state(null); // trimmed, used on the certificate
	let drawnFull = $state(null); // full canvas snapshot, for redraw persistence
	let justSaved = $state(false);

	let canvasEl = $state(null);
	let ctx = null;
	let drawing = false;
	let lastPoint = null;
	let lastMid = null;

	onMount(() => {
		// Load a previously saved signature and use it as the persistent default.
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				savedSig = stored;
				applyMode('saved');
			}
		} catch {
			/* localStorage unavailable */
		}
	});

	function applyMode(m) {
		mode = m;
		if (m === 'saved') signature = savedSig;
		else if (m === 'upload') signature = uploadedUrl;
		else if (m === 'draw') signature = drawnUrl;
		else signature = null;
	}

	function saveDrawn() {
		if (!drawnUrl) return;
		savedSig = drawnUrl;
		try {
			localStorage.setItem(STORAGE_KEY, drawnUrl);
			justSaved = true;
			setTimeout(() => (justSaved = false), 1800);
		} catch {
			/* ignore quota/availability errors */
		}
	}

	function removeSaved() {
		savedSig = null;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
		if (mode === 'saved') signature = null;
	}

	function onFile(e) {
		const file = e.currentTarget.files && e.currentTarget.files[0];
		if (!file) return;
		uploadName = file.name;
		const reader = new FileReader();
		reader.onload = () => {
			uploadedUrl = reader.result;
			if (mode === 'upload') signature = uploadedUrl;
		};
		reader.readAsDataURL(file);
	}

	// (Re)initialise the drawing context whenever the canvas mounts.
	$effect(() => {
		if (!canvasEl) return;
		const c = canvasEl.getContext('2d');
		c.lineWidth = 5;
		c.lineCap = 'round';
		c.lineJoin = 'round';
		c.strokeStyle = '#1a1a1a';
		c.fillStyle = '#1a1a1a';
		ctx = c;
		if (drawnFull) {
			const img = new Image();
			img.onload = () => c.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
			img.src = drawnFull;
		}
	});

	function pointPos(e) {
		const r = canvasEl.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) * (canvasEl.width / r.width),
			y: (e.clientY - r.top) * (canvasEl.height / r.height)
		};
	}

	function down(e) {
		if (!ctx) return;
		canvasEl.setPointerCapture(e.pointerId);
		drawing = true;
		const p = pointPos(e);
		lastPoint = p;
		lastMid = p;
		ctx.beginPath();
		ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
		ctx.fill();
	}

	function move(e) {
		if (!drawing || !ctx) return;
		const p = pointPos(e);
		const mid = { x: (lastPoint.x + p.x) / 2, y: (lastPoint.y + p.y) / 2 };
		ctx.beginPath();
		ctx.moveTo(lastMid.x, lastMid.y);
		ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, mid.x, mid.y);
		ctx.stroke();
		lastPoint = p;
		lastMid = mid;
	}

	function up() {
		if (!drawing) return;
		drawing = false;
		commit();
	}

	function commit() {
		drawnFull = canvasEl.toDataURL('image/png');
		drawnUrl = trim() || drawnFull;
		if (mode === 'draw') signature = drawnUrl;
	}

	// Crop the drawing to the bounding box of the ink for a tight signature.
	function trim() {
		const w = canvasEl.width;
		const h = canvasEl.height;
		const data = ctx.getImageData(0, 0, w, h).data;
		let minX = w, minY = h, maxX = -1, maxY = -1;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (data[(y * w + x) * 4 + 3] > 8) {
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
				}
			}
		}
		if (maxX < 0) return null;
		const pad = 6;
		minX = Math.max(0, minX - pad);
		minY = Math.max(0, minY - pad);
		maxX = Math.min(w - 1, maxX + pad);
		maxY = Math.min(h - 1, maxY + pad);
		const cw = maxX - minX + 1;
		const ch = maxY - minY + 1;
		const out = document.createElement('canvas');
		out.width = cw;
		out.height = ch;
		out.getContext('2d').drawImage(canvasEl, minX, minY, cw, ch, 0, 0, cw, ch);
		return out.toDataURL('image/png');
	}

	function clearCanvas() {
		if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		drawnFull = null;
		drawnUrl = null;
		if (mode === 'draw') signature = null;
	}
</script>

<section class="sig">
	<span class="sig-title">Signature</span>

	<div class="sig-modes" role="group" aria-label="Signature source">
		{#each MODES as m (m.id)}
			<button
				type="button"
				class="sig-mode"
				class:active={mode === m.id}
				aria-pressed={mode === m.id}
				onclick={() => applyMode(m.id)}
			>
				{m.label}
			</button>
		{/each}
	</div>

	{#if mode === 'saved'}
		{#if savedSig}
			<img class="sig-preview" src={savedSig} alt="Saved signature" />
			<button type="button" class="sig-btn" onclick={removeSaved}>Remove saved signature</button>
		{:else}
			<p class="sig-hint">
				No saved signature yet. Use <strong>Draw</strong>, then “Save to browser”.
			</p>
		{/if}
	{:else if mode === 'upload'}
		<label class="sig-upload">
			<input type="file" accept="image/*" onchange={onFile} />
			<span>{uploadName || 'Choose an image…'}</span>
		</label>
		{#if uploadedUrl}
			<img class="sig-preview" src={uploadedUrl} alt="Uploaded signature" />
		{/if}
	{:else if mode === 'draw'}
		<canvas
			bind:this={canvasEl}
			class="sig-canvas"
			width="600"
			height="200"
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointerleave={up}
		></canvas>
		<div class="sig-draw-actions">
			<span class="sig-hint">{justSaved ? 'Saved to this browser ✓' : 'Draw your signature above'}</span>
			<div class="sig-btns">
				<button type="button" class="sig-btn" onclick={saveDrawn} disabled={!drawnUrl}>
					Save to browser
				</button>
				<button type="button" class="sig-btn" onclick={clearCanvas}>Clear</button>
			</div>
		</div>
	{/if}
</section>

<style>
	.sig {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 14px;
	}

	.sig-title {
		font-weight: 600;
		color: var(--ink);
	}

	.sig-modes {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		align-self: flex-start;
	}

	.sig-mode {
		appearance: none;
		border: none;
		background: #f8fafc;
		color: var(--muted);
		padding: 7px 12px;
		font: inherit;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.sig-mode + .sig-mode {
		border-left: 1px solid var(--border);
	}

	.sig-mode.active {
		background: var(--accent);
		color: #fff;
	}

	.sig-upload {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sig-upload input {
		font: inherit;
		font-size: 13px;
	}

	.sig-preview {
		align-self: flex-start;
		max-width: 200px;
		max-height: 70px;
		object-fit: contain;
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 4px 8px;
	}

	.sig-canvas {
		width: 100%;
		height: 110px;
		border: 1px dashed var(--border);
		border-radius: 8px;
		background: #fff;
		touch-action: none;
		cursor: crosshair;
	}

	.sig-draw-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.sig-btns {
		display: flex;
		gap: 8px;
	}

	.sig-hint {
		color: var(--muted);
		font-size: 13px;
		margin: 0;
	}

	.sig-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: #fff;
		color: var(--ink);
		padding: 6px 12px;
		border-radius: 8px;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.sig-btn:hover:not(:disabled) {
		background: #f8fafc;
	}

	.sig-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
