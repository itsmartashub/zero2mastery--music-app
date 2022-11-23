import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/views/HomeView.vue'
// import About from '@/views/AboutView.vue'
// import Manage from '@/views/ManageView.vue'
// import Song from '@/views/SongView.vue'
import useUserStore from '@/stores/user'

/* 
CHUNKS. Kreiracemo f-ju koja ce biti pozvana za importovanje komponente: import(''). Vrednost koju ce vratiti ova f-ja bice komponenta koju zelimo da dinamicki ucitamo. Ako korisnik krene da posecuje HomeView.vue rutu, Vue Router ce invoke ovu Home f-ju; a ta Home f-ja ce pozvati import() f-ju koja ce omoguciti da se loaduje chunk fajl tj HomeView.vue tj Home stranica. Ovo cemo odraditi za ostale route komponente.
Btw, ono sto je jos zanimljivo je ako s jednom ucita chunk fajl, Vue ga nece morati ponovo loadovati, ovo omogucava brze loadovanje kad switchujemo izmedju stranica; naime, chunk je privremeno kesiran.
Ovo mozemo proveriti tako sto cemo ici u Network tab, pa ja JS, pa obrisati sve ucitano 🚫 pa otici npr na About, pa vidimo sa se ucitalo, pa na Manage, pa videti sta se ucitalo. */
const Home = () => import('@/views/HomeView.vue')
const About = () => import('@/views/AboutView.vue')
const Manage = () => import('@/views/ManageView.vue')
const Song = () => import('@/views/SongView.vue')

const routes = [
    {
        name: 'home',
        path: '/',
        component: Home
    },
    {
        name: 'about',
        path: '/about',
        component: About
    },
    {
        name: 'manage',
        // alias: '/manage',
        path: '/manage-music',
        component: Manage,
        beforeEnter: (to, from, next) => {
            console.log('Manage Route Guard')
            next()
        },
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/manage',
        redirect: { name: 'manage' }
    },
    {
        name: 'song',
        path: '/song/:id',
        component: Song
    },
    {
        path: '/:catchAll(.*)*',
        redirect: { name: 'home' }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    linkExactActiveClass: 'text-yellow-500'
})

router.beforeEach((to, from, next) => {
    // console.log(to.meta)

    if (!to.meta.requiresAuth) {
        next()
        return
    }

    const store = useUserStore()

    if (store.userLoggedIn) {
        next()
    } else {
        next({ name: 'home' })
    }
})

export default router
