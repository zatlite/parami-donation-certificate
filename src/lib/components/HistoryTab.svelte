<script>
	import { onMount, tick } from 'svelte';
	import { getEntries, deleteEntry, clearEntries } from '$lib/history.js';
	import { formatCertDate } from '$lib/date.js';

	let { onSelect } = $props();

	let entries = $state([]);
	let query = $state('');
	let loading = $state(true);
	let selectedId = $state(null);
	let listEl = $state(null);

	function sortEntries(list) {
		return [...list].sort((a, b) => {
			const ad = a.date || '';
			const bd = b.date || '';
			if (ad !== bd) return bd < ad ? -1 : 1; // newest certificate date first
			return (b.createdAt || 0) - (a.createdAt || 0); // tie-break: newest saved first
		});
	}

	let filtered = $derived(
		sortEntries(
			entries.filter((e) => {
				const q = query.trim().toLowerCase();
				if (!q) return true;
				const hay = [e.name || '', e.date || '', formatCertDate(e.date, 'en'), formatCertDate(e.date, 'my')]
					.join(' ')
					.toLowerCase();
				return hay.includes(q);
			})
		)
	);

	let selectedIndex = $derived(filtered.findIndex((e) => e.id === selectedId));

	function emit() {
		onSelect?.(filtered.find((e) => e.id === selectedId) || null);
	}

	function select(id, { scroll = false } = {}) {
		selectedId = id;
		emit();
		if (scroll) scrollSelectedIntoView();
	}

	// Keep a valid selection after load / search / delete.
	function reselect() {
		if (!filtered.some((e) => e.id === selectedId)) {
			selectedId = filtered.length ? filtered[0].id : null;
		}
		emit();
	}

	async function refresh() {
		loading = true;
		entries = await getEntries();
		loading = false;
		reselect();
	}

	onMount(async () => {
		await refresh();
		await tick();
		listEl?.focus({ preventScroll: true });
	});

	function scrollSelectedIntoView() {
		if (!listEl || !selectedId) return;
		listEl.querySelector(`[data-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest' });
	}

	function onKeydown(e) {
		if (!filtered.length) return;
		let idx = selectedIndex < 0 ? 0 : selectedIndex;
		if (e.key === 'ArrowDown') idx = Math.min(idx + 1, filtered.length - 1);
		else if (e.key === 'ArrowUp') idx = Math.max(idx - 1, 0);
		else if (e.key === 'Home') idx = 0;
		else if (e.key === 'End') idx = filtered.length - 1;
		else return;
		e.preventDefault();
		select(filtered[idx].id, { scroll: true });
	}

	function onListClick(e) {
		const row = e.target.closest('[data-id]');
		if (row && listEl?.contains(row)) select(row.getAttribute('data-id'));
	}

	function onQueryInput(e) {
		query = e.currentTarget.value;
		reselect();
	}

	async function onDelete(id) {
		await deleteEntry(id);
		await refresh();
	}

	async function onClearAll() {
		if (typeof confirm === 'function' && !confirm('Delete all saved certificates?')) return;
		await clearEntries();
		await refresh();
	}

	function savedLabel(e) {
		const t = e.updatedAt || e.createdAt;
		if (!t) return '';
		try {
			return new Date(t).toLocaleString();
		} catch {
			return '';
		}
	}
</script>

<div class="history">
	<div class="hist-head">
		<input
			class="hist-search"
			type="search"
			value={query}
			oninput={onQueryInput}
			placeholder="Search by name or date"
			aria-label="Search history by name or date"
		/>
		{#if entries.length}
			<button class="hist-clear" onclick={onClearAll}>Clear all</button>
		{/if}
	</div>

	{#if loading}
		<p class="hist-empty">Loading…</p>
	{:else if !entries.length}
		<p class="hist-empty">
			No saved certificates yet. Export one with “Save to history on export” enabled.
		</p>
	{:else if !filtered.length}
		<p class="hist-empty">No matches for “{query}”.</p>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<ul
			class="hist-list"
			role="listbox"
			tabindex="0"
			aria-label="Saved certificates"
			aria-activedescendant={selectedId ? 'hist-opt-' + selectedId : undefined}
			bind:this={listEl}
			onkeydown={onKeydown}
			onclick={onListClick}
		>
			{#each filtered as e (e.id)}
				<li
					id={'hist-opt-' + e.id}
					data-id={e.id}
					class="hist-row"
					class:selected={e.id === selectedId}
					role="option"
					aria-selected={e.id === selectedId}
				>
					<div class="hist-info">
						<div class="hist-line">
							<span class="hist-date">{formatCertDate(e.date, e.lang) || '—'}</span>
							<span class="lang-badge">{(e.lang || '').toUpperCase()}</span>
							<span class="hist-name">{e.name || '(no name)'}</span>
						</div>
						<div class="hist-meta">
							{#if e.towards}<span>{e.towards}</span>{/if}
							{#if e.amount}<span class="hist-amount">{e.amount}</span>{/if}
							<span class="hist-saved">Saved {savedLabel(e)}</span>
						</div>
					</div>
					<button
						class="hist-del"
						aria-label={'Delete certificate for ' + (e.name || 'no name')}
						title="Delete"
						onclick={(ev) => {
							ev.stopPropagation();
							onDelete(e.id);
						}}
					>
						<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
							<path
								fill="currentColor"
								d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 2h4V5h-4Zm-3 2v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7H7Zm3 2a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
							/>
						</svg>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.history {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.hist-head {
		display: flex;
		gap: 10px;
	}

	.hist-search {
		flex: 1 1 auto;
		min-width: 0;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		font: inherit;
		font-size: 15px;
		background: #fff;
		color: var(--ink);
	}

	.hist-search:focus {
		outline: 2px solid var(--accent-2);
		outline-offset: 1px;
		border-color: var(--accent-2);
	}

	.hist-clear {
		appearance: none;
		border: 1px solid var(--border);
		background: #fff;
		color: #b91c1c;
		padding: 8px 14px;
		border-radius: 8px;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.hist-empty {
		margin: 16px 0;
		text-align: center;
		color: var(--muted);
	}

	.hist-list {
		list-style: none;
		margin: 0;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 60vh;
		overflow-y: auto;
		border: 1px solid var(--border);
		border-radius: 10px;
		outline: none;
	}

	.hist-list:focus-visible {
		box-shadow: 0 0 0 2px var(--accent-2);
	}

	.hist-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: #fff;
		cursor: pointer;
	}

	.hist-row:hover {
		background: #f8fafc;
	}

	.hist-row.selected {
		border-color: var(--accent);
		background: #eef3fb;
		box-shadow: 0 0 0 1px var(--accent) inset;
	}

	.hist-info {
		min-width: 0;
	}

	.hist-line {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.hist-date {
		font-weight: 700;
		color: var(--ink);
	}

	.lang-badge {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: #fff;
		background: var(--accent);
		border-radius: 5px;
		padding: 1px 6px;
	}

	.hist-name {
		color: var(--ink);
	}

	.hist-meta {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 4px;
		font-size: 13px;
		color: var(--muted);
	}

	.hist-amount {
		font-weight: 600;
	}

	.hist-saved {
		font-style: italic;
	}

	.hist-del {
		flex-shrink: 0;
		appearance: none;
		border: none;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.hist-del:hover {
		color: #b91c1c;
		background: #fdecec;
	}
</style>
