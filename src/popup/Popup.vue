<template>
  <RouterView />
</template>

<script setup lang="ts">

import {useUserStore} from "~/store/user";
import {routerPush} from "~/popup/router";

const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.isAuthorized) return await routerPush('login')
})
</script>

