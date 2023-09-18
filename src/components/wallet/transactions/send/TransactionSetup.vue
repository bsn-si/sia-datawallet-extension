<template>
  <div>
    <div class="identifier">
      <identicon :value="recipientAddress" />
    </div>
    <div class="control">
      <label>{{ 'Recipient Address' }}</label>
      <input type="text" v-model="recipientAddress" placeholder="Send Siacoin to..." />
    </div>
    <label>{{ 'Amount' }}</label>
    <div class="currency-control">
      <input ref="txtSiacoin" type="text" value="0 SC" @input="onChangeSiacoin" @blur="onFormatValues" />
      <label>{{ baseCurrencyLabel }}</label>
      <input ref="txtCurrency" type="text" value="$0.00" @input="onChangeCurrency" @blur="onFormatValues" />
      <label>{{ settings?.currency }}</label>
      <div class="transaction-buttons">
        <button class="btn btn-small btn-inline" @click="onSendHalf">{{ 'Half' }}</button>
        <button class="btn btn-small btn-inline" @click="onSendFull">{{ 'Full' }}</button>
      </div>
    </div>
    <div class="extras-info">
      <div>{{ 'Transaction Fee' }}</div>
      <div class="text-right" v-html="transactionFeeSC" />
      <div class="text-right" v-html="transactionFeeCurrency" />
      <div>{{ 'Remaining Balance' }}</div>
      <div class="text-right" v-html="remainingBalanceSC" />
      <div class="text-right" v-html="remainingBalanceCurrency" />
    </div>
    <div class="transaction-error text-center text-warning">
      <transition name="fade" mode="out-in" appear>
        <div v-if="transactionError" :key="transactionError">{{ transactionError }}</div>
        <div v-else class="error-hidden">hidden</div>
      </transition>
    </div>
    <div class="buttons">
      <button class="btn btn-success btn-inline" :disabled="transactionError || sending" @click="onSendTxn">{{ 'Send' }}</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TransactionSetup'
};
</script>


<script setup lang="ts">
  import Identicon from "~/components/wallet/Identicon.vue";
  import Wallet from "~/types/wallet";
  import {useWalletsStore} from "~/store/wallet";
  import BigNumber from "bignumber.js";
  import { calculateFee, verifyAddress } from '~/utils/index.js';
  import { parseCurrencyString, parseSiacoinString } from '~/utils/parse';
  import { formatPriceString } from '~/utils/format';
  import { getWalletAddresses } from '~/store/db';
  import {hash} from "tweetnacl";
  import {encode as encodeUTF8} from "@stablelib/utf8";
  import {storeToRefs} from "pinia";
  import {CONFIG} from "~/env";


  const props = defineProps({
    address: String,
    wallet: Wallet,
    subscription: String
  });

  interface Txn {
    change_index: number;
    miner_fees: string[];
    siacoin_inputs: never[];
    siacoin_outputs: never[];
  }

  interface Emits {
    (e: 'built', txn: Txn): void
  }
  const emit = defineEmits<Emits>()

  const { exchangeRateSC, exchangeRateSF, settings, siaNetworkFees} = storeToRefs(useWalletsStore())
  const { pushNotification } = useWalletsStore()

  const recipientAddress = ref(''),
      inputs = ref([]),
      sendAmount = ref(new BigNumber(0)),
      siaFee =  ref(new BigNumber(0)),
      apiFee = ref(new BigNumber(0)),
      sending = ref(false),
      ownedAddresses = ref([]);

  const txtSiacoin = ref(null);
  const txtCurrency = ref(null);

  onMounted(async () => {
    try {
      if (typeof props.address === 'string' && props.address.length > 0)
        recipientAddress.value = props.address;

      onFormatValues();
      await loadAddresses();

      if (typeof props.subscription === 'string' && props.subscription.length > 0) {
        if (props.subscription === 'small') {
          txtSiacoin.value.value = CONFIG.SUBSCRIPTION_SMALL;
        } else if (props.subscription === 'medium') {
          txtSiacoin.value.value = CONFIG.SUBSCRIPTION_MEDIUM;
        } else {
          txtSiacoin.value.value = CONFIG.SUBSCRIPTION_LARGE;
        }
        onChangeSiacoin();
      }

      console.log(props.wallet)

    } catch (ex) {
      console.error('TransactionSetupMounted', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    }
  });

  const baseCurrencyLabel = computed(() => {
    // if (props.wallet && props.wallet.currency === 'scp')
    //   return this.translate('currency.scp');

    return 'SC';
  })

  const networkFees = computed(() => {
    // if (props.wallet && props.wallet.currency === 'scp')
    //   return this.scprimeNetworkFees;

    return siaNetworkFees.value;
  })

  const walletBalance = computed(() => {
    return props.wallet.unconfirmedSiacoinBalance();
  })

  const changeAddress = computed(() => {
    let addr = ownedAddresses.value.find(a => a.usage_type !== 'sent');

    if (!addr)
      addr = ownedAddresses.value[ownedAddresses.value.length - 1];

    return addr;
  })
  const unspent = computed(() => {
    const outputs = props.wallet && Array.isArray(props.wallet.unspent_siacoin_outputs) ? props.wallet.unspent_siacoin_outputs : [],
        spent = props.wallet && Array.isArray(props.wallet.spent_siacoin_outputs) ? props.wallet.spent_siacoin_outputs : [],
        unspent = outputs.filter(o => spent.indexOf(o.output_id) === -1);

    if (!Array.isArray(unspent) || unspent.length === 0)
      return [];

    unspent.sort((a, b) => {
      a = new BigNumber(a.value);
      b = new BigNumber(b.value);

      if (a.gt(b))
        return -1;

      if (a.lt(b))
        return 1;

      return 0;
    });

    return unspent;
  })

  const fees = computed(() => {
    return siaFee.value.plus(apiFee.value);
  })

  const transactionFeeSC = computed(() => {
    const siacoins = formatPriceString(fees.value, 2, props.wallet.currency, 1, props.wallet.precision());

    return `${siacoins.value} <span class="currency-display">${siacoins.label}</span>`;
  })

  const transactionFeeCurrency = computed(() => {
    let exchangeRate = exchangeRateSC.value;

    // if (props.wallet.currency && props.wallet.currency === 'scp')
    //   exchangeRate = exchangeRateSCP.value;

    const currency = formatPriceString(fees.value, 2, settings?.value.currency, exchangeRate[settings?.value.currency], props.wallet.precision());

    return `${currency.value} <span class="currency-display">${currency.label}</span>`;
  })

  const calculatedAmount = computed(() => {
    let amount = sendAmount.value;

    if (ownedAddresses.value.indexOf(recipientAddress.value) !== -1)
      amount = new BigNumber(0);

    return amount;
  })

  const remainingBalanceSC = computed(() => {
    const rem = walletBalance.value.minus(calculatedAmount.value).minus(fees.value),
        siacoins = formatPriceString(rem, 2, props.wallet.currency, 1, props.wallet.precision());

    return `${siacoins.value} <span class="currency-display">${siacoins.label}</span>`;
  })

  const remainingBalanceCurrency = computed(() => {
    let exchangeRate = exchangeRateSC.value;

    // if (props.wallet.currency && props.wallet.currency === 'scp')
    //   exchangeRate = exchangeRateSCP.value;

    const rem = walletBalance.value.minus(calculatedAmount.value).minus(fees.value),
        currency = formatPriceString(rem, 2, settings?.value.currency, exchangeRate[settings?.value.currency], props.wallet.precision());

    return `${currency.value} <span class="currency-display">${currency.label}</span>`;
  })

  const transactionError = computed(() => {
    if (sendAmount.value.lte(0))
      return 'Must send more than 0 SC';

    if (sendAmount.value.plus(fees.value).gt(walletBalance.value))
      return 'Send amount more than balance';

    if (sendAmount.value.lt(fees.value))
      return 'Amount sent is less than transaction fees';

    if (!verifyAddress(recipientAddress.value))
      return 'Invalid recipient address';

    if (inputs.value.length >= 95)
      return "Transaction has too many inputs. Wallet needs to be defragmented before sending.";

    return null;
  })

  const loadAddresses = async () => {
    ownedAddresses.value = await getWalletAddresses(props.wallet.id);

    if (ownedAddresses.value.length === 0)
      throw new Error('no addresses');
  }

  const ownsAddress = (address) => {
    return ownedAddresses.value.findIndex(a => a.address === address && a.unlock_conditions) !== -1;
  }

  const calcTxnFees = (inputs) => {
    const sia = calculateFee(inputs, 3, new BigNumber(networkFees.value.minimum)),
        serverType = props.wallet?.server_type,
        walletType = props.wallet?.type,
        authed = false;//!!(process.env?.VUE_APP_SIACENTRAL_TOKEN?.length > 0);
    let api = new BigNumber(0);

    if (serverType === 'siacentral' && (walletType !== 'ledger' || !authed))
      api = calculateFee(inputs, 3, new BigNumber(networkFees.value.api.fee));

    return { sia, api, total: sia.plus(api) };
  }

  const addInputs = (amount) => {
    const inputs = [];
    let added = new BigNumber(0);

    for (let i = 0; i < unspent.value.length; i++) {
      const output = unspent.value[i],
          addr = ownedAddresses.value.find(a => output.unlock_hash === a.address && a.unlock_conditions);

      if (!addr)
        continue;

      added = added.plus(output.value);
      inputs.push({
        ...output,
        ...addr,
        owned: true
      });

      if (added.gte(amount))
        break;
    }

    if (inputs.length <= 5 && unspent.value.length >= 30) {
      for (let i = 1; i <= 10; i++) {
        const output = unspent.value[unspent.value.length - i],
            addr = ownedAddresses.value.find(a => output.unlock_hash === a.address && a.unlock_conditions);

        if (!addr)
          continue;

        added = added.plus(output.value);
        inputs.push({
          ...output,
          ...addr,
          owned: true
        });
      }
    }

    return inputs;
  }

  const fundTransactionWithFees = (amount) => {
    const minInputs = addInputs(amount),
        { sia, api } = calcTxnFees(minInputs.length);

    inputs.value = addInputs(amount.plus(sia).plus(api));
    siaFee.value = sia;
    apiFee.value = api;
  }

  const buildTransaction = () => {
    const added = inputs.value.reduce((v, i) => v.plus(i.value), new BigNumber(0)),
        txn = {
          change_index: 0,
          miner_fees: [siaFee.value.toString(10)],
          siacoin_inputs: inputs.value,
          siacoin_outputs: []
        },
        feeAddress = networkFees.value.api.address,
        change = added.minus(fees.value).minus(sendAmount.value);

    if (added.lt(sendAmount.value.plus(fees.value)))
      throw new Error('not enough confirmed funds to create transaction');

    txn.siacoin_outputs.push({
      unlock_hash: recipientAddress.value,
      value: sendAmount.value.toString(10),
      tag: 'Recipient',
      owned: ownsAddress(recipientAddress.value)
    });

    if (apiFee.value.gt(0)) {
      txn.siacoin_outputs.push({
        unlock_hash: feeAddress,
        value: apiFee.value.toString(10),
        tag: 'Broadcast Fee',
        owned: false
      });
    }

    if (change.gt(0)) {
      if (!changeAddress.value || !changeAddress.value.address || !verifyAddress(changeAddress.value.address))
        throw new Error('unable to send transaction. no change address');

      txn.change_index = changeAddress.value.index;
      txn.siacoin_outputs.push({
        unlock_hash: changeAddress.value.address,
        value: change.toString(10),
        tag: 'Change',
        owned: ownsAddress(changeAddress.value.address)
      });
    }

    return txn;
  }

  const formatCurrencyString = (value) => {
    let exchangeRate = exchangeRateSC.value;

    // if (props.wallet.currency && props.wallet.currency === 'scp')
    //   exchangeRate = exchangeRateSCP.value;

    return formatPriceString(value, 2, settings?.value.currency, exchangeRate[settings?.value.currency], props.wallet.precision()).value;
  }

  const onSendHalf = () => {
    try {
      const unspentTotal = unspent.value.reduce((v, u) => v.plus(u.value), new BigNumber(0));

      if (unspentTotal.eq(0)) {
        sendAmount.value = new BigNumber(0);
        return;
      }

      sendAmount.value = unspentTotal.div(2).dp(0, BigNumber.ROUND_DOWN);
      inputs.value = addInputs(sendAmount.value);

      const { sia, api } = calcTxnFees(inputs.value.length);

      siaFee.value = sia;
      apiFee.value = api;

      onFormatValues();
    } catch (ex) {
      console.error('onSendHalf', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    }
  }

  const onSendFull = () => {
    try {
      const { sia, api, total } = calcTxnFees(unspent.value.length),
          unspentTotal = unspent.value.reduce((v, u) => v.plus(u.value), new BigNumber(0));

      if (unspentTotal.eq(0) || unspentTotal.lt(total)) {
        sendAmount.value = new BigNumber(0);
        return;
      }

      siaFee.value = sia;
      apiFee.value = api;
      sendAmount.value = unspentTotal.minus(total);
      inputs.value = addInputs(unspentTotal);

      onFormatValues();
    } catch (ex) {
      console.error('onSendFull', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    }
  }

  const onSendTxn = async () => {
    if (sending.value)
      return;

    sending.value = true;

    try {
      emit('built', buildTransaction());
    } catch (ex) {
      console.error('onSendTxn', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    } finally {
      sending.value = false;
    }
  }

  const onFormatValues = () => {
    try {
      const siacoins = formatPriceString(sendAmount.value, 2, props.wallet.currency, 1, props.wallet.precision());

      txtCurrency.value.value = formatCurrencyString(sendAmount.value);
      txtSiacoin.value.value = siacoins.value;
    } catch (ex) {
      console.error('onFormatValues', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    }
  }

  const onChangeSiacoin = () => {
    try {
      const value = txtSiacoin.value.value,
          parsed = parseSiacoinString(value, props.wallet.precision());

      sendAmount.value = parsed;
      txtCurrency.value.value = formatCurrencyString(parsed);
      fundTransactionWithFees(sendAmount.value);
    } catch (ex) {
      console.error('onChangeSiacoin', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    }
  }

  const onChangeCurrency = () => {
    try {
      let exchangeRate = exchangeRateSC.value;

      // if (props.wallet.currency && props.wallet.currency === 'scp')
      //   exchangeRate = exchangeRateSCP.value;

      const value = txtCurrency.value.value,
          parsed = parseCurrencyString(value, exchangeRate[settings?.value.currency], props.wallet.precision()),
          siacoins = formatPriceString(parsed, 2, props.wallet.currency, 1, props.wallet.precision());

      sendAmount.value = parsed;
      txtSiacoin.value.value = siacoins.value;
      fundTransactionWithFees(sendAmount.value);
    } catch (ex) {
      console.error('onChangeCurrency', ex);
      pushNotification({
        severity: 'danger',
        message: ex.message
      });
    }
  }

  watch(() => props.address, (newAddress) => {
    if (typeof newAddress === 'string' && newAddress.length > 0) {
      recipientAddress.value = newAddress;
    }
  });

  watch(() => props.subscription, (newSubscription) => {
    console.log(props.subscription, newSubscription)
    if (typeof newSubscription === 'string' && newSubscription.length > 0) {
      if (newSubscription === 'small') {
        txtSiacoin.value.value = CONFIG.SUBSCRIPTION_SMALL;
      } else if (newSubscription === 'medium') {
        txtSiacoin.value.value = CONFIG.SUBSCRIPTION_MEDIUM;
      } else {
        txtSiacoin.value.value = CONFIG.SUBSCRIPTION_LARGE;
      }
      onChangeSiacoin();
    }
  });

</script>

<style lang="stylus" scoped>
@require "../../../../popup/styles/vars";
.currency-control {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: 15px;

  input, label {
    height: 36px;
    line-height: 36px;
    padding: 0 5px;
  }

  label {
    display: inline-block;
    color: rgba(255, 255, 255, 0.54);
    text-transform: uppercase;
    margin: 0;
  }

  input {
    display: block;
    width: 100%;
    font-size: 1.2rem;
    background: transparent;
    border: 1px solid dark-gray;
    color: rgba(255, 255, 255, 0.84);
    outline: none;
    text-align: right;

    &:first-of-type {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    &:last-of-type {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border-top: none;
    }
  }
}

.transaction-buttons {
  margin-top: 5px;
  text-align: right;

  .btn.btn-small {
    font-size: 0.8rem;

    &:last-child {
      margin-right: 0;
    }
  }
}

.extras-info {
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(2, auto);
  grid-gap: 10px;
  margin-bottom: 15px;
}

.transaction-error {
  margin-bottom: 15px;

  .error-hidden {
    opacity: 0;
  }
}

.identifier {
  width: 100px;
  margin: auto auto 30px;

  svg {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
}
</style>
