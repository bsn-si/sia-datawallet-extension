import {defineStore} from "pinia";
import Wallet from '~/types/wallet';
import { hash } from 'tweetnacl';
import { encode as encodeB64 } from '@stablelib/base64';
import { encode as encodeUTF8 } from '@stablelib/utf8';
import { saveWallet as dbSaveWallet, loadWallets as dbLoadWallets, deleteWallet as dbDeleteWallet } from './db';
import Storage from "~/utils/storage";
import {ref} from "vue";
import { scanner } from '~/sync/scanner';

interface WalletSettings {
    autoLock: number,
    currency: string,
    useCostBasis: boolean,
    changeSeedType: boolean,
    changeServerType: boolean,
    addressLookahead: number,
    displayLanguage: string,
}

export const walletSettingsStorage = new Storage<WalletSettings>('walletSettings')
walletSettingsStorage.set({
    autoLock: 15,
    currency: 'usd',
    useCostBasis: false,
    changeSeedType: false,
    changeServerType: false,
    addressLookahead: 25000,
    displayLanguage: 'detect'
});

export const useWalletsStore = defineStore('walletsStore', () => {
    const wallets = ref<Wallet[]>([]);
    const scanQueue = ref<{ walletID: string, full: boolean }[]>([]);
    const settings = ref(walletSettingsStorage.get())
    const offline = ref(false);
    const setup = ref(false);

    return {
        settings,
        wallets,
        saveWallet,
        createWallet,
        queueWallet,
        setOffline,
        shiftWallet,
        setSetup,
    };

    async function saveWallet(wallet: Wallet, password: string) {
        const existing = wallets.value.find(w => w.id === wallet.id);

        if (!existing)
            throw new Error(`unknown wallet ${wallet.id}`);

        const id = await dbSaveWallet({
            ...existing,
            ...wallet
        }, password);


        await saveWalletMutation({
            ...existing,
            ...wallet,
            id
        });

        return id;
    }

    async function createWallet(wallet: Wallet, password: Uint8Array) {
        const existing = wallets.value.find(w => w.id === wallet.id),
            id = await dbSaveWallet({
                ...existing,
                ...wallet
            }, password);

        await saveWalletMutation({...wallet, id});

        return id;
    }

    async function queueWallet(walletId, full) {
        await queueWalletMutation(walletId, full);
        setTimeout(scanner, 0);
    }

    async function shiftWallet() {
        const item = scanQueue.value[0];
        await shiftWalletMutation();
        return item;
    }

    async function setOffline(value) {
        offline.value = value;
    }

    async function setSetup(value) {
        setup.value = value;
    }

    async function saveWalletMutation(wallet: Wallet) {
        if (!wallet || !wallet.seed)
            return;

        let id = wallet.seed;

        if (wallet.currency && wallet.currency !== 'sc')
            id += '-' + wallet.currency;

        id = encodeB64(hash(encodeUTF8(id)));

        const idx = wallets.value.findIndex(w => w.id === id);

        if (idx === -1) {
            wallets.value.push(new Wallet(wallet));
            return;
        }

        wallets.value.splice(idx, 1, new Wallet(wallet));
    }

    async function queueWalletMutation( walletID, full ) {
        full = typeof full === 'boolean' ? full : false;

        if (scanQueue.value.findIndex(w => w.id === walletID && w.full === full) !== -1)
            return;

        scanQueue.value.push({
            walletID,
            full
        });
    }

    async function shiftWalletMutation() {
        return scanQueue.value.shift();
    }


});
