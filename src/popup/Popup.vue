<template>
  <div class="page-wrapper">
      <unavailable-page v-if="typeof unavailable === 'string'" />
      <router-view v-if="setup && unlocked" />
      <setup-page v-else-if="!setup" />
      <unlock-wallet v-else />
  </div>
</template>

<script setup lang="ts">

  // import {useUserStore} from "~/store/user";
  import {routerPush} from "~/popup/router";
  import {useWalletsStore} from "~/store/wallet";
  import UnlockWallet from "~/popup/pages/UnlockWallet.vue";
  import SetupPage from "~/popup/pages/SetupPage.vue";
  import UnavailablePage from "~/popup/pages/UnavailablePage.vue";
  import {storeToRefs} from "pinia";

  // const userStore = useUserStore()

  const walletsStore = useWalletsStore()
  const { setup, unavailable, wallets } = storeToRefs(walletsStore)
  const { allWallets } = walletsStore;
  console.log('setup', setup)

  const unlocked = computed(() => Array.isArray(wallets.value) && wallets.value.length !== 0)
  console.log('unlocked', unlocked)

  // onMounted(async () => {
  //   if (!userStore.isAuthorized) return await routerPush('login')
  // })
</script>

<style lang="stylus">
@require "./styles/global";

.titlebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  z-index: 1000;

  button {
    display: none;
  }
}

#app {
  width: 100%;
  height: 100%;

  @media screen and (min-width: 767px) {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.page-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

body.linux {
  .titlebar {
    display: none;
  }
}

body.win32 {
  .titlebar {
    height: 32px;

    button {
      display: inline-block;
      width: 46px;
      height: 32px;
      text-align: center;
      border: none;
      outline: none;
      background: none;
      font-family: "Segoe MDL2 Assets";
      font-size: 10px;
      color: rgba(255, 255, 255, 0.84);
      cursor: pointer;
      float: right;
      -webkit-app-region: none;

      &:hover, &:active, &:focus {
        color: primary;
      }
    }
  }
}
</style>
