import type { App } from 'vue'
import { router } from '~/popup/router'
import { createPinia } from 'pinia'
import registerGlobalComponents from '~/plugins/global-components'
import setAuthorizationToken from "~/plugins/set-authorization-token";
import { connect, walletCount } from '~/store/db';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle, faCreditCard, faSitemap, faFile, faFileExport, faUnlock, faLock, faEllipsisV, faChevronLeft, faChevronRight, faChevronDown, faEye, faPencilAlt, faTrash, faPaperPlane, faWallet, faAddressBook, faCogs, faPlus, faTimes, faRedo } from '@fortawesome/free-solid-svg-icons';
import { faBluetoothB, faUsb, faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {useWalletsStore} from "~/store/wallet";
import { siaAPI } from '~/services/wallet/siacentral';

export async function setupApp(app: App) {
  // Inject a globally available `$app` object in template
  app.config.globalProperties.$app = {
    context: '',
  }

  // Provide access to `app` in script setup with `const app = inject('app')`
  app.provide('app', app.config.globalProperties.$app)

  // Here you can install additional plugins for all contexts: popup, options page and content-script.
  // example: app.use(i18n)
  // example excluding content-script context: if (context !== 'content-script') app.use(i18n)

  app.use(router)
  app.use(createPinia())

  setAuthorizationToken()
  registerGlobalComponents(app)

  library.add(faBluetoothB, faExclamationTriangle, faCreditCard, faSitemap, faFile, faFileExport, faUnlock, faLock, faEllipsisV, faChevronLeft, faChevronRight, faChevronDown, faEye, faUsb, faGithub, faPencilAlt, faTrash, faPaperPlane, faWallet, faAddressBook, faCogs, faPlus, faTimes, faRedo);
  app.component('font-awesome-icon', FontAwesomeIcon);

  const { setDBType, setUnavailable, setSetup } = useWalletsStore()

  const dbType = await connect();
  console.log('dbType', dbType);
  setDBType(dbType);
  console.log(await walletCount())
  setSetup((await walletCount()) !== 0);

  try {
    await siaAPI.checkAvailability();
  } catch (ex) {
    console.error(ex.message);
    setUnavailable(ex.message);
  }

}
