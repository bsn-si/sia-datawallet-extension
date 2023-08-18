<template>
  <div class="transaction-totals">
    <template v-if="mode === 'outputs'">
      <div>{{ translate('minerFee') }}</div>
      <div class="text-right" v-html="getSiacoin(minerFees)" />
      <div class="text-right" v-html="getCurrency(minerFees)" />
    </template>
    <template v-else>
      <div>{{ translate('transactionFee') }}</div>
      <div class="text-right" v-html="getSiacoin(fees)" />
      <div class="text-right" v-html="getCurrency(fees)" />
    </template>
    <div class="divider" />
    <div>{{ translate('sendSiacoinsModal.spent') }}</div>
    <div class="text-right" v-html="getSiacoin(spentAmount)" />
    <div class="text-right" v-html="getCurrency(spentAmount)" />
    <div>{{ translate('sendSiacoinsModal.remainingBalance') }}</div>
    <div class="text-right" v-html="getSiacoin(walletBalance)" />
    <div class="text-right" v-html="getCurrency(walletBalance)" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'TransactionTotals',
};
</script>


<script setup lang="ts">
</script>

<style lang="stylus" scoped>
@require "../../../../popup/styles/vars";
.transaction-totals {
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(2, auto);
  grid-gap: 10px;
  margin-bottom: 15px;

  .divider {
    width: 100%;
    height: 1px;
    grid-column: 1 / -1;
    background: dark-gray;
    margin: 5px 0;
  }
}
</style>
