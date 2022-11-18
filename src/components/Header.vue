<template>
    <!-- Header -->
    <header id="header" class="bg-gray-700">
        <nav class="container mx-auto flex justify-start items-center py-5 px-4">
            <!-- App Name -->
            <router-link
                :to="{ name: 'home' }"
                class="text-white font-bold uppercase text-2xl mr-4"
                exact-active-class="no-active"
                >Music</router-link
            >

            <div class="flex flex-grow items-center">
                <!-- Primary Navigation -->
                <ul class="flex flex-row mt-1">
                    <!-- Navigation Links -->
                    <li>
                        <router-link :to="{ name: 'about' }" class="px-2 text-white">About</router-link>
                    </li>

                    <li v-if="!userStore.userLoggedIn">
                        <a class="px-2 text-white" href="#" @click.prevent="toggleAuthModal()">Login / Register</a>
                    </li>
                    <template v-else>
                        <li>
                            <router-link :to="{ name: 'manage' }" class="px-2 text-white">Manage</router-link>
                        </li>
                        <li>
                            <a class="px-2 text-white" href="#" @click.prevent="userStore.signOut">Logout</a>
                        </li>
                    </template>
                </ul>

                <!-- ml-auto klasa ce da pomeri listu levo (margin-left: auto) -->
                <ul class="ml-auto">
                    <li>
                        <a href="#" class="px-2 text-white" @click.prevent="changeLocale">
                            {{ currentLocale }}
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
import { mapStores } from 'pinia'
import useModalStore from '@/stores/modal'
import useUserStore from '@/stores/user'

export default {
    name: 'AppHeader',
    computed: {
        ...mapStores(useModalStore, useUserStore),
        // ...mapWritableState(useModalStore, ['isOpen'])
        currentLocale() {
            return this.$i18n.locale === 'fr' ? 'French' : 'English'
        }
    },
    methods: {
        toggleAuthModal() {
            this.modalStore.isOpen = !this.modalStore.isOpen //! ovo modalStore je ovaj store u modal.js sto koristimo, a isOpen je njegov property, tj ovo u njegovom state-u sto je, da je ime tj. id store-a user bilo bi userStore itd...

            // this.isOpen = !this.isOpen //! ovo je sa mapWritableState
        },

        // signOut() {
        //     this.userStore.signOut()
        //     // if (this.$router.name === 'manage') {
        //     if (this.$router.meta.requiresAuth) {
        //         //! dakle samo ako se logoutujemo sa /manage-music stranice (gde smo stavili meta: {requiresAuth: true}), onda se reidrektujemo na home, i ta stranica Manage nece biti vidljiva (ni Manage link nema kad se izlogujemo pa je logicno da tako uradimo), al ostale hoce. Tipa ako se logoutujemo sa About stranice, ostacemo i dalje na toj stranici i bice vidljiva ta str, al to je ok, jer ona je dostupna i kad nismo ulogovani.
        //         this.$router.push({ name: 'home' })
        //     }
        // }

        changeLocale() {
            // svaka komponenta je injectovana sa $i18n. Ovo ce nam omoguciti pristup f-jama i propertijima biblioteke, postaje nam dostupno onog momenta kad smo registrovali plagin u main.js.
            this.$i18n.locale = this.$i18n.locale === 'fr' ? 'en' : 'fr'
        }
    }
}
</script>
