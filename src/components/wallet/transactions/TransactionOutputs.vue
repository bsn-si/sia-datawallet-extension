<template>
  <div class="transaction-outputs">
    <table>
      <tr class="header" v-if="inputs && inputs.length !== 0"><td colspan="5">{{ translate('inputs') }}</td></tr>
      <siacoin-output-list v-if="inputs && inputs.length !== 0" :wallet="wallet" :outputs="inputs" />
      <tr class="header" v-if="outputs && outputs.length !== 0"><td colspan="5">{{ translate('outputs') }}</td></tr>
      <siacoin-output-list v-if="outputs && outputs.length !== 0" :wallet="wallet" :outputs="outputs" />
    </table>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TransactionOutputs',
};
</script>

<script setup lang="ts">
import SiacoinOutputList from "~/components/wallet/transactions/SiacoinOutputList.vue";
</script>

<style lang="stylus">
@require "../../../popup/styles/vars";
.transaction-outputs.transaction-outputs {
  padding: 7px;
  background: bg-dark;
  overflow: hidden;

  table tbody tr {
    background: bg-dark;
  }

  tr.header {
    td {
      text-align: left;
      color: rgba(255, 255, 255, 0.54);
      z-index: 5;
    }
  }
}
</style>
