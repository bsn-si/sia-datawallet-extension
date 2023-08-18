import {defineStore} from "pinia";
import Wallet from '~/types/wallet';
import { hash } from 'tweetnacl';
import { encode as encodeB64 } from '@stablelib/base64';
import { encode as encodeUTF8 } from '@stablelib/utf8';
import { saveWallet as dbSaveWallet, loadWallets as dbLoadWallets, deleteWallet as dbDeleteWallet } from './db';
import Storage from "~/utils/storage";
import {ref} from "vue";
import { scanner } from '~/sync/scanner';
import { siaAPI } from '~/services/wallet/siacentral';
import {useUserStore} from "~/store/user";


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
    const siaNetworkFees = ref({});
    const exchangeRateSC = ref({});
    const exchangeRateSF = ref({});
    const siaBlockHeight = ref(0);
    const feeAddresses = ref([]);
    const unavailable = ref(null);
    const dbType = ref('memory');

    updateMetadata();
    setInterval(updateMetadata, 300000);

    const allWallets = computed(() => unref(wallets));

    return {
        settings,
        wallets,
        allWallets,
        saveWallet,
        createWallet,
        queueWallet,
        offline,
        setOffline,
        shiftWallet,
        unavailable,
        setUnavailable,
        setDBType,
        setup,
        setSetup,
        exchangeRateSC,
        exchangeRateSF,
        scanQueue,
        unlockWallets,
        lockWallets,
        siaNetworkFees
    };

    async function unlockWallets(password: string) {
        const { updateUser } = useUserStore()

        const passwordHash = hash(encodeUTF8(password));

        const wallets = await dbLoadWallets(passwordHash);

        setWalletsMutation(wallets);
        updateUser({unlockPassword: passwordHash})

        wallets.forEach(w => queueWallet(w.id, false));
    }

    async function lockWallets() {
        const { updateUser } = useUserStore()

        wallets.value = [];
        scanQueue.value = [];
        updateUser(null)
    }


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
        console.log('setSetup', value)
    }

    async function setDBType(value) {
        dbType.value = value;
    }

    async function setUnavailable(value) {
        unavailable.value = value;
    }

    async function setNetworkFees(value) {
        siaNetworkFees.value = value;
    }

    async function setConsensusHeight(value) {
        siaBlockHeight.value = value;
    }

    async function setFeeAddresses(value) {
        feeAddresses.value = value;
    }

    async function setExchangeRate({ siacoin, siafund }) {
        exchangeRateSC.value = siacoin;
        exchangeRateSF.value = siafund;
    }

    async function updateMetadata() {
        try {
            const price = await siaAPI.getCoinPrice(),
                siaFees = await siaAPI.getNetworkFees(),
                addresses = await siaAPI.getFeeAddresses(),
                siaBlock = await siaAPI.getBlockHeight();

            setNetworkFees(siaFees);
            setConsensusHeight(siaBlock.height)
            setExchangeRate(price);
            setFeeAddresses(addresses);
        } catch (ex) {
            console.error('updatingMeta', ex);
        }
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

        console.log('*** wallets', wallets.value)
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

    async function setWalletsMutation(wlts: Wallet[]) {
        wallets.value = wlts.map(w => new Wallet(w));
    }

});
