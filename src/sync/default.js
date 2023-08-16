import { recoverAddresses, getTransactions } from '~/sia';
import { saveAddresses, getWalletAddresses } from '~/store/db';
import Wallet from '~/types/wallet';
import {useWalletsStore} from "~/store/wallet";
import {useUserStore} from "~/store/user";

// const { settings, saveWallet } = useWalletsStore()
const { user } = useUserStore()

export default {
	quickScan: async function(wallet) {
		const { settings, saveWallet } = useWalletsStore()
		let startIndex = 0, lastKnownIndex,
			maxLookahead = settings.get().addressLookahead;
		const addresses = await getWalletAddresses(wallet.id);

		if (typeof maxLookahead !== 'number' || maxLookahead < 0 || maxLookahead > 500000)
			maxLookahead = 25000;

		if (Array.isArray(addresses) && addresses.length !== 0) {
			lastKnownIndex = addresses[addresses.length - 1].index;

			if (lastKnownIndex > maxLookahead)
				startIndex = lastKnownIndex - maxLookahead;
		}

		console.log(`starting quick scan of ${wallet.title} starting at ${startIndex}/${lastKnownIndex} with ${maxLookahead} lookahead`);

		await recoverAddresses(wallet.seed, wallet.currency, startIndex, maxLookahead, lastKnownIndex, async(progress) => {
			if (!progress || !Array.isArray(progress.addresses))
				return;

			await saveAddresses(progress.addresses.map((a, i) => {
				return {
					...a,
					wallet_id: wallet.id
				};
			}));
		});
	},
	fullScan: async function(wallet) {
		const { settings, saveWallet } = useWalletsStore()

		let maxLookahead = settings.get().addressLookahead;

		if (typeof maxLookahead !== 'number' || maxLookahead < 0 || maxLookahead > 500000)
			maxLookahead = 25000;

		console.log(`starting full scan of ${wallet.title} with ${maxLookahead} lookahead`);

		await recoverAddresses(wallet.seed, wallet.currency, 0, maxLookahead, 0, async(progress) => {
			if (!progress || !Array.isArray(progress.addresses))
				return;

			await saveAddresses(progress.addresses.map(a => ({
				...a,
				wallet_id: wallet.id
			})));
		});
	},
	scanTransactions: async function(wallet) {
		const { settings, saveWallet } = useWalletsStore()

		const addresses = await getWalletAddresses(wallet.id);

		if (!Array.isArray(addresses) || addresses.length === 0)
			throw new Error('wallet has no addresses');

		const balance = await getTransactions(addresses.map(a => a.address), wallet.currency, settings.get().currency);

		wallet = new Wallet({
			...wallet,
			...balance
		});

		await saveWallet(wallet, user?.unlockPassword);
	}
};
