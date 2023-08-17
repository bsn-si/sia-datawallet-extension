<template>
  <section class="bg-gray-50 dark:bg-gray-900" style="min-width: 500px;">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        SIA Data Wallet
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Unlock
          </h1>
          <div class="setup-content" v-if="step === 'password'">
            <p>{{ "Set a secure password to encrypt your wallets with. This password will be required to unlock, create, and recover your wallets. All wallet seeds are encrypted, stored locally and never leave the device." }}</p>
            <div class="control">
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ "Unlock Password" }}</label>
              <input type="password" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" v-model="form.unlockPassword" autocomplete="new-password" @input="onCheckPassword" @blur="onCheckPassword" />
            </div>
            <div class="control">
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ "Confirm Password" }}</label>
              <input type="password" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" v-model="form.confirmPassword" autocomplete="new-password" @input="onCheckPassword" @blur="onCheckPassword" />
              <div class="text-error text-small" v-if="!form.passwordsMatch">{{ "Unlock password does not match. Check your passwords and try again." }}</div>
            </div>
            <div class="buttons">
              <button class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" @click="onSetPassword" :disabled="!enableNext">{{ "Next" }}</button>
            </div>
          </div>
          <div class="wallet-step wallet-mode" v-if="step === 'choose'" key="pickMode">
            <div class="create-wallet-button" @click="onClickWalletType('create')">

              <div class="button-title">{{ "New Wallet" }}</div>
              <p>{{ "Generates a new wallet seed in the browser. Transactions can be sent and received." }}</p>
            </div>
            <div class="create-wallet-button" @click="onClickWalletType('recover')">

              <div class="button-title">{{ "Recover Wallet" }}</div>
              <p>{{ "Recovers an existing wallet from a 29 seed. Transactions can be sent and received." }}</p>
            </div>
          </div>
          <div v-if="step ==='create'">
            <div class="control">
              <label>{{ "Wallet Name" }}</label>
              <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Wallet" v-model="walletName" />
            </div>

            <template v-if="createType === 'recover'">
              <div class="control">
                <label>{{ "Recovery Seed" }}</label>
                <textarea v-model="recoverySeed" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
            </template>
            <div class="buttons">
              <button class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      @click="onCreateWallet" :disabled="creating">{{ createType === 'recover' ? 'Recover' : 'Generate' }}</button>
            </div>
          </div>
          <div v-if="step ==='review'">
            <p v-if="createType === 'recover'">Your wallet has been successfully recovered. The blockchain is now being scanned for balance and transactions. Backup your recovery seed to a safe location, without your seed your funds cannot be recovered.</p>
            <p v-else>A new wallet has been created. Backup your recovery seed to a safe location, without your seed your funds cannot be recovered.</p>
            <template v-if="walletType === 'default'">
              <div class="control">
                <label>{{ "Recovery Seed" }}</label>
                <textarea v-model="wallet.seed" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" readonly/>
              </div>
              <div class="control">
                <input type="checkbox" id="chkSeedExported" v-model="exported" />
                <label for="chkSeedExported">{{ "My recovery seed is saved in a secure location" }}</label>
              </div>
            </template>
            <div class="controls">
              <button class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      @click="onWalletCreated" :disabled="doneDisabled">{{ "Done" }}</button>
            </div>
          </div>

          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in (renterd)
          </h1>
          <ul class="error-messages">
            <li
                v-for="(error, field) in errors"
                :key="field"
            >
              {{ field }} {{ error ? error[0] : '' }}
            </li>
          </ul>
          <form class="space-y-4 md:space-y-6"
                ref="formRef"
                @submit.prevent="login"
          >
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input
                  v-model="form.password"
                  type="password" name="password" id="password" placeholder="Enter password" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="">
            </div>

            <button
                :disabled="!form.password"
                type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Unlock</button>
          </form>
        </div>
      </div>
    </div>
  </section>


</template>

<script setup lang="ts">
import { routerPush } from '~/popup/router'
import { api, isFetchError } from '~/services'
import { useUserStore } from '~/store/user'
import { useWalletsStore } from '~/store/wallet'
import { reactive, ref } from 'vue'
import setAuthorizationToken from '~/plugins/set-authorization-token'
import {ConsensusState} from "~/types/users";
import { generateSeed, generateAddresses } from '~/sia/index.js';
import { hash } from 'tweetnacl';
import { encode as encodeUTF8 } from '@stablelib/utf8';
import { saveAddresses } from '~/store/db.js';

interface LoginUser {
  /** @format password */
  password: string;

  confirmPassword: string;
  passwordsMatch: boolean;
  unlockPassword: string;
}


const formRef = ref<HTMLFormElement | null>(null)
const form: LoginUser = reactive({
  password: '',

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

let wallet = reactive ({
  id: '',
  seed: '',
  title: '',
  currency: '',
  type: '',
  server_type: '',
  server_url: null
})

let addresses = []


const enableNext = computed(() => {
  return form.unlockPassword.length > 0 && form.unlockPassword === form.confirmPassword;
})

const walletType = computed(() => {
  return wallet && typeof wallet.type === 'string' ? wallet.type : 'watch';
})

const doneDisabled = computed(() => {
  // disable the done button if the wallet is being saved, or has not been exported
  return saving || (!exported.value && walletType.value === 'default');
})

const { updateUser } = useUserStore()
const { createWallet, queueWallet, setSetup } = useWalletsStore()

const errors = ref()


const login = async () => {
  errors.value = {}

  if (!formRef.value?.checkValidity()) return

  try {
    const token = setAuthorizationToken(form.password)
    const result = await api.consensus.stateList()
    updateUser({consensusState: result.data as ConsensusState, token: token as string})
    await routerPush('home')
  } catch (e) {
    setAuthorizationToken(null)
    if (isFetchError(e)) {
      // errors.value = e.error
      const status = (e as Response).status
      // const statusText = (e as Response).statusText
      if (status === 504) {
        errors.value = {
          error: ['Error, check that daemon is running'],
        }
      }
      if (status === 401) {
        errors.value = {
          error: ['Error, wrong password'],
        }
      }
      // if (code === 'ECONNABORTED') {
      //   return {
      //     error: 'Error, daemon did not respond',
      //   }
      // }

      errors.value = {
        error: ['Error, something went wrong'],
      }

      return
    }
    console.error(e)
  }
}

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
    // this.pushNotification({
    //   severity: 'danger',
    //   icon: 'wallet',
    //   message: ex.message
    // });
  }
}

const onClickWalletType = (type: string) => {
  try {
    step.value = 'create';
    createType.value = type;
  } catch (ex) {
    console.error('onClickWalletType', ex);
    // this.pushNotification({
    //   message: ex.message,
    //   severity: 'danger'
    // });
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
    // this.pushNotification({
    //   severity: 'danger',
    //   message: ex.message
    // });
  } finally {
    creating.value = false;
  }
}

const saveWallet = async() => {
  const { user } = useUserStore()
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
    // this.pushNotification({
    //   message: ex.message,
    //   severity: 'danger'
    // });
  } finally {
    saving.value = false;
  }
}

const onWalletCreated = async() => {
  try {
    setSetup(true);

    await routerPush('wallets')
  } catch (ex) {
    console.error('onWalletCreated', ex);
    // this.pushNotification({
    //   severity: 'danger',
    //   icon: 'wallet',
    //   message: ex.message
    // });
  }
}

</script>
