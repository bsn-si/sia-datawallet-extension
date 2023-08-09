import { createApp } from 'vue'
import App from './Popup.vue'
import { setupApp } from '~/logic/common-setup'
import '../styles'
import 'microtip/microtip.css'

const app = createApp(App)

setupApp(app)


app.mount('#app')

// setTimeout(() => {
//     console.log(app._instance.appContext.components)
// }, 3000)
