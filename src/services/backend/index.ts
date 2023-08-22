import {api, isFetchError} from "~/services";
import {createUint8ArrayFromKeys} from "~/utils";
import {useUserStore} from "~/store/user";

export async function loginOrRegisterUser (walletId, password) {
    const { updateUser } = useUserStore()
    let errors = {}
    try {
        const result = await api.service.login({user: {wallet: walletId, password: JSON.stringify(password)}})
        const {token} = result.data.user
        updateUser({unlockPassword: createUint8ArrayFromKeys(password), token: token as string})
        console.log('Login to backend successful')
    } catch (e) {
        if (isFetchError(e)) {
            const status = (e as Response).status

            if (status === 401) {
                try {
                    const result = await api.service.register({user: {wallet: walletId, password: JSON.stringify(password)}})
                    const {token} = result.data.user
                    updateUser({unlockPassword: createUint8ArrayFromKeys(password), token: token as string})
                } catch (e) {
                    if (isFetchError(e)) {
                        const status = (e as Response).status
                        if (status === 400) {
                            errors = {
                                error: ['Error create user'],
                            }
                        } else {
                            errors = {
                                error: ['Error, something went wrong'],
                            }
                            console.error(e)
                        }
                    }
                }
            } else {
                errors = {
                    error: ['Error, something went wrong'],
                }
                console.error(e)
            }
        }
    }
    return errors;
}
