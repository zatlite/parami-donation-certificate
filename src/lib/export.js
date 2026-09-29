// Client-only export helpers. html-to-image and jspdf are dynamically imported
// so they never run during SSR/prerender.
//
// We use html-to-image (SVG <foreignObject> with embedded web fonts) rather than
// html2canvas because html2canvas cannot shape complex scripts — Myanmar stacked
// consonants (e.g. သန္တိ, ဓမ္မ) break in its output. html-to-image relies on the
// browser's native text rendering, so exports match what is shown on screen.

const MIME_PNG = 'image/png';

async function ensureFontsReady() {
	if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
		try {
			await document.fonts.ready;
		} catch {
			/* ignore font loading errors */
		}
	}
}

function renderOptions(node) {
	return {
		pixelRatio: 2,
		backgroundColor: '#ffffff',
		cacheBust: true,
		width: node.offsetWidth,
		height: node.offsetHeight
	};
}

async function nodeToPngDataUrl(node) {
	if (!node) throw new Error('Nothing to export yet.');
	await ensureFontsReady();
	const { toPng } = await import('html-to-image');
	return toPng(node, renderOptions(node));
}

async function nodeToPngBlob(node) {
	if (!node) throw new Error('Nothing to export yet.');
	await ensureFontsReady();
	const { toBlob } = await import('html-to-image');
	const blob = await toBlob(node, renderOptions(node));
	if (!blob) throw new Error('Could not generate image.');
	return blob;
}

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Could not read generated image.'));
		img.src = src;
	});
}

function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export async function exportPng(node, filename = 'certificate.png') {
	const blob = await nodeToPngBlob(node);
	downloadBlob(blob, filename);
}

export async function exportPdf(node, filename = 'certificate.pdf') {
	const dataUrl = await nodeToPngDataUrl(node);
	const img = await loadImage(dataUrl);
	const { jsPDF } = await import('jspdf');
	const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
	const pageW = pdf.internal.pageSize.getWidth();
	const pageH = pdf.internal.pageSize.getHeight();
	const ratio = Math.min(pageW / img.width, pageH / img.height);
	const w = img.width * ratio;
	const h = img.height * ratio;
	const x = (pageW - w) / 2;
	const y = (pageH - h) / 2;
	pdf.addImage(dataUrl, 'PNG', x, y, w, h);
	pdf.save(filename);
}

export async function copyImageToClipboard(node) {
	if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
		throw new Error('Copying images to the clipboard is not supported in this browser. Try Chrome or Edge.');
	}
	const blob = await nodeToPngBlob(node);
	await navigator.clipboard.write([new ClipboardItem({ [MIME_PNG]: blob })]);
}
