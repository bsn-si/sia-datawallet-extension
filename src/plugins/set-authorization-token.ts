import { api } from '~/services'
import { userStorage } from '~/store/user'

export default function ( password?: string | null ): string | void {
  if (password === null) {
    api.setSecurityData(null)
    return
  } else if (password !== undefined) {
    const token = btoa(`:${password}`)
    api.setSecurityData(token)
    return token
  }
  const token = userStorage.get()?.token
  if (token !== undefined) api.setSecurityData(token)
}
