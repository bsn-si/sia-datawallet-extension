import VueFinder from '~/components/VueFinder.vue';
import * as Modals from './modals.js';
import WalletDisplay from "./components/wallet/WalletDisplay.vue";
import WalletList from "./components/wallet/WalletList.vue";
import WalletItem from "./components/wallet/WalletItem.vue";
// import SetupPage from "./components/wallet/SetupPage.vue";
// import UnavailablePage from "./components/wallet/UnavailablePage.vue";
// import UnlockWallet from "./components/wallet/UnlockWallet.vue";

export default {
    VueFinder, ...Modals, WalletDisplay, WalletList, WalletItem//, SetupPage, UnavailablePage, UnlockWallet
};
