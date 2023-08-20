<template>
  <div class="page page-setup">
    <div class="setup-step" v-if="step === 'password'">
      <div class="setup-icon">
        <img src="/assets/siacentral.svg"/>
      </div>
      <h2>{{ 'Get Started' }}</h2>
      <div class="setup-content">
        <p>{{
            "Set a secure password to encrypt your wallets with. This password will be required to unlock, create, and recover your wallets. All wallet seeds are encrypted, stored locally and never leave the device."
          }}</p>
        <div class="control">
          <label>{{ "Unlock Password" }}</label>
          <input type="password" v-model="form.unlockPassword" autocomplete="new-password" @input="onCheckPassword"
                 @blur="onCheckPassword"/>
        </div>
        <div class="control">
          <label>{{ "Confirm Password" }}</label>
          <input type="password" v-model="form.confirmPassword" autocomplete="new-password" @input="onCheckPassword"
                 @blur="onCheckPassword"/>
          <div class="text-error text-small" v-if="!form.passwordsMatch">
            {{ "Unlock password does not match. Check your passwords and try again." }}
          </div>
        </div>
        <div class="buttons">
          <button class="btn btn-success btn-inline" @click="onSetPassword" :disabled="!enableNext">{{
              "Next"
            }}
          </button>
        </div>
      </div>
    </div>
    <div class="wallet-step wallet-mode" v-if="step === 'choose'" key="pickMode">
      <div class="create-wallet-button" @click="onClickWalletType('create')">
        <div class="button-icon">
          <font-awesome-icon icon="plus"/>
        </div>
        <div class="button-title">{{ "New Wallet" }}</div>
        <p>{{ "Generates a new wallet seed in the browser. Transactions can be sent and received." }}</p>
      </div>
      <div class="create-wallet-button" @click="onClickWalletType('recover')">
        <div class="button-icon">
          <font-awesome-icon icon="arrow-rotate-right"/>
        </div>
        <div class="button-title">{{ "Recover Wallet" }}</div>
        <p>{{ "Recovers an existing wallet from a 29 seed. Transactions can be sent and received." }}</p>
      </div>
    </div>
    <div class="setup-step" v-if="step ==='create'">
      <div class="control">
        <label>{{ "Wallet Name" }}</label>
        <input type="text" placeholder="Wallet" v-model="walletName"/>
      </div>

      <template v-if="createType === 'recover'">
        <div class="control">
          <label>{{ "Recovery Seed" }}</label>
          <textarea v-model="recoverySeed"/>
        </div>
      </template>
      <div class="buttons">
        <button class="btn btn-success btn-inline"
                @click="onCreateWallet" :disabled="creating">{{ createType === 'recover' ? 'Recover' : 'Generate' }}
        </button>
      </div>
    </div>
    <div class="wallet-step"  v-if="step ==='review'">
      <p v-if="createType === 'recover'">Your wallet has been successfully recovered. The blockchain is now being
        scanned for balance and transactions. Backup your recovery seed to a safe location, without your seed your funds
        cannot be recovered.</p>
      <p v-else>A new wallet has been created. Backup your recovery seed to a safe location, without your seed your
        funds cannot be recovered.</p>
      <template v-if="walletType === 'default'">
        <div class="control">
          <label>{{ "Recovery Seed" }}</label>
          <textarea v-model="wallet.seed"
                    class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    readonly/>
        </div>
        <div class="control">
          <input type="checkbox" id="chkSeedExported" v-model="exported"/>
          <label for="chkSeedExported">{{ "My recovery seed is saved in a secure location" }}</label>
        </div>
      </template>
      <div class="controls">
        <button class="btn btn-success btn-inline"
                @click="onWalletCreated" :disabled="doneDisabled">{{ "Done" }}
        </button>
      </div>
    </div>

  </div>

</template>

<script lang="ts">
export default {
  name: 'SetupPage',
};
</script>


<script setup lang="ts">
import {routerPush} from '~/popup/router'
import {api, isFetchError} from '~/services'
import {useUserStore} from '~/store/user'
import {useWalletsStore} from '~/store/wallet'
import {reactive, ref} from 'vue'
import setAuthorizationToken from '~/plugins/set-authorization-token'
import {ConsensusState} from "~/types/users";
import {generateSeed, generateAddresses} from '~/sia/index.js';
import {hash} from 'tweetnacl';
import {encode as encodeUTF8} from '@stablelib/utf8';
import {saveAddresses} from '~/store/db.js';

interface LoginUser {
  confirmPassword: string;
  passwordsMatch: boolean;
  unlockPassword: string;
}


const formRef = ref<HTMLFormElement | null>(null)
const form: LoginUser = reactive({
  unlockPassword: '',
  confirmPassword: '',
  passwordsMatch: true,
})

const step = ref('password'), createType = ref('create'),
    walletName = ref(''),
    recoverySeed = ref(''),
    currencyType = ref('sc'),
    seedType = ref('sia'),
    serverType = ref('siacentral'), creating = ref(false), saving = ref(false), exported = ref(false);

let wallet = reactive({
  id: '',
  seed: '',
  title: '',
  currency: '',
  type: '',
  server_type: '',
  server_url: null
})

const {pushNotification} = useWalletsStore()

let addresses = []


const enableNext = computed(() => {
  return form.unlockPassword.length > 0 && form.unlockPassword === form.confirmPassword;
})

const walletType = computed(() => {
  return wallet && typeof wallet.type === 'string' ? wallet.type : 'watch';
})

const doneDisabled = computed(() => {
  // disable the done button if the wallet is being saved, or has not been exported
  return saving.value || (!exported.value && walletType.value === 'default');
})

const {updateUser} = useUserStore()
const {createWallet, queueWallet, setSetup} = useWalletsStore()


const onCheckPassword = () => {
  try {
    form.passwordsMatch = form.confirmPassword === form.unlockPassword;
  } catch (ex) {
    console.error('onCheckPassword', ex);
  }
}

const onSetPassword = () => {
  try {
    if (form.unlockPassword.length === 0 || form.unlockPassword !== form.confirmPassword)
      return;

    updateUser({unlockPassword: hash(encodeUTF8(form.unlockPassword))})
    // this.step = 1;
    step.value = 'choose';
  } catch (ex) {
    console.error('onSetPassword', ex);
    pushNotification({
      severity: 'danger',
      icon: 'wallet',
      message: ex.message
    });
  }
}

const onClickWalletType = (type: string) => {
  try {
    step.value = 'create';
    createType.value = type;
  } catch (ex) {
    console.error('onClickWalletType', ex);
    pushNotification({
      message: ex.message,
      severity: 'danger'
    });
  }
}

const generateWalletSeed = async () => {
  let seed;

  switch (createType.value) {
    case 'recover':
      await generateAddresses(unref(recoverySeed), unref(currencyType), 0, 1);
      seed = recoverySeed;
      break;
    default:
      seed = await generateSeed(unref(seedType));
      await generateAddresses(unref(seed), unref(currencyType), 0, 1);
      break;
  }

  return seed;
}

const onCreateWallet = async () => {
  if (creating.value)
    return;

  creating.value = true;

  try {
    const seed = await generateWalletSeed();
    wallet = {
      seed: unref(seed),
      title: unref(walletName),
      currency: unref(currencyType),
      type: 'default',
      server_type: unref(serverType),
      server_url: null
    };
    console.log(wallet);

    await saveWallet()

    step.value = 'review';
  } catch (ex) {
    console.error('onCreateWallet', ex);
    pushNotification({
      severity: 'danger',
      message: ex.message
    });
  } finally {
    creating.value = false;
  }
}

const saveWallet = async () => {
  const {user} = useUserStore()
  if (saving.value)
    return;

  saving.value = true;

  try {
    const walletID = await createWallet(wallet, user?.unlockPassword);

    wallet.id = walletID;

    addresses = await generateAddresses(wallet.seed, wallet.currency, 0, 10);


    await saveAddresses(addresses.map(a => ({
      ...a,
      wallet_id: walletID
    })));

    queueWallet(wallet.id, true);
  } catch (ex) {
    console.error('saveWallet', ex);
    pushNotification({
      message: ex.message,
      severity: 'danger'
    });
  } finally {
    saving.value = false;
  }
}

const onWalletCreated = async () => {
  try {
    setSetup(true);

    await routerPush('wallets')
  } catch (ex) {
    console.error('onWalletCreated', ex);
    pushNotification({
      severity: 'danger',
      icon: 'wallet',
      message: ex.message
    });
  }
}

</script>

<style lang="stylus" scoped>
@require "../styles/vars";

.page-setup {
  padding-left: 15%;
  padding-right: 15%;
  position: fixed;
  background: bg-dark;
  z-index: 99;
}

h2 {
  margin: 0;
  text-align: center;
  color: primary;
}

p {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.setup-step {
  display: grid;
  height: 100%;
  max-width: 700px;
  margin: auto;
  padding: 50px 15px;
  grid-gap: 15px;
  align-content: safe center;
}

.setup-icon {
  width: 64px;
  height: auto;
  margin: auto;
}

.setup-content {
  overflow-x: hidden;
  overflow-y: auto;
}

.extra-links {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  text-align: center;

  a {
    color: rgba(255, 255, 255, 0.54);
    margin: 0 15px;

    svg {
      width: 28px;
      height: auto;

      g path {
        stroke: rgba(255, 255, 255, 0.54) !important;
      }
    }
  }
}

.header {
  padding: 15px;
  text-align: center;
  grid-column: 1 / -1;
}

.wallet-step {
  display: grid;
  height: 100%;
  width: 100%;
  padding: 15px;
  align-content: safe center;

  textarea {
    height: 80px;
  }
}

p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.wallet-mode {
  grid-gap: 20px;

  @media screen and (min-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.divider {
  height: 1px;
  background: dark-gray;
  grid-column: 1 / -1;
}

.create-wallet-button {
  width: 100%;
  padding: 15px;
  border: 1px solid dark-gray;
  border-radius: 4px;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.14);
  transition: all 0.3s linear;

  &.create-button-disabled {
    opacity: 0.54;

    &:focus, &:active, &:hover {
      color: rgba(255, 255, 255, 0.54);
      border-color: dark-gray;
      cursor: pointer;
      box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.28);
    }
  }

  .button-icon {
    font-size: 2.4rem;
    text-align: center;
    margin-bottom: 15px;
  }

  .button-title {
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 15px;
  }

  p {
    color: rgba(255, 255, 255, 0.54);
    margin: 0;
  }

  &:focus, &:active, &:hover {
    color: primary;
    border-color: primary;
    cursor: pointer;
    box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.28);
  }
}

.controls {
  text-align: center;

  button {
    margin: 0;
  }
}
</style>
