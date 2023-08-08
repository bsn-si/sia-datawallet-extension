import { api } from '~/services'
import { userStorage } from '~/store/user'

export default function (password: string | null): void {
  if (password === null) {
    api.setSecurityData(null)
    return
  } else if (password !== undefined) {
    const token = btoa(`:${password}`)
    api.setSecurityData(token)
    return
  }
  const token = userStorage.get()?.token
  if (token !== undefined) api.setSecurityData(token)
}
