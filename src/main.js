import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation'
import { auth } from './includes/firebase'
import Icon from './directives/icon'
import i18n from './includes/i18n'

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
        app.use(i18n) // registrujemo i18n
        app.directive('icon', Icon) // Direktiva mora biti registrovana PRE nego sto je #app mounted dakle pre: app.mount('#app'). directive() ima 2 argumenta, 1. je ime direktive, sva imena direktiva imaju V ispred naziva, tako Vue identifikuje direktivu, da se ne pomesaju i ne tretiraju kao atributi. 2. argument je konfiguracioni Object. Posto smo direktivu registrovali globalno, mozemo je koristiti u bilo kojoj komponenti u nasoj app. Idemo u HomeView.vue gde je komentar <!-- Icon -->, tj parent <div> od onog gde zelimo da insertujemo icon

        app.mount('#app')
    }
})
