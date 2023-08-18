<template>
  <div class="transaction-summary">
    <div class="transaction-outputs">
      <table>
        <siacoin-output-list v-if="direction === 'send'" :wallet="wallet" :outputs="recipients" />
        <siacoin-output-list v-else :wallet="wallet" :outputs="received" />
      </table>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TransactionSummary',
};
</script>


<script setup lang="ts">
  import SiacoinOutputList from "~/components/wallet/transactions/SiacoinOutputList.vue";
</script>


<style lang="stylus" scoped>
@require "../../../popup/styles/vars";
.transaction-outputs.transaction-outputs {
  padding: 7px;
  background: bg-dark;
  overflow: hidden;

  table tbody tr {
    background: bg-dark;
  }
}
</style>
