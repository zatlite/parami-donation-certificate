<script>
	import { LANGUAGES } from '$lib/certificate-content.js';

	let { form, lang = $bindable() } = $props();
</script>

<section class="form">
	<div class="lang-toggle" role="group" aria-label="Certificate language">
		{#each LANGUAGES as l (l.id)}
			<button
				type="button"
				class="lang-btn"
				class:active={lang === l.id}
				aria-pressed={lang === l.id}
				onclick={() => (lang = l.id)}
			>
				{l.label}
			</button>
		{/each}
	</div>

	<label class="field">
		<span>Date</span>
		<input type="text" bind:value={form.date} placeholder="e.g. 29 September 2026" />
	</label>

	<label class="field">
		<span>Name</span>
		<input type="text" bind:value={form.name} placeholder="Donor's full name" />
	</label>

	<label class="field">
		<span>Address</span>
		<textarea rows="2" bind:value={form.address} placeholder="Donor's address"></textarea>
	</label>

	<label class="field">
		<span>Donation Towards</span>
		<input type="text" bind:value={form.towards} placeholder="e.g. Robes, alms, building fund" />
	</label>

	<label class="field">
		<span>Amount</span>
		<input type="text" bind:value={form.amount} placeholder="e.g. $500 or in-kind items" />
	</label>

	<label class="field">
		<span>Custom body text (optional)</span>
		<textarea
			rows="4"
			bind:value={form.customBody}
			placeholder="Leave blank to use the generated text. Anything typed here replaces the whole body paragraph."
		></textarea>
	</label>
</section>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.lang-toggle {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		align-self: flex-start;
	}

	.lang-btn {
		appearance: none;
		border: none;
		background: #f8fafc;
		color: var(--muted);
		padding: 8px 14px;
		font: inherit;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.lang-btn + .lang-btn {
		border-left: 1px solid var(--border);
	}

	.lang-btn.active {
		background: var(--accent);
		color: #fff;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 14px;
	}

	.field > span {
		font-weight: 600;
		color: var(--ink);
	}

	input,
	textarea {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		font: inherit;
		font-size: 15px;
		background: #fff;
		color: var(--ink);
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		outline: 2px solid var(--accent-2);
		outline-offset: 1px;
		border-color: var(--accent-2);
	}
</style>
