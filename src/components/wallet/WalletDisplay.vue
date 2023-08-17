<template>
  <div class="wallet-display">
    <div class="wallet-balance">
      <div class="wallet-title">{{ name }} <button class="btn-select" @click="modal = 'wallet'"><font-awesome-icon icon="chevron-down" /></button>
        <transition name="fade" mode="out-in">
          <div class="wallet-scanning" v-if="wallet.scanning === 'full'" key="scanning">
            <font-awesome-icon icon="redo" /> {{ 'Scanning...' }}
          </div>
          <div class="wallet-scanning" v-else-if="walletQueued" key="queued">
            <font-awesome-icon icon="redo" /> {{ 'Scan Queued...' }}
          </div>
        </transition>
      </div>
      <div class="wallet-siacoin-balance" v-html="formatSiacoinString(siacoinBalance)"></div>
      <div class="wallet-display-balance" v-html="formatCurrencyString(siacoinBalance)"></div>
      <siafund-balance :siafunds="siafundBalance" :claim="claimBalance" :wallet="wallet" v-if="siafundBalance.gt(0)" />
      <div class="wallet-button-wrapper">
        <div class="wallet-buttons">
          <button class="btn wallet-btn" @click="modal='send'" v-if="wallet.type !== 'watch'">{{ 'Send' }}</button>
          <button class="btn wallet-btn" @click="modal='receive'">{{ 'Receive' }}</button>
          <div class="wallet-more-btn">
            <button class="more-btn" @click="showMore = !showMore"><font-awesome-icon icon="ellipsis-v" /></button>
            <transition name="fade-top" mode="out-in">
              <div class="dropdown" v-if="showMore">
                <button class="dropdown-item" @click="onQueueWallet"
                        :disabled="walletQueued">
                  <font-awesome-icon icon="redo" />{{ 'Rescan Wallet' }}</button>

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
          <tr class="group-date" ><td colspan="4">{{ group.date }}</td></tr>

        </template>
        </tbody>
      </table>
    </div>
    <transition name="fade" mode="out-in" appear>


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
  import { formatPriceString, formatSiafundString, formatExchangeRate } from '~/utils/format';
  import {defineProps} from "vue";
  import Wallet from "~/types/wallet";
  import {useWalletsStore} from "~/store/wallet";

  const props = defineProps<{
    wallets: Wallet[],
    wallet: Wallet,
    active: string | null
  }>();

  const modal = ref(''), selectedTransaction = ref(null), showMore = ref(false);

  const { exchangeRateSC, exchangeRateSF, settings, scanQueue, queueWallet} = useWalletsStore()

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

      // this.pushNotification({
      //   icon: 'redo',
      //   message: this.translate('alerts.rescanWallet')
      // });
    } catch (ex) {
      // this.pushNotification({
      //   severity: 'danger',
      //   icon: 'redo',
      //   message: ex.message
      // });
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
      // this.pushNotification({
      //   severity: 'danger',
      //   message: ex.message
      // });
    }
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
  overflow: hidden;
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
  overflow-x: hidden;
  overflow-y: auto;

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
