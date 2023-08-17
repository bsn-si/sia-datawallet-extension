import { onMessage, sendMessage } from "webext-bridge/popup";
// async function spawnWorker(params, timeout, progress) {
// 	let worker = new Worker('/sia/sia.worker.js', { type: 'module' });
//
// 	const work = new Promise((resolve, reject) => {
// 		const workerDeadline = setTimeout(() => {
// 			reject(new Error('response timeout'));
// 		}, timeout);
//
// 		worker.onmessage = (e) => {
// 			const data = e.data;
//
// 			clearTimeout(workerDeadline);
//
// 			if (data === 'ready') {
// 				worker.postMessage(params);
// 				return;
// 			}
//
// 			if (!Array.isArray(data)) {
// 				console.error(data);
// 				return reject(new Error('unexpected data'));
// 			}
//
// 			switch (data[0]) {
// 			case 'log':
// 				console.debug(data[1]);
// 				return;
// 			case 'progress':
// 				if (typeof progress !== 'function')
// 					return;
//
// 				progress(data[1]);
// 				return;
// 			case null:
// 				resolve(data[1]);
// 				return;
// 			default:
// 				reject(new Error(data[0]));
// 			}
// 		};
// 	});
//
// 	work.finally(() => {
// 		worker.terminate();
// 		worker = null;
// 	});
//
// 	return work;
// }


// See https://github.com/zikaari/webext-bridge
onMessage('spawn-worker-response', async (message) => {
	const {data, sender} = message;

	console.log('spawn-worker-response', data, 'sender', sender);

	if (data === 'ready') {
		// worker.postMessage(params);
		return;
	}

	if (!Array.isArray(data)) {
		console.error('unexpected data', data);
		// TODO:

		// return reject(new Error('unexpected data'));
	}

	switch (data[0]) {
		case 'log':
			console.debug(data[1]);
			return;
		case 'progress':
			//TODO:

			// if (typeof progress !== 'function')
			// 	return;
			// progress(data[1]);
			// console.warn('progress callback is not implemented', data[1])
			return;
		case null:
			//TODO:
			// resolve(data[1]);
			// console.warn('resolve callback is not implemented', data[1])
			return {value: data[1]};
		default:
			//TODO:
			// reject(new Error(data[0]));
			// console.warn('reject callback is not implemented', data[0])
			console.error(data[0]);
			return {error: data[0]}
	}
});


// See background/main.ts, onMessage('spawn-worker')
export function generateSeed(type) {
	// return spawnWorker(['generateSeed', type], 15000);
	return sendMessage(
		'spawn-worker',
		['generateSeed', type],
		'background'
	);
}

export function generateAddresses(seed, currency, i, n) {
	// return spawnWorker(['generateAddresses', seed, currency, i, n], 15000);
	return sendMessage(
		'spawn-worker',
		['generateAddresses', seed, currency, i, n],
		'background'
	);
}

export function signTransactions(seed, currency, unsigned) {
	// return spawnWorker(['signTransactions', seed, currency, JSON.stringify(unsigned)], 15000);
	return sendMessage(
		'spawn-worker',
		['signTransactions', seed, currency, JSON.stringify(unsigned)],
		'background'
	);
}

export function getTransactions(addresses, walletCurrency, displayCurrency) {
	// return spawnWorker(['getTransactions', addresses, walletCurrency, displayCurrency], 30000);
	return sendMessage(
		'spawn-worker',
		['getTransactions', addresses, walletCurrency, displayCurrency],
		'background'
	);
}

//TODO: progress callback is not supported
export async function exportTransactions(addresses, walletCurrency, displayCurrency, min, max, progress) {
	// return spawnWorker(['exportTransactions', addresses, walletCurrency, displayCurrency, min, max], 300000, progress);
	return sendMessage(
		'spawn-worker',
		['exportTransactions', addresses, walletCurrency, displayCurrency, min, max],
		'background'
	);
}

export function signTransaction(seed, currency, txn, indexes) {
	// return spawnWorker(['signTransaction', seed, currency, JSON.stringify(txn), indexes], 15000);
	return sendMessage(
		'spawn-worker',
		['signTransaction', seed, currency, JSON.stringify(txn), indexes],
		'background'
	);
}

export function encodeTransaction(txn) {
	// return spawnWorker(['encodeTransaction', JSON.stringify(txn)], 15000);
	return sendMessage(
		'spawn-worker',
		['encodeTransaction', JSON.stringify(txn)],
		'background'
	);
}

export function encodeUnlockHash(unlockconditions) {
	// return spawnWorker(['encodeUnlockHash', JSON.stringify(unlockconditions)], 15000);
	return sendMessage(
		'spawn-worker',
		['encodeUnlockHash', JSON.stringify(unlockconditions)],
		'background'
	);
}

export function encodeUnlockHashes(unencoded) {
	// return spawnWorker(['encodeUnlockHashes', unencoded.map(u => JSON.stringify(u))], 15000);
	return sendMessage(
		'spawn-worker',
		['encodeUnlockHashes', unencoded.map(u => JSON.stringify(u))],
		'background'
	);
}

//TODO: progress callback is not supported
export async function recoverAddresses(seed, currency, i = 0, lookahead = 25000, last = 0, progress) {
	// return spawnWorker(['recoverAddresses', seed, currency, i, lookahead, last], 300000, progress);
	return sendMessage(
		'spawn-worker',
		['recoverAddresses', seed, currency, i, lookahead, last],
		'background'
	);
}
