import { defineStore } from 'pinia'
import { api } from '~/services'
import Storage from '~/utils/storage'
import { computed, ref } from 'vue'
import {User} from "~/types/users";
import setAuthorizationToken from "~/plugins/set-authorization-token";
import {subscriptions} from "~/services/backend";


export const userStorage = new Storage<User>('user')

export const isAuthorized = (): boolean => !!userStorage.get()

export const useUserStore = defineStore('user', () => {
  const user = ref(userStorage.get())
  const isAuthorized = computed(() => user.value !== null)
  const userSubscriptions = ref(null);



  function updateUser (userData?: User | null) {
    if (userData === undefined || userData === null) {
      userStorage.remove()
      api.setSecurityData(null)
      user.value = null
      setAuthorizationToken(null)
    } else {
      userStorage.set(userData)
      // api.setSecurityData(userData.token)
      user.value = userData
      setAuthorizationToken(user.value.token)
    }
  }

  const loadSubscriptions = async (walletId) => {
    const {data} = await subscriptions(walletId)
    userSubscriptions.value = data;
  }

  const activeSubscription = computed(() => {
    if (!userSubscriptions.value || !userSubscriptions.value.subscriptions || userSubscriptions.value.subscriptions.length === 0)
      return {plan_code: '', active: false}

    return userSubscriptions.value.subscriptions.find(x => x.active = true);
  })

  return {
    user,
    isAuthorized,
    updateUser,
    userSubscriptions,
    activeSubscription,
    loadSubscriptions
  }
})
