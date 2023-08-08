<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <SharedSubtitle />

    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>
    <div class="mt-2">
      <AppLink
          name="login"
      >
        Login
      </AppLink>
    </div>
    <div class="mt-2">
      <button class="btn mt-2" @click="logout">
        Logout
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import {storageDemo} from "~/logic";
import AppLink from "~/popup/components/AppLink.vue";
import {useUserStore} from "~/store/user";
import {routerPush} from "~/popup/router";
const { updateUser } = useUserStore()

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}
const logout = async () => {
  updateUser(null)
  await routerPush('login')
}
</script>
