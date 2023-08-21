<template>
  <div class="page page-unlock">
    <div class="page-content">
      <div class="page-icon">
        <font-awesome-icon icon="lock"/>
      </div>
      <h2 class="text-center">{{ 'Unlock Wallet' }}</h2>
      <p>{{
          'Your wallets are currently encrypted and locked. Enter your password to unlock your wallets and access your funds.'
        }}</p>
      <form @submit.prevent="onUnlockWallets">
        <div class="control">
          <label>{{ 'Wallet Password' }}</label>
          <input type="password" v-model="password" autocomplete="current-password"/>
        </div>
        <div class="buttons">
          <button class="btn btn-success btn-inline" :disabled="unlocking">{{ 'Unlock' }}</button>
        </div>
      </form>


    </div>

  </div>
</template>

<script lang="ts">
export default {
  name: 'UnlockWallet',
};
</script>


<script setup lang="ts">

import {useWalletsStore} from "~/store/wallet";
import setAuthorizationToken from "~/plugins/set-authorization-token";
import {api, isFetchError} from "~/services";
import {ConsensusState} from "~/types/users";
import {routerPush} from "~/popup/router";
import {useUserStore} from "~/store/user";
import {onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import { pbkdf2 } from '~/utils/crypto';
import {hash} from "tweetnacl";
import {encode as encodeUTF8} from "@stablelib/utf8";
import { createUint8ArrayFromKeys } from '~/utils/index.js';

const store = useWalletsStore()
const {unlockWallets, pushNotification} = store
const {wallets} = storeToRefs(store)
const {user, updateUser} = useUserStore()

const password = ref('')
const unlocking = ref(false)
const errors = ref()

const selectedWallet = ref(null)

onMounted(() => {
  if (localStorage.getItem('lastSelectedWallet') || wallets.value.length > 0) {
    selectedWallet.value = localStorage.getItem('lastSelectedWallet') || wallets.value[0].id;
  }
})

const currentWallet = computed(() => {
  if (!Array.isArray(wallets.value))
    return null;

  const selected = wallets.value.filter(w => w.id === selectedWallet)[0];

  if (!selected)
    return wallets.value[0];

  return selected;
})

const onUnlockWallets = async () => {
  if (unlocking.value)
    return;

  unlocking.value = true;

  try {
    await unlockWallets(password.value);

    errors.value = {}

    try {
      const result = await api.service.login({user: {wallet: currentWallet.value.id, password: JSON.stringify(user?.unlockPassword)}})
      const { token } = result.data.user
      updateUser({unlockPassword: createUint8ArrayFromKeys(toRaw(user?.unlockPassword)), token: token as string})
    } catch (e) {
      if (isFetchError(e)) {
        const status = (e as Response).status

        if (status === 401) {
          try {
            const result = await api.service.register({user: {wallet: currentWallet.value.id, password: JSON.stringify(user?.unlockPassword)}})
            const {token} = result.data.user
            updateUser({unlockPassword: createUint8ArrayFromKeys(toRaw(user?.unlockPassword)), token: token as string})
          } catch (e) {
            if (isFetchError(e)) {
              const status = (e as Response).status
              if (status === 400) {
                errors.value = {
                  error: ['Error create user'],
                }
              } else {
                 errors.value = {
                  error: ['Error, something went wrong'],
                }
                console.error(e)
              }
            }
          }
        } else {
          errors.value = {
            error: ['Error, something went wrong'],
          }
          console.error(e)
        }
      }


    }

    pushNotification({
      icon: 'unlock',
      message: 'Wallets decrypted. Welcome back!'
    });
  } catch (ex) {
    pushNotification({
      severity: 'danger',
      icon: 'lock',
      message: 'Unable to decrypt wallets. Incorrect password'
    });
    console.error('onUnlockWallets', ex);
  } finally {
    unlocking.value = false;
  }
}

</script>

<style lang="stylus" scoped>
@require "../styles/vars";

.page-unlock {
  position: fixed;
  background: bg-dark;
  z-index: 99;
}

h2, p {
  margin: 0;
}

.page-icon {
  text-align: center;
  color: primary;

  svg {
    width: 48px;
    height: auto;
  }
}

.page-content {
  display: grid;
  height: 100%;
  max-width: 700px;
  margin: auto;
  padding: 15px;
  grid-gap: 30px;
  align-content: safe center;
  overflow-x: hidden;
  overflow-y: auto;
}

.text-secondary {
  color: rgba(255, 255, 255, 0.24);
}

.reset-button {
  color: rgba(255, 255, 255, 0.4);
  background: none !important;
  border: none !important;
  outline: none !important;
  cursor: pointer;
}
</style>
