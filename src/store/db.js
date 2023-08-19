import DexieStore from './db/dexie';
import MemoryStore from './db/memory';

import { hash } from 'tweetnacl';
import { encrypt, pbkdf2 } from '~/utils/crypto';
import { encode as encodeB64 } from '@stablelib/base64';
import { encode as encodeUTF8 } from '@stablelib/utf8';
import BigNumber from 'bignumber.js';
import * as lodash from "deepdash-es/standalone";

let db;

export async function connect() {
	try {
		const dexie = new DexieStore();

		await dexie.init();

		db = dexie;
		return 'dexie';
	} catch (ex) {
		console.error('dexie', ex);
	}

	const mem = new MemoryStore();

	await mem.init();

	db = mem;

	return 'memory';
}

export async function saveWallet(wallet, password) {
	if (!wallet || !wallet.seed || wallet.seed.length === 0)
		throw new Error('wallet requires seed');

	let id = wallet.seed;

	if (wallet.currency && wallet.currency !== 'sc')
		id += '-' + wallet.currency;

	const walletID = encodeB64(hash(encodeUTF8(id))),
		key = await pbkdf2(password, wallet.salt);

	let confirmedSiafundBalance = new BigNumber(wallet.confirmed_siafund_balance),
		confirmedSiacoinBalance = new BigNumber(wallet.confirmed_siacoin_balance),
		unconfirmedSiafundDelta = new BigNumber(wallet.unconfirmed_siacoin_delta),
		unconfirmedSiacoinDelta = new BigNumber(wallet.unconfirmed_siafund_delta),
		siafundClaim = new BigNumber(wallet.siafund_claim);

	if (siafundClaim.isNaN() || !siafundClaim.isFinite())
		siafundClaim = new BigNumber(0);

	if (confirmedSiafundBalance.isNaN() || !confirmedSiafundBalance.isFinite())
		confirmedSiafundBalance = new BigNumber(0);

	if (confirmedSiacoinBalance.isNaN() || !confirmedSiacoinBalance.isFinite())
		confirmedSiacoinBalance = new BigNumber(0);

	if (unconfirmedSiafundDelta.isNaN() || !unconfirmedSiafundDelta.isFinite())
		unconfirmedSiafundDelta = new BigNumber(0);

	if (unconfirmedSiacoinDelta.isNaN() || !unconfirmedSiacoinDelta.isFinite())
		unconfirmedSiacoinDelta = new BigNumber(0);

	let value = {
		...wallet,
		id: walletID,
		salt: key.salt,
		server_type: wallet.server_type || 'siacentral',
		server_url: null,
		seed: encrypt(wallet.seed, key.hash),
		confirmed_siafund_balance: confirmedSiafundBalance.toString(10),
		confirmed_siacoin_balance: confirmedSiacoinBalance.toString(10),
		unconfirmed_siacoin_delta: unconfirmedSiafundDelta.toString(10),
		unconfirmed_siafund_delta: unconfirmedSiacoinDelta.toString(10),
		siafund_claim: siafundClaim.toString(10)
	}

	function applyToRawRecursively(obj) {
		// Base case: If the object is not reactive, return the original value
		// if (!isReactive(obj)) {
		// 	return obj;
		// }

		// Initialize an empty object to store the processed properties
		const processedObj = {};

		// Iterate through each property of the object
		for (const key in obj) {
			if (Object.hasOwnProperty.call(obj, key)) {
				const value = obj[key];

				// Apply toRaw to the property value
				const rawValue = toRaw(value);

				// Recursively process nested objects or arrays
				processedObj[key] = typeof rawValue === 'object' ? applyToRawRecursively(rawValue) : rawValue;
			}
		}

		return processedObj;
	}

	// value = applyToRawRecursively(value);

	try {
		await db.saveWallet(value);
	} catch (error) {
		// find error location
		const match = error.message.match(/^Failed to execute 'put' on 'IDBObjectStore': (.*) could not be cloned\.$/)
		if (!match) {
			console.error(error)
			return
		}
		const valDesc = match[1]
		if (valDesc == '[object Array]') {
			// DOMException: Failed to execute 'put' on 'IDBObjectStore': function () { [native code] } could not be cloned.
			const path = lodash.findPathDeep(value, (val) => typeof val == 'object')
			console.error(`${error}\n\nvalue contains a object: value.${path}`)
		}
		else {
			console.log(`TODO handle valDesc`, valDesc)
			console.error(error)
		}
	}

	return walletID;
}

export function loadWallets(password) {
	return db.getWallets(password);
}

export function walletCount() {
	return db.walletCount();
}

export function saveAddresses(addresses) {
	return db.saveAddresses(addresses);
}

export function getWalletAddresses(walletID) {
	return db.getWalletAddresses(walletID);
}

export function getWalletUnlockHashes(walletID) {
	return db.getWalletUnlockHashes(walletID);
}

export function getAddresses(walletID, addresses) {
	return db.getAddresses(walletID, addresses);
}

export function getWalletChangeAddress(walletID) {
	return db.getWalletChangeAddress(walletID);
}

export function getLastWalletAddresses(walletID, limit, offset) {
	return db.getLastWalletAddresses(walletID, limit, offset);
}

export function deleteWallet(walletID) {
	return db.deleteWallet(walletID);
}

export function reset() {
	return db.reset();
}
