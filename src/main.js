import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation'
import { auth } from './includes/firebase'

import './assets/base.css'
import './assets/main.css'

let app

auth.onAuthStateChanged(() => {
    //! ova firebase f-ja se pokrene bar jednom, tako da u njoj mozemo staviti instacu vue aplikacije. Medjutim, ova f-ja moze i vise x da se pokrene, dakle i Vue ce se istancirati vise x onda, zato dodajemo guard if (!app)

    if (!app) {
        app = createApp(App)

        app.use(createPinia())
        app.use(router)
        app.use(VeeValidatePlugin)

        app.mount('#app')
    }
})
