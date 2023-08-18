<template>
  <modal @close="$emit('close')">
    <transition name="fade-top" mode="out-in" appear>
      <transaction-setup class="transaction-step" :wallet="wallet" :address="address" v-if="step === 'setup'" key="setup" @built="onTransactionBuilt" />
      <transaction-verify class="transaction-step" :wallet="wallet" :transaction="transaction" v-else-if="step === 'verify'" key="verify" @done="$emit('close')" />
    </transition>
  </modal>
</template>

<script lang="ts">
export default {
  name: 'SendSiacoinModal',
};
</script>


<script setup lang="ts">
  import Modal from "~/components/wallet/Modal.vue";
  import TransactionSetup from "~/components/wallet/transactions/send/TransactionSetup.vue";
  import TransactionVerify from "~/components/wallet/transactions/send/TransactionVerify.vue";
  import Wallet from "~/types/wallet";

  const props = defineProps({
    address: String,
    wallet: Wallet
  });

  const step = ref(''),
        transaction = ref(null),
        sigIndexes = ref([]);

  onMounted(() => {
    setTimeout(() => {
      step.value = 'setup';
    }, 300);

  });

  const 		onTransactionBuilt = (txn) => {
    try {
      transaction.value = txn;
      step.value = 'verify';
    } catch (ex) {
      console.error('onTransactionBuilt', ex);
      // this.pushNotification({
      //   severity: 'danger',
      //   message: ex.message
      // });
    }
  }
</script>

<style lang="stylus" scoped>
@require "../../../popup/styles/vars";
.transaction-step {
  display: grid;
  height: 100%;
  align-content: safe center;
}
</style>
