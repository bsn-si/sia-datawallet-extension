<template>
  <div class="wallet-display">
    <div class="wallet-balance">
      <div class="wallet-title">{{ name }}
        <button class="btn-select" @click="modal = 'wallet'">
          <font-awesome-icon icon="chevron-down"/>
        </button>
        <transition name="fade" mode="out-in">
          <div class="wallet-scanning" v-if="wallet.scanning === 'full'" key="scanning">
            <font-awesome-icon icon="arrow-rotate-right"/>
            {{ 'Scanning...' }}
          </div>
          <div class="wallet-scanning" v-else-if="walletQueued" key="queued">
            <font-awesome-icon icon="arrow-rotate-right"/>
            {{ 'Scan Queued...' }}
          </div>
        </transition>
      </div>
      <div class="wallet-siacoin-balance" v-html="formatSiacoinString(siacoinBalance)"></div>
      <div class="wallet-display-balance" v-html="formatCurrencyString(siacoinBalance)"></div>
      <siafund-balance :siafunds="siafundBalance" :claim="claimBalance" :wallet="wallet" v-if="siafundBalance.gt(0)"/>

      <div>
        <div class="flex flex-col items-center justify-center dark:bg-gray-800 py-[12px] min-h-screen">
          <div class="md:text:4xl flex w-auto flex-col px-6 text-center text-2xl sm:text-3xl">
            <span class="font-medium"> Powerful features when </span>
            <span class="bg-[#19cf86] bg-clip-text font-medium text-transparent">
      subscripted.
    </span>
            <span class="mt-4"> Chose a plan that&apos;s right for you </span>
            <div class="mt-8 flex items-center justify-center gap-4 pl-5 text-base md:mt-16">
              <span>Pay monthly </span>
              <div class="flex items-center">
                <label for="small-toggle" class="relative inline-flex cursor-pointer">
                  <input
                      type="checkbox"
                      value=""
                      id="small-toggle"
                      class="peer sr-only"
                  />
                  <div
                      class="peer h-5 w-9 flex-1 rounded-full bg-gray-200 align-middle after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#19cf86] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none  dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:bg-[#19cf86]"></div>
                </label>
              </div>
              <span>Pay yearly</span>
            </div>
          </div>
          <div class="flex w-[300px] justify-end pt-2 sm:w-[350px] md:w-[590px] md:pt-0">
            <svg
                width="107"
                height="88"
                viewBox="0 0 107 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-14 md:w-20 h-20 -mt-8"
            >
              <path
                  d="M95.4463 61.5975C83.1573 64.6611 68.4838 65.2433 57.6839 57.506C50.782 52.5613 47.1171 42.5628 49.6964 34.4471C52.1324 26.7825 57.8212 20.0482 66.3457 20.2534C70.789 20.3604 74.6201 22.4047 75.429 27.084C76.6648 34.2329 69.5331 41.6308 63.8629 44.7405C46.1672 54.4452 21.1341 53.9052 4.27686 42.6407"
                  stroke="#19cf86"
                  stroke-width="3"
                  stroke-linecap="round"
              />
              <path
                  d="M11.7068 55.8447C9.64482 52.9634 5.14208 46.2418 3.62681 42.4054"
                  stroke="#19cf86"
                  stroke-width="3"
                  stroke-linecap="round"
              />
              <path
                  d="M3.62695 42.4055C7.1396 41.942 15.124 40.6363 18.9603 39.121"
                  stroke="#19cf86"
                  stroke-width="3"
                  stroke-linecap="round"
              />
            </svg>
            <span class="pr-2 pt-2 text-sm font-medium text-[#19cf86] md:text-lg">
      Save 25%
    </span>
          </div>
          <div class="flex h-full flex-col gap-6 px-5 lg:flex-row">
            <div class="h-full max-w-[378px] rounded-xl lg:w-auto xl:w-[378px]" :class="{'text-white dark:text-white bg-[#19cf86]': activeSubscription.plan_code === 'SMALL_YEARLY', 'bg-white dark:text-black': activeSubscription.plan_code !== 'SMALL_YEARLY'}">
              <div class="flex h-full flex-col rounded-xl border border-gray-500 py-6 px-5 sm:px-10 lg:border-none">
                <div class="flex flex-col text-left">
                  <div class="flex flex-col gap-3">
                    <span class="text-[22px]">Small</span>
                    <span>Ideal for individuals who need small to store small amount of data.</span>
                  </div>
                  <div class="my-4 flex items-center gap-3">
                    <span class="text-[56px] font-semibold">10 sc</span>
                    <span class="font-normal">/ Month</span>
                  </div>
                  <button v-if="activeSubscription.plan_code !== 'SMALL_YEARLY'" class="w-full rounded border-[1px] border-[#19cf86] py-2.5 text-[#19cf86]" @click="paySubscription('SMALL_YEARLY')">
                    Get Started Now
                  </button>
                  <div class="mt-10 space-y-3">
                    <div class="flex items-center gap-4">
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="32" height="32" rx="16" fill="#E8EDFB"/>
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M21.8162 12.207C22.0701 12.4737 22.0597 12.8957 21.793 13.1495L14.0893 20.4829C13.9577 20.6081 13.7808 20.6742 13.5993 20.666C13.4179 20.6577 13.2477 20.5758 13.128 20.4391L10.1651 17.0545C9.92254 16.7775 9.95052 16.3563 10.2276 16.1138C10.5046 15.8713 10.9258 15.8992 11.1683 16.1763L13.6734 19.0379L20.8737 12.1838C21.1404 11.9299 21.5624 11.9403 21.8162 12.207Z"
                            fill="#19cf86"
                        />
                      </svg>
                      <span class="text-base font-medium">500 Mb</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="32" height="32" rx="16" fill="#F7F8F9"/>
                        <path
                            d="M20.2421 20.2426C20.5025 19.9822 20.5025 19.5601 20.2421 19.2997L16.9428 16.0004L20.243 12.7001C20.5034 12.4397 20.5034 12.0176 20.243 11.7573C19.9827 11.4969 19.5606 11.4969 19.3002 11.7573L15.9999 15.0576L12.6997 11.7573C12.4393 11.4969 12.0172 11.4969 11.7568 11.7573C11.4965 12.0176 11.4965 12.4397 11.7568 12.7001L15.0571 16.0004L11.7578 19.2997C11.4974 19.5601 11.4974 19.9822 11.7578 20.2426C12.0181 20.5029 12.4402 20.5029 12.7006 20.2426L15.9999 16.9432L19.2993 20.2426C19.5597 20.5029 19.9818 20.5029 20.2421 20.2426Z"
                            fill="#19cf86"
                        />
                      </svg>
                      <span class="text-base font-medium">1 Gb</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="32" height="32" rx="16" fill="#F7F8F9"/>
                        <path
                            d="M20.2421 20.2426C20.5025 19.9822 20.5025 19.5601 20.2421 19.2997L16.9428 16.0004L20.243 12.7001C20.5034 12.4397 20.5034 12.0176 20.243 11.7573C19.9827 11.4969 19.5606 11.4969 19.3002 11.7573L15.9999 15.0576L12.6997 11.7573C12.4393 11.4969 12.0172 11.4969 11.7568 11.7573C11.4965 12.0176 11.4965 12.4397 11.7568 12.7001L15.0571 16.0004L11.7578 19.2997C11.4974 19.5601 11.4974 19.9822 11.7578 20.2426C12.0181 20.5029 12.4402 20.5029 12.7006 20.2426L15.9999 16.9432L19.2993 20.2426C19.5597 20.5029 19.9818 20.5029 20.2421 20.2426Z"
                            fill="#19cf86"
                        />
                      </svg>
                      <span class="text-base font-medium">2 Gb</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div :class="{'text-white dark:text-white bg-[#19cf86]': activeSubscription.plan_code === 'MEDIUM_YEARLY', 'bg-white dark:text-black': activeSubscription.plan_code !== 'MEDIUM_YEARLY'}"
                class="flex h-full max-w-[378px] flex-col rounded-xl py-6 px-5 sm:px-10 lg:w-auto xl:w-[378px]">
              <div class="flex flex-col text-left">
                <div class="flex flex-col gap-3">
                  <span class="text-[22px]">Medium</span>
                  <span>
            Ideal for individuals who need small to store medium amount of data.
          </span>
                </div>
                <div class="my-4 flex items-center gap-3">
                  <span class="text-[56px] font-semibold">50 sc</span>
                  <span class="font-normal">/ Month</span>
                </div>
                <button v-if="activeSubscription.plan_code !== 'MEDIUM_YEARLY'" class="w-full rounded border-[1px] border-[#19cf86] py-2.5 text-[#19cf86]" @click="paySubscription('MEDIUM_YEARLY')">
                  Get Started Now
                </button>
                <div class="mt-10 space-y-3">
                  <div class="flex items-center gap-4">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="32" height="32" rx="16" fill="#E8EDFB"/>
                      <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M21.8162 12.207C22.0701 12.4737 22.0597 12.8957 21.793 13.1495L14.0893 20.4829C13.9577 20.6081 13.7808 20.6742 13.5993 20.666C13.4179 20.6577 13.2477 20.5758 13.128 20.4391L10.1651 17.0545C9.92254 16.7775 9.95052 16.3563 10.2276 16.1138C10.5046 15.8713 10.9258 15.8992 11.1683 16.1763L13.6734 19.0379L20.8737 12.1838C21.1404 11.9299 21.5624 11.9403 21.8162 12.207Z"
                          fill="#19cf86"
                      />
                    </svg>
                    <span class="text-base font-medium">500 Mb</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="32" height="32" rx="16" fill="#E8EDFB"/>
                      <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M21.8162 12.207C22.0701 12.4737 22.0597 12.8957 21.793 13.1495L14.0893 20.4829C13.9577 20.6081 13.7808 20.6742 13.5993 20.666C13.4179 20.6577 13.2477 20.5758 13.128 20.4391L10.1651 17.0545C9.92254 16.7775 9.95052 16.3563 10.2276 16.1138C10.5046 15.8713 10.9258 15.8992 11.1683 16.1763L13.6734 19.0379L20.8737 12.1838C21.1404 11.9299 21.5624 11.9403 21.8162 12.207Z"
                          fill="#19cf86"
                      />
                    </svg>
                    <span class="text-base font-medium">1 Gb</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="32" height="32" rx="16" fill="#F7F8F9"/>
                      <path
                          d="M20.2421 20.2426C20.5025 19.9822 20.5025 19.5601 20.2421 19.2997L16.9428 16.0004L20.243 12.7001C20.5034 12.4397 20.5034 12.0176 20.243 11.7573C19.9827 11.4969 19.5606 11.4969 19.3002 11.7573L15.9999 15.0576L12.6997 11.7573C12.4393 11.4969 12.0172 11.4969 11.7568 11.7573C11.4965 12.0176 11.4965 12.4397 11.7568 12.7001L15.0571 16.0004L11.7578 19.2997C11.4974 19.5601 11.4974 19.9822 11.7578 20.2426C12.0181 20.5029 12.4402 20.5029 12.7006 20.2426L15.9999 16.9432L19.2993 20.2426C19.5597 20.5029 19.9818 20.5029 20.2421 20.2426Z"
                          fill="#19cf86"
                      />
                    </svg>
                    <span class="text-base font-medium">2 Gb</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="h-full max-w-[378px] rounded-xl lg:w-auto xl:w-[378px]" :class="{'text-white dark:text-white bg-[#19cf86]': activeSubscription.plan_code === 'LARGE_YEARLY', 'bg-white dark:text-black': activeSubscription.plan_code !== 'LARGE_YEARLY'}">
              <div class="flex h-full flex-col rounded-xl border border-gray-500 py-6 px-5 sm:px-10 lg:border-none">
                <div class="flex flex-col text-left">
                  <div class="flex flex-col gap-3">
                    <span class="text-[22px]">Large</span>
                    <span>
              Ideal for individuals who need small to store large amount of data.
            </span>
                  </div>
                  <div class="my-4 flex items-center gap-3">
                    <span class="text-[56px] font-semibold">100 sc</span>
                    <span class="font-normal">/ Month</span>
                  </div>
                  <button v-if="activeSubscription.plan_code !== 'LARGE_YEARLY'" class="w-full rounded border-[1px] border-[#19cf86] py-2.5 text-[#19cf86]" @click="paySubscription('LARGE_YEARLY')">
                    Get Started Now
                  </button>
                  <div class="mt-10 space-y-3">
                    <div class="flex items-center gap-4">
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="32" height="32" rx="16" fill="#E8EDFB"/>
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M21.8162 12.207C22.0701 12.4737 22.0597 12.8957 21.793 13.1495L14.0893 20.4829C13.9577 20.6081 13.7808 20.6742 13.5993 20.666C13.4179 20.6577 13.2477 20.5758 13.128 20.4391L10.1651 17.0545C9.92254 16.7775 9.95052 16.3563 10.2276 16.1138C10.5046 15.8713 10.9258 15.8992 11.1683 16.1763L13.6734 19.0379L20.8737 12.1838C21.1404 11.9299 21.5624 11.9403 21.8162 12.207Z"
                            fill="#19cf86"
                        />
                      </svg>
                      <span class="text-base font-medium">500 Mb</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="32" height="32" rx="16" fill="#E8EDFB"/>
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M21.8162 12.207C22.0701 12.4737 22.0597 12.8957 21.793 13.1495L14.0893 20.4829C13.9577 20.6081 13.7808 20.6742 13.5993 20.666C13.4179 20.6577 13.2477 20.5758 13.128 20.4391L10.1651 17.0545C9.92254 16.7775 9.95052 16.3563 10.2276 16.1138C10.5046 15.8713 10.9258 15.8992 11.1683 16.1763L13.6734 19.0379L20.8737 12.1838C21.1404 11.9299 21.5624 11.9403 21.8162 12.207Z"
                            fill="#19cf86"
                        />
                      </svg>
                      <span class="text-base font-medium">1 Gb</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="32" height="32" rx="16" fill="#E8EDFB"/>
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M21.8162 12.207C22.0701 12.4737 22.0597 12.8957 21.793 13.1495L14.0893 20.4829C13.9577 20.6081 13.7808 20.6742 13.5993 20.666C13.4179 20.6577 13.2477 20.5758 13.128 20.4391L10.1651 17.0545C9.92254 16.7775 9.95052 16.3563 10.2276 16.1138C10.5046 15.8713 10.9258 15.8992 11.1683 16.1763L13.6734 19.0379L20.8737 12.1838C21.1404 11.9299 21.5624 11.9403 21.8162 12.207Z"
                            fill="#19cf86"
                        />
                      </svg>
                      <span class="text-base font-medium">2 Gb</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      <div class="wallet-button-wrapper">
        <div class="wallet-buttons">
          <button class="btn wallet-btn" @click="modal='send'" v-if="wallet.type !== 'watch'">{{ 'Send' }}</button>
          <button class="btn wallet-btn" @click="modal='receive'">{{ 'Receive' }}</button>
          <div class="wallet-more-btn">
            <button class="more-btn" @click="showMore = !showMore">
              <font-awesome-icon icon="ellipsis-vertical"/>
            </button>
            <transition name="fade-top" mode="out-in">
              <div class="dropdown" v-if="showMore">
                <button class="dropdown-item" @click="onQueueWallet"
                        :disabled="walletQueued">
                  <font-awesome-icon icon="arrow-rotate-right"/>
                  {{ 'Rescan Wallet' }}
                </button>

              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <div class="wallet-transactions">
      <table class="transactions-grid">
        <tbody>
        <template v-for="group in transactions" :key="group.date">
          <tr class="group-date">
            <td colspan="4">{{ group.date }}</td>
          </tr>
          <transaction-list-item v-for="(transaction, i) in group.transactions"
                                 :key="`${group.date}-${i}`"
                                 :transaction="transaction"
                                 :wallet="wallet"
                                 @click="onSelectTransaction(transaction.transaction_id)"/>
        </template>
        </tbody>
      </table>
    </div>
    <transition name="fade" mode="out-in" appear>
      <send-siacoin-modal v-if="modal === 'send'"
                          :wallet="wallet"
                          :subscription="subscriptionName"
                          :address="CONFIG.SUBSCRIPTION_PAY_ADDRESS"
                          @close="onClose()"/>
      <select-wallet-modal
          v-else-if="modal === 'wallet'"
          :wallets="wallets"
          :active="active"
          @selected="(i) => $emit('selected', i)"
          @close="modal = null"/>
    </transition>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WalletDisplay',
};
</script>

<script setup lang="ts">

import BigNumber from 'bignumber.js';
import {formatPriceString, formatSiafundString, formatExchangeRate} from '~/utils/format';
import {defineProps, onMounted} from "vue";
import Wallet from "~/types/wallet";
import {useWalletsStore} from "~/store/wallet";
import TransactionListItem from "~/components/wallet/transactions/TranscationListItem.vue";
import SelectWalletModal from "~/components/wallet/modals/SelectWalletModal.vue";
import {CONFIG} from "~/env";

import {useUserStore} from "~/store/user";
import {storeToRefs} from "pinia";
const props = defineProps<{
  wallets: Wallet[],
  wallet: Wallet,
  active: string | null
}>();

const modal = ref(''), selectedTransaction = ref(null), showMore = ref(false), subscriptionName = ref('');

const userStore = useUserStore();
const { userSubscriptions, activeSubscription } = storeToRefs(userStore)
const { loadSubscriptions } = userStore;

const {exchangeRateSC, exchangeRateSF, settings, scanQueue, queueWallet, pushNotification} = useWalletsStore()

onMounted(async () => {
  loadSubscriptions(props.wallet.id)
})

const walletQueued = computed(() => {
  return props.wallet.scanning === 'full' || scanQueue.filter(s => s.walletID === props.wallet.id && s.full).length !== 0;
});

const siacoinBalance = computed(() => {
  let value = new BigNumber(0);

  if (props.wallet)
    value = props.wallet.unconfirmedSiacoinBalance();

  return value;
});

const siafundBalance = computed(() => {
  let value = new BigNumber(0);

  if (props.wallet)
    value = props.wallet.unconfirmedSiafundBalance();

  return value;
});

const claimBalance = computed(() => {
  if (!props.wallet)
    return new BigNumber(0);

  return props.wallet.siafundClaimBalance();
});

const outputsLen = computed(() => {
  const outputs = props.wallet && Array.isArray(props.wallet.unspent_siacoin_outputs) ? props.wallet.unspent_siacoin_outputs : [],
      spent = props.wallet && Array.isArray(props.wallet.spent_siacoin_outputs) ? props.wallet.spent_siacoin_outputs : [],
      filtered = outputs.filter(o => spent.indexOf(o.output_id) === -1);

  return filtered.length;
});

const name = computed(() => {
  if (!props.wallet || !props.wallet.title || props.wallet.title.length === 0)
    return 'Wallet';

  return props.wallet.title;
});

const walletTransactions = computed(() => {
  const transactions = props.wallet ? props.wallet.transactions : null;

  if (!Array.isArray(transactions))
    return [];

  return transactions.reduce((v, t) => {
    v[t.transaction_id] = t;

    return v;
  }, {});
});

const transactions = computed(() => {
  const transactions = props.wallet ? props.wallet.transactions : null,
      groupedTxns = [];

  if (!Array.isArray(transactions))
    return [];

  const days = transactions.reduce((m, t) => {
    const d = new Date(t.timestamp).toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (!m[d])
      m[d] = [];

    m[d].push({
      ...t,
      timestamp: new Date(t.timestamp)
    });

    return m;
  }, {});

  for (const date in days) {
    groupedTxns.push({
      date: date,
      transactions: days[date]
    });
  }

  groupedTxns.sort((a, b) => {
    const ad = new Date(a.date),
        bd = new Date(b.date);

    if (ad > bd)
      return -1;

    if (ad < bd)
      return 1;

    return 0;
  });

  return groupedTxns;
});

const formatSiacoinString = (val) => {
  const format = formatPriceString(val, 2, props.wallet.currency, 1, props.wallet.precision());

  return `${format.value} <span class="currency-display">${format.label}</span>`;
}
// const formatSiafundString = (val) => {
//   const format = formatSiafundString(val, props.wallet.currency);
//
//   return `${format.value} <span class="currency-display">${`settings?.currency.${format.label}`}</span>`;
// }

const formatCurrencyString = (val) => {
  let exchangeRate = exchangeRateSC;

  // if (props.wallet.currency && props.wallet.currency === 'scp')
  //   exchangeRate = exchangeRateSCP;

  const format = formatPriceString(val, 2, settings?.currency, exchangeRate[settings?.currency], props.wallet.precision());

  return `${format.value} <span class="currency-display">${format.label} @ ${formatExchangeRate(exchangeRate[settings?.currency], settings?.currency, 'never')}</span>`;
}

const onQueueWallet = () => {
  try {
    queueWallet(props.wallet.id, true);

    pushNotification({
      icon: 'arrow-rotate-right',
      message: 'Rescan Wallet'
    });
  } catch (ex) {
    pushNotification({
      severity: 'danger',
      icon: 'arrow-rotate-right',
      message: ex.message
    });
    console.error('onQueueWallet', ex);
  } finally {
    showMore.value = false;
  }
}

const onSelectTransaction = (id) => {
  try {
    if (!walletTransactions.value[id] || props.wallet.server_type === 'walrus')
      return;

    selectedTransaction.value = id;
    modal.value = 'transaction';
  } catch (ex) {
    console.error(ex);
    pushNotification({
      severity: 'danger',
      message: ex.message
    });
  }
}

const paySubscription = (subscription) => {
  subscriptionName.value = subscription;
  console.log(subscriptionName.value)
  modal.value = 'send';
}

const onClose = () => {
  modal.value = '';
  loadSubscriptions(props.wallet.id)
}

</script>

<style lang="stylus" scoped>
@require "../../popup/styles/vars";

.wallet-title {
  position: relative;
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 30px;
  padding: 0 25px;

  .wallet-scanning {
    position: absolute;
    bottom: -25px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.2);

    svg {
      margin-right: 5px;
    }
  }
}

.wallet-display {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  grid-gap: 15px;
  width: 100%;
  height: 100%;
  //overflow: hidden;
  overflow-y: auto;
  overflow-x: hidden;
}

.btn-select {
  position: absolute;
  display: inline-block;
  right: 0;
  top: 3px;
  outline: none;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.54);

  @media screen and (min-width: 767px) {
    display: none;
  }
}

.wallet-balance {
  padding: 15px;
}

.wallet-btn {
  padding: 12px;
}

.wallet-more-btn {
  position: relative;
  display: inline-block;

  .more-btn {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.54);
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
  }

  .dropdown {
    display: inline-block;
    position: absolute;
    top: calc(100% + 20px);
    right: 0;
    background: bg-dark-accent;
    border-radius: 4px;
    border-top-right-radius: 0;
    z-index: 99;
    box-shadow: global-shadow;

    &:before {
      position: absolute;
      top: -8px;
      right: 3px;
      content: '';
      width: 16px;
      height: 16px;
      background: #25272a;
      -webkit-transform: rotateZ(45deg);
      transform: rotateZ(45deg);
      z-index: 98;
    }

    .dropdown-item {
      padding: 15px;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.54);
      white-space: nowrap;
      border: none;
      background: transparent;
      outline: none;
      cursor: pointer;

      svg {
        margin-right: 15px;
      }

      &:disabled {
        opacity: 0.28;
      }

      &:hover, &:active, &:focus {
        color: primary;
      }
    }
  }
}

.wallet-siacoin-balance {
  color: primary;
  font-size: 2.5rem;
  text-align: center;
}

.wallet-display-balance {
  color: rgba(255, 255, 255, 0.54);
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 15px;
}

.wallet-button-wrapper {
  margin: auto;
  max-width: 500px;
}

.wallet-buttons {
  display: flex;
  align-items: center;
  justify-items: center;

  .wallet-btn {
    flex: 1;
    margin-right: 15px;

    &:last-child {
      margin-right: 0;
    }
  }
}

.wallet-transactions {
  height: 100%;
  border-top: 1px solid bg-dark-accent;
  //overflow-x: hidden;
  //overflow-y: auto;

  .transactions-grid {
    padding: 15px;

    .group-date td {
      position: sticky;
      top: 0;
      padding: 15px;
      color: primary;
      background: bg-dark;
      text-align: left;
      z-index: 5;
    }

    .transaction-received {
      color: primary;
    }

    .transaction-confirms span {
      display: none;
      padding: 2px 4px;
      background: dark-gray;
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.54);
      text-align: center;
    }

    .transaction-unconfirmed {
      opacity: 0.45;

      .transaction-confirms span {
        display: inline-block;
      }
    }

    tr {
      color: rgba(255, 255, 255, 0.54);
      background: bg-dark;

      td {
        border-bottom: 1px solid bg-dark-accent;
        padding: 15px;
      }

      &:hover, &:focus, &:active {
        background: bg-dark-accent;
        cursor: pointer;
      }
    }

    .transaction-amount, .transaction-currency, .transaction-type {
      text-align: right;
    }

    .transaction-amount {
      font-size: 1.3rem;
    }

    .transaction-currency {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.54);
    }

    .transaction-spacer {
      width: 100%;
    }

    .transaction-type {
      text-align: left;
    }

    .group-date {
      width: 100%;
      grid-column: 1 / -1;
      color: rgba(255, 255, 255, 0.54);
      font-size: 1.1rem;
    }
  }
}
</style>
