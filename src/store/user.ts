import { defineStore } from 'pinia'
import { api } from '~/services'
import Storage from '~/utils/storage'
import { computed, ref } from 'vue'
import {User} from "~/types/users";



export const userStorage = new Storage<User>('user')

export const isAuthorized = (): boolean => !!userStorage.get()

export const useUserStore = defineStore('user', () => {
  const user = ref(userStorage.get())
  const isAuthorized = computed(() => user.value !== null)

  function updateUser (userData?: User | null) {
    if (userData === undefined || userData === null) {
      userStorage.remove()
      api.setSecurityData(null)
      user.value = null
    } else {
      userStorage.set(userData)
      // api.setSecurityData(userData.token)
      user.value = userData
    }
  }

  return {
    user,
    isAuthorized,
    updateUser,
  }
})
