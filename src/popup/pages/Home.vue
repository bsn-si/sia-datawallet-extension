<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <vue-finder id='my_vuefinder' url="http://localhost:3000/data"></vue-finder>

    <div class="mt-2">
      <button class="btn mt-2" @click="openOptionsPage">
        Open Options
      </button>
    </div>

    <div class="mt-2">
      <button class="btn mt-2" @click="logout">
        Logout
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">

import VueFinder from "~/components/VueFinder.vue";
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
