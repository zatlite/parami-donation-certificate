// Client-only export helpers. html2canvas and jspdf are dynamically imported
// so they never run during SSR/prerender.

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

async function nodeToCanvas(node, scale = 2) {
	if (!node) throw new Error('Nothing to export yet.');
	await ensureFontsReady();
	const { default: html2canvas } = await import('html2canvas');
	return html2canvas(node, {
		scale,
		backgroundColor: '#ffffff',
		useCORS: true,
		logging: false,
		windowWidth: node.scrollWidth,
		windowHeight: node.scrollHeight
	});
}

function canvasToBlob(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error('Could not generate image.'));
		}, MIME_PNG);
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
	const canvas = await nodeToCanvas(node);
	const blob = await canvasToBlob(canvas);
	downloadBlob(blob, filename);
}

export async function exportPdf(node, filename = 'certificate.pdf') {
	const canvas = await nodeToCanvas(node);
	const { jsPDF } = await import('jspdf');
	const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
	const pageW = pdf.internal.pageSize.getWidth();
	const pageH = pdf.internal.pageSize.getHeight();
	const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
	const w = canvas.width * ratio;
	const h = canvas.height * ratio;
	const x = (pageW - w) / 2;
	const y = (pageH - h) / 2;
	pdf.addImage(canvas.toDataURL(MIME_PNG), 'PNG', x, y, w, h);
	pdf.save(filename);
}

export async function copyImageToClipboard(node) {
	if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
		throw new Error('Copying images to the clipboard is not supported in this browser. Try Chrome or Edge.');
	}
	const canvas = await nodeToCanvas(node);
	const blob = await canvasToBlob(canvas);
	await navigator.clipboard.write([new ClipboardItem({ [MIME_PNG]: blob })]);
}
