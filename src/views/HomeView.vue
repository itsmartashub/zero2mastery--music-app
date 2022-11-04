<template>
    <main>
        <!-- Introduction -->
        <section class="mb-8 py-20 text-white text-center relative">
            <div
                class="absolute inset-0 w-full h-full bg-contain introduction-bg"
                style="background-image: url(assets/img/header.png)"
            ></div>
            <div class="container mx-auto">
                <div class="text-white main-header-content">
                    <h1 class="font-bold text-5xl mb-5">Listen to Great Music!</h1>
                    <p class="w-full md:w-8/12 mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus et dolor mollis, congue augue
                        non, venenatis elit. Nunc justo eros, suscipit ac aliquet imperdiet, venenatis et sapien. Duis
                        sed magna pulvinar, fringilla lorem eget, ullamcorper urna.
                    </p>
                </div>
            </div>

            <img
                class="relative block mx-auto mt-5 -mb-20 w-auto max-w-full"
                src="/assets/img/introduction-music.png"
            />
        </section>

        <!-- Main Content -->
        <section class="container mx-auto">
            <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                <!--
                     //! ovo v-icon je direktiva koju smo definisali u icon.js, a registrovali globalno u main.js. Kada iza v-icon dodamo :, ta vrednost se gleda kao argument. Apdejtovacemo direktivu da nam omoguci da titalno overwrittujemo klasu, umesto sto cemo da modifikujemo samo deo nje, kao sto sad radimo, dodajemo :full. Ako je :full prusitno u direktivi, on omogucava developerima da totalno overwrittuju klasu za ikonu. Dodacemo if u icon.js gde cekiramo da li je binding.arg === 'full'
                     //? Ovo v-icon.right.yellow su modifiers koje cemo da dodamo u icon.js. Njime menjamo boju ikonice u zuto, i smestena je desno
                -->
                <!-- <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200" v-icon:full="'headphones-alt'"> -->
                <!-- <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200" v-icon.right.yellow="'headphones-alt'"> -->

                <!--
                    //? Koristeci object za vrednost direktive tj. ovde v-icon-secondary je alternativa za koriscenje arg i modifiers; flxibilnije je jer mozemo da prosledimo kompleksnije vrednosti u direktivu
                -->
                <div
                    class="px-6 pt-6 pb-5 font-bold border-b border-gray-200"
                    v-icon-secondary="{ icon: 'headphones-alt', right: true }"
                >
                    <span class="card-title">Songs</span>
                    <!-- Icon -->
                </div>
                <!-- Playlist -->
                <ol id="playlist">
                    <app-song-item v-for="song in songs" :key="song.docID" :song="song" />
                    <!-- //! ne mozemo ovde da uzmemo citav Array kroz koji zelimo da lupujemo i prosledimo ga u child tj u SongItem.vue da tamo lupujemo. Ovo medjutim ne moze. Vue ne dozvoljava komponentama da lupuju kroz root elemente. Moramo ovde da lupujemo, a detetu prosledimo konkretno item, tj song -->
                </ol>
                <!-- .. end Playlist -->
            </div>
        </section>
    </main>
</template>

<script>
import { songsCollection } from '@/includes/firebase'
import AppSongItem from '@/components/SongItem.vue'
import IconSecondary from '@/directives/icon-secondary'

export default {
    name: 'home',
    components: { AppSongItem },

    directives: { 'icon-secondary': IconSecondary },

    data() {
        return {
            songs: [],
            maxPerPage: 25,
            pendingRequest: false // ovo ce nam sluziti da pratimo stanje rikvesta, sprecavace da se vise x odj salje rikvest, tipa da rifresujemo str. NPM
        }
    },

    async created() {
        // mora biti async jer cemo da saljemo rikvest Firebase-u da dohvatimo podatke. Dakle moramo da importujemo songsCollection
        this.getSongs()

        window.addEventListener('scroll', this.handleScroll)
    },

    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    },

    methods: {
        handleScroll() {
            //? Ovo c da cekira trenutnu poziciju gde je korisnik skrolovao. Treba da uklonimo scroll event ukoliko korisnik ode sa ove stranice. Komponente su unmounted ukoliko korisnik ode sa te i te stranice, tako da cemo u ukloniti ovaj listener u beforeUnmount() metodu, jer su one pozvane neposredno pre unmountovanja tj neposredno pre odlaska sa str.

            // Potrebno nam je offsetHeight (sveukupan height neke stranice), scrolLTop (koliko jer skrolovano od gore), innerHeight (vidljiv deo viewporta, ugl 100vh?, ako je body recimo, ali je promenljivo u zavisnosti nad kojim elementom pozivamo innerHeight?)
            const { scrollTop, offsetHeight } = document.documentElement
            const { innerHeight } = window

            // Sad cekiramo da li su skrollTop i innerHeight jednaki offsetHeight. Ako jesu, znaci da smo dosli do kraja stranice, tj do bottom-a
            const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight // Ili alternativa, manje striktna: Math.round(scrollTop) + innerHeight > offsetHeight - 100.
            // Moramo sa Math.round(scrollTop) da zaokruzimo na nedecimalnu vrednost, jer on moze biti decimalan, a innerHeight ce uvek biti ceo broj. Vrednost bottomOfWindow ce  biti Boolean

            // console.log(Math.round(scrollTop) + innerHeight)
            // console.log(offsetHeight)

            if (bottomOfWindow) {
                console.log('Bottom of window')
                this.getSongs()
            }
        },

        async getSongs() {
            //? INFINITY SCROLLING

            // const snapshots = await songsCollection.get() // Pozivamo get() metod da dohvatimo podatke. Ovo vraca Promise, dakle dodajemo await da hendluje Promise. Asajnovacemo podatke koje stizu Promise-om varijabli koja se zove snapshots. Vrednost koju ce vratiti ova Promise ce biti Array of documents. Mi zelimo da pushujemo Array dokumenata u komponentu

            if (this.pendingRequest) return

            this.pendingRequest = true
            let snapshots

            if (this.songs.length) {
                const lastDoc = await songsCollection.doc(this.songs[this.songs.length - 1].docID).get() // prosledjujemo docID poslednjeg itema u nizu koji smo prethodno fetchovali.

                snapshots = await songsCollection
                    .orderBy('modified_name')
                    .startAfter(lastDoc)
                    .limit(this.maxPerPage)
                    .get()
            } else {
                // ovo ce se okinuti pilikom prvog rikvesta, tj prva maxPerPage (3) item-a ce dohvatiti
                snapshots = await songsCollection.orderBy('modified_name').limit(this.maxPerPage).get()
            }
            //! Ovde sad dodajemo Firebase's limit() metod, koji limitira koliko reasults dobijamo od API-a. Ovo limit() cemo koristiit vise x, bilo bi pametno da sacuvamo u data() (recimo maxPerPage) koliko itema zelimo po rikvestu. Ovo ce da grabuje prvih maxPerPage itema (recimo prvih 3, ako je maxPerPage: 3).
            //! Cilj je da dobijemo sledeci paket podataka, ne iste podatke od prethodnog rikvesta, vec sledece. Tipa ako smo prva tri fetchovali, sledecim rikvestom zelimo sledeca tri, pa potom sledeca tri, itd. To cemo uciniti govoreci Firebase-u koji je poslednji document koji smo request-ovali. Chain-ovacemo startAfter() pre limit() metoda, ovim govorimo Firebase-u da potrazi dokumente nakon odredjenog dokumenta, kao recimo kad govorimo Javascriptu da vrati iteme iz niza nakon nekog konkretnog indexa. startAfter() ima 1 argument, a to je dokument od kog treba da pocne. Trenutno nemamo taj doc. Zato cemo da kreiramo query: const lastDoc = await songsCollection.doc(this.songs[this.songs.length - 1].docID).get()
            //? Firebase ce automatski da sortirati documents u random order. startAfter() metod to ne voli, on zeli od nas da poredjamo documents pre vracanja rezultata. Mozemo da pre startAfter() chain-ujemo orderBy() metod, gde cemo za argument staviti po cemu zelimo da poredjamo.
            //! Ako korisnik prvi x dolazi na stranicu, ovaj lastDoc Object koji prosledjujemo u startAfter() ce biti empty Object, ovo ce zeznuti query. A ne mozemo da dohvatimo poslednji dokument pre nego sto kreiramo query, a ne mozemo da kreiramo query pre nego sto imamo dokument koji ce ga kreirati. Ovo mozemo resiti kreirajuci 2 query-a odn. if-else

            snapshots.forEach((document) => {
                this.songs.push({ docID: document.id, ...document.data() }) // potreban nam je docID jer cemo lupovati kroz resultat u templejtu, potreban nam je za :key atribut gde cemo lupovati u templejtu. Potreban nam je taj unikatan broj.
            })

            this.pendingRequest = false
        }
    }
}
</script>
