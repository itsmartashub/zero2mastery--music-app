<template>
    <app-header />

    <!--
        //* Transition nece raditi ukoliko Component ima vise root elemenata, dobicemo error. Dakle ako ima, treba da wrappujemo njih u jedan. Tipa, u SongView.vue cemo ta tri root elementa (<section>, <section> i <ul>) da wrappujemo u jedan, <main> el. Slicno vazi i za HomeView.vue

        //! <component> je ghost komponenta. To je komponenta registrovana by Vue, i sama po sebi ona ne renderuje nista. Koristi se za dinamicko loadovanje komponenti. Komponenta koja ce se renderovati je ona koju prosledimo u :is="" property. Mi cemo proslediti Component slot property, a komponenta Component ce renderovati koju god komponentu router-view odluci
    -->
    <router-view v-slot="{ Component }">
        <!-- <transition name="fade" mode="out-in"> -->
        <!-- //? SA OVIM mode="out-in"> MENI NIJE HTELODA RADI -->
        <transition name="fade">
            <component :is="Component"></component>
        </transition>
    </router-view>

    <!-- Player -->
    <app-player />

    <app-auth />
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppAuth from '@/components/AuthModal.vue'
import { mapWritableState } from 'pinia'
import userUserStore from '@/stores/user'
import { auth } from './includes/firebase'
import AppPlayer from '@/components/Player.vue'

export default {
    name: 'App',
    components: { AppHeader, AppAuth, AppPlayer },

    computed: {
        ...mapWritableState(userUserStore, ['userLoggedIn'])
    },

    created() {
        // proveravamo da li je user ulogovan, ako jeste, apdejtovanjemo State, u suprotnom necemo nista
        if (auth.currentUser) {
            this.userLoggedIn = true
        }
    }
}
</script>
<style>
.fade-enter-from {
    opacity: 0;
}
.fade-enter-active {
    transition: all 0.5s linear;
}
.fade-leave-to {
    transition: all 0.5s linear;
    opacity: 0;
}
</style>
