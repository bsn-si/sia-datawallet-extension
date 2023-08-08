<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">
            Sign in
          </h1>

          <ul class="error-messages">
            <li
                v-for="(error, field) in errors"
                :key="field"
            >
              {{ field }} {{ error ? error[0] : '' }}
            </li>
          </ul>

          <form
              ref="formRef"
              @submit.prevent="login"
          >

            <fieldset class=" form-group">
              <input
                  v-model="form.password"
                  class="form-control form-control-lg"
                  type="password"
                  required
                  placeholder="Password"
              >
            </fieldset>
            <button
                class="btn btn-lg btn-primary pull-xs-right"
                :disabled="!form.password"
                type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { routerPush } from '~/popup/router'
import { api, isFetchError } from '~/services'
import { useUserStore } from '~/store/user'
import { reactive, ref } from 'vue'
import setAuthorizationToken from '~/plugins/set-authorization-token'
import {ConsensusState} from "~/types/users";

interface LoginUser {
  /** @format password */
  password: string;
}


const formRef = ref<HTMLFormElement | null>(null)
const form: LoginUser = reactive({
  password: '',
})

const { updateUser } = useUserStore()

const errors = ref()

const login = async () => {
  errors.value = {}

  if (!formRef.value?.checkValidity()) return

  try {
    setAuthorizationToken(form.password)
    const result = await api.consensus.stateList()
    updateUser({consensusState: result.data as ConsensusState})
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

</script>
