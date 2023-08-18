<template>
  <div class="page wallet-page">
    <wallet-list class="wallets-list"
                 :wallets="allWallets"
                 :active="selectedWallet"
                 @selected="onWalletSelected" />
    <div class="wallets-detail">
      <transition name="fade-top" mode="out-in">
        <wallet-display
            v-if="currentWallet"
            :wallet="currentWallet"
            :wallets="allWallets"
            :active="selectedWallet"
            :key="currentWallet.id"
            @selected="onWalletSelected" />
      </transition>
    </div>
  </div>
</template>
<script setup lang="ts">
  import {useWalletsStore} from "~/store/wallet";
  import {onMounted} from "vue";
  import WalletDisplay from "~/components/wallet/WalletDisplay.vue";
  import WalletList from "~/components/wallet/WalletList.vue";

  const { allWallets } = useWalletsStore()
  const selectedWallet = ref(null)

  onMounted(() => {
    selectedWallet.value = localStorage.getItem('lastSelectedWallet') || allWallets[0].id;
  })

  const currentWallet = computed(() => {
    if (!Array.isArray(allWallets))
      return null;

    const selected = allWallets.filter(w => w.id === selectedWallet)[0];

    if (!selected)
      return allWallets[0];

    return selected;
  })

  const onWalletSelected = async(id) => {
    try {
      selectedWallet.value = id;
      localStorage.setItem('lastSelectedWallet', id);
    } catch (ex) {
      console.error('onSelectWallet', ex);
      // pushNotification({
      //   severity: 'danger',
      //   message: ex.message
      // });
    }
  }

</script>

<style lang="stylus" scoped>
@require "../../popup/styles/vars";
.wallets-list {
  display: none;
  border-right: 2px solid primary;
  padding-bottom: 15px;

  @media screen and (min-width: 767px) {
    display: grid;
  }
}

.page.wallet-page {
  display: grid;
  overflow: hidden;

  @media screen and (min-width: 767px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.wallets-detail {
  height: 100%;
  overflow: hidden;
}
</style>
