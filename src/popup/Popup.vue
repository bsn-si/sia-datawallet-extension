<template>
  <primary-nav />
  <div class="page-wrapper">
      <unavailable-page v-if="typeof unavailable === 'string'" />
      <router-view v-if="setup && unlocked" />
      <setup-page v-else-if="!setup" />
      <unlock-wallet v-else-if="!isAuthorized" />
  </div>
  <notification-queue />
</template>

<script setup lang="ts">

  import {useUserStore, userStorage} from "~/store/user";
  import {routerPush} from "~/popup/router";
  import {useWalletsStore} from "~/store/wallet";
  import UnlockWallet from "~/popup/pages/UnlockWallet.vue";
  import SetupPage from "~/popup/pages/SetupPage.vue";
  import UnavailablePage from "~/popup/pages/UnavailablePage.vue";
  import {storeToRefs} from "pinia";
  import PrimaryNav from "~/components/wallet/PrimaryNav.vue";
  import NotificationQueue from "~/components/wallet/NotificationQueue.vue";
  import { onMessage, sendMessage } from "webext-bridge/popup";

  const userStore = useUserStore()
  const { user, isAuthorized } = storeToRefs(userStore)

  const walletsStore = useWalletsStore()
  const { setup, unavailable, wallets } = storeToRefs(walletsStore)
  const { lockWallets, pushNotification, settings  } = walletsStore;
  console.log('setup', setup)

  const autoLockTimeout = ref(null)

  const unlocked = computed(() => Array.isArray(wallets.value) && wallets.value.length !== 0)
  console.log('unlocked', unlocked)

  onMounted(async () => {
    window.addEventListener('mousemove', resetAutoLock);
  })


  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', resetAutoLock);
  })

  const resetAutoLock = () => {
    let lockms = settings?.autoLock * 60000;

    if (lockms <= 0)
      lockms = 60000;

    clearTimeout(autoLockTimeout.value);

    autoLockTimeout.value = setTimeout(() => {
      if (!unlocked.value)
        return;

      lockWallets();
      pushNotification({
        message: 'Wallets automatically locked due to inactivity'
      });
    }, lockms);

    sendMessage(
        'reset-autolock',
        [],
        'background'
    );
  }

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
  position: absolute;
  top: 0;
  left: 75px;
  right: 0;
  bottom: 0;
  width: calc(100% - 75px);
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
