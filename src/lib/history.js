// Client-only certificate history stored in IndexedDB.
// Records hold the typed inputs (name, address, towards, amount, date, customBody)
// plus language and timestamps. The signature is intentionally never stored.

const DB_NAME = 'parami-history';
const DB_VERSION = 1;
const STORE = 'entries';

function hasIDB() {
	return typeof indexedDB !== 'undefined';
}

function openDB() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function withStore(mode, fn) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, mode);
		const req = fn(tx.objectStore(STORE));
		tx.oncomplete = () => {
			db.close();
			resolve(req && 'result' in req ? req.result : undefined);
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error);
		};
		tx.onabort = () => {
			db.close();
			reject(tx.error);
		};
	});
}

export async function saveEntry(entry) {
	if (!hasIDB()) return null;
	await withStore('readwrite', (store) => store.put(entry));
	return entry.id;
}

export async function getEntries() {
	if (!hasIDB()) return [];
	return (await withStore('readonly', (store) => store.getAll())) || [];
}

export async function deleteEntry(id) {
	if (!hasIDB()) return;
	await withStore('readwrite', (store) => store.delete(id));
}

export async function clearEntries() {
	if (!hasIDB()) return;
	await withStore('readwrite', (store) => store.clear());
}
