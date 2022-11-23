<template>
    <main>
        <!-- Music Header -->
        <section class="w-full mb-8 py-14 text-center text-white relative">
            <div
                class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
                style="background-image: url(/assets/img/song-header.png)"
            ></div>
            <div class="container mx-auto flex items-center">
                <!-- Play/Pause Button -->
                <button
                    @click.prevent="newSong(song)"
                    type="button"
                    class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
                >
                    <i class="fas fa-play"></i>
                </button>
                <div class="z-50 text-left ml-8">
                    <!-- Song Info -->
                    <div class="text-3xl font-bold">{{ song.modified_name }}</div>
                    <div>{{ song.genre }}</div>
                    <!-- 
                       //? $n() ce prevesti numeric vrednosti. Ima tri parametra, ali samo su prva dva obavezna:
                       //? 1. PRVI je broj, nismo storovali ni jednu cenu, ali mozemo da hardkodujemo.
                       //? 2. DRUGI parametar je ime prevoda koji cemo da koristimo, stavimo currency. Govorimo mu da broj treba da koristi i formatira u odnosu na currency, tj kao currency tj. valutu
                       //? 3. TRECI argument je locale koji zelimo da koristimo, ne moramo uvek cekati prevod stranice, mozemo ga hardkodovati ovde. 
                       //! VAZNO: ovde se menja valuta, ALI NE IZVRSAVA SE KONVERZIJA USD VREDNOSTI U JPY !!!!
                     -->
                    <div class="song-price">{{ $n(1, 'currency', 'ja') }}</div>
                </div>
            </div>
        </section>

        <!-- Form -->
        <section class="container mx-auto mt-6" id="comments">
            <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
                    <!-- Comment Count -->
                    <!-- <span class="card-title">Comments ({{ song.comment_count }})</span> -->
                    <!-- 
                        //? $t() ima i drugi, opcioni, parametar; to ce biti vrednost za onaj placeholder u json, sto je u { count }
                        //! i18n podrzava pluralizaciju, ne treba za svaki slucaj da pravimo poseban prevod, tipa kad nema komentara da pise "No comments", kad ima 1 da pise "1 comment", kad ima vise da pise "333 commentS". Vec koristimo | (pipe), i dodajemo prevode: BITAN JE REDOSLED! en.json ===>  "comment_count": "No comments | 1 comment | {count} comments". I ovde ne koristimo onda $t(), vec $tc()!!! I u njemu su argumentimalo drugaciji nego u $t(); PRVI argument je path ka poruci, tu dakle koristimo isto kao i u $t(), za DRUGI arg je Numeric vrednost, odnosno broj tj song.comment_count
                        https://vue-i18n-next.intlify.dev/guide/essentials/pluralization.html
                     -->
                    <span class="card-title">
                        {{ $tc('song.comment_count', song.comment_count, { count: song.comment_count }) }}
                    </span>
                    <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
                </div>

                <div class="p-6">
                    <div
                        class="text-white text-center font-bold p-4 mb-4"
                        v-if="comment_show_alert"
                        :class="comment_alert_variant"
                    >
                        {{ comment_alert_message }}
                    </div>

                    <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
                        <!--
                         //! Menjamo <textarea></textarea> u <vee-field></vee-field> i dodajemo atribut as="textarea"
                    -->
                        <vee-field
                            as="textarea"
                            name="comment"
                            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
                            placeholder="Your comment here..."
                        ></vee-field>
                        <ErrorMessage class="text-red-600" name="comment" />

                        <button
                            type="submit"
                            class="py-1.5 px-3 rounded text-white bg-green-600 block"
                            :disabled="comment_in_submission"
                        >
                            Submit
                        </button>
                    </vee-form>
                    <!-- Sort Comments -->
                    <select
                        v-model="sort"
                        class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                    >
                        <option value="1">Latest</option>
                        <option value="2">Oldest</option>
                    </select>
                </div>
            </div>
        </section>

        <!-- Comments -->
        <ul class="container mx-auto">
            <li class="p-6 bg-gray-50 border border-gray-200" v-for="comment in sortedComments" :key="comment.docID">
                <!-- Comment Author -->
                <div class="mb-5">
                    <div class="font-bold">{{ comment.name }}</div>
                    <time>{{ comment.datePosted }}</time>
                </div>
                <p>{{ comment.content }}</p>
            </li>
        </ul>
    </main>
</template>

<script>
import { songsCollection, commentsCollection, auth } from '@/includes/firebase'
import { mapState, mapActions } from 'pinia'
import useUserStore from '@/stores/user'
import usePlayerStore from '@/stores/player'

export default {
    name: 'Song',

    data() {
        return {
            song: {},
            schema: {
                comment: 'required|min:3'
            },
            comment_in_submission: false, // kad je false, dozvljavamo korisniku da ostavi comment
            comment_show_alert: false, // koristicemo ovo da togglujemo alert box. Defaultno, ovo je false, sto znaci da nece biti prikazano
            comment_alert_variant: 'bg-blue-500',
            comment_alert_message: 'Please wait! Your comment is being submitted',
            comments: [],
            sort: 1
        }
    },

    computed: {
        ...mapState(useUserStore, ['userLoggedIn']),

        sortedComments() {
            // return this.comments.sort() //! Ne mozemo ovako, moramo da napravimo kao "kopiju" niza pa onda sort(), jer ne bismo smeli original niz da mutiramo sa computed porpertijem. DA citamo i kalkulisemo vrednosti iz data da, ali da modifikujemo, to ne. I zato moramo korisiti slice() metod koji kreira novi array (kopiju):
            return this.comments.slice().sort((a, b) => {
                if (this.sort === '1') {
                    //? '1' reprezentuje descending order tj. latest to oldest (novije ka starijem)
                    return new Date(b.datePosted) - new Date(a.datePosted) // Ako je vrednost pozitivna, onda ce A ici prvo u nizu, ako je 0, onda B i A ostaju na njihovim indexima kako su. Pozitivna vrednost govori JS-u da stavi B ispred A. Koristimo new Date() jer konvertujemo String za datum iz FB-a, u Object
                }

                return new Date(a.datePosted) - new Date(b.datePosted) //? Oldest to latest
            })
        }
    },

    /*
    ! pogledati PERCEIVED PERFORMANCE u notes.txt zato smo promeniti created u beforeRouteEnter. 
    Postoji nekoliko problema sad sa ovim. UPAMTI, beforeRouteEnter se runnuje PRE nego se komponenta ucita, dakle this keyword nam nije dostupna. Niti drugi podaci, niti methods, niti ista sto je injectovano u components. Dobicemo error jer pokusavamo da referencujemo vrednost koja ne postoji u trenutnom skoupu. 
    Srecom, postoji resenje za to. this.$route ne mozemo da koristimo kao tako, ali mozemo da koristimo to object (iz parametra), to object sadrzi podatke koje se odnose na rutu koju trenutno posecujemo; sadrzi route parametre. 
    Zatim koristicemo next() parametar da omogucimo context nasem kodu. next() f-ji cemo prosledtii callback f-ju koja moze da ima jedan parametar, a to je vm. Kada se komponenta ucita mozemo koristiti vm parametar da dohavtimo component podatke. */
    // async created() {
    async beforeRouteEnter(to, from, next) {
        // const docSnapshot = await songsCollection.doc(this.$route.params.id).get()
        const docSnapshot = await songsCollection.doc(to.params.id).get() // U ovom slucaju je skroz ok da koristimo get() za dohvatanje pesama. Ali ukoliko bismo za path route koristili tipa ime pesme umesto id, onda je valjda bolje korisitit where() fb metod, jer daje vise mogucnosti po cemu da poziva songs (where('modified_name', '==', this.$route.params.id)), valjda.

        next((vm) => {
            // vm === this
            /* 
            ? Postoji mogucnost da korisnik poseti pesmu koja ne postoji, ili postoji ali je izbrisana iz database iz nekog razloga; Firebase nece izbaciti gresku ukoliko ne moze da pronadje document, on ce i dalje da vraca snapshot. Bolje da cekiramo da li document postoji sa exist property u snapshotu. Ako ne postoji, idemo na 'home' page */
            if (!docSnapshot.exists) {
                vm.$router.push({ name: 'home' })
                return
            }

            const { sort } = vm.$route.query

            vm.sort = sort === '1' || sort === '2' ? sort : '1' // Postoji jedan problem s ovim. Apdejtujemo sort property, taj apdejt triggeruje watcher za sort() f-ju bilo da se vrednost promeni ili ne. Vue ce nam izbaciti gresku ukoliko pokusavamo da posetimo stranicu koju vec posecujemo (na kojoj smo vec). Zelimo da ovo izbegnemo tako sto cemo da u sort() dodamo: if (newVal === vm.$route.query.sort) return

            vm.song = docSnapshot.data() // Ne moramo da cuvamo ID opet posebno, jer se on vec nalazi u data()
            vm.getComments() // Komentare zelimo da fetchujemo prvi x kad je komponenta prvi x loadovana, i 2. put kada je komentar submitovan
        })
    },

    methods: {
        ...mapActions(usePlayerStore, ['newSong']),

        async addComment(values, { resetForm }) {
            // ovo values su vrednosti iz forme
            this.comment_in_submission = true
            this.comment_show_alert = true
            this.comment_alert_variant = 'bg-blue-500'
            this.comment_alert_message = 'Please wait! Your comment is being submitted'

            //! VAZNO: ne validiramo komentar u ovoj f-ji, jer ova f-ja nece ni biti pozvana ukoliko je polje invalid; Vee-validate forsira validaciju polja pre pozivanja ove f-je

            const comment = {
                content: values.comment,
                datePosted: new Date().toString(), // Zovemo toString() jer fb ne moze da storuje new Date()
                sid: this.$route.params.id, // Povezuje comment sa song. u this.$route.params.id se storuje id pesme
                name: auth.currentUser.displayName, //! btw, treba da sakrijemo formu za komentarisanje ako korisnik nije ulogovan!!
                uid: auth.currentUser.uid // Storujemo id korisnika da bismo znali ko je komentarisao. OK, vec storujemo ime, ali postoji mogucnost da se ime promeni, a ID ne.
            }
            //! Sad moramo u Firebase da kreiramo u Cloud Firestore (Database) documents kojim cemo da storujemo komentare
            await commentsCollection.add(comment)
            this.song.comment_count += 1 // BTW, ES link preporucuje da se ne kor ++ ili -- vec +=1 i -=1 (tj neki broj), jer na kraju kad se taj kod bundle-je, dolazi do nekih pizdarija (tipa j ++ umesto j++ ili j pa tek u sl redu ++ itd, whitespacing issues) u source kodu, nzm ni ja

            console.log(this.song)
            console.log(this.song.comment_count)

            await songsCollection.doc(this.$route.params.id).update({
                comment_count: this.song.comment_count
            }) // Treba da selektujemo doc() pre nego sto ga apdejtujemo, tj. apdejtujemo comment_count

            this.getComments()

            this.comment_in_submission = false
            this.comment_show_alert = true
            this.comment_alert_variant = 'bg-green-500'
            this.comment_alert_message = 'Comment added!'

            //! Sad treba da resetujemo comment sto ce biti tricky, jer comment field nije bind-ovano u nas property u nasoj komponenti sa v-model direktivom. Srecom, vee-validate nasem @submit handleru za drugi argument prosledjuje set f-ja
            // Context Object sadrzi metode i propertije u vezi sa nasom formom. Mozemo ga koristiti za resetovanje forme. Mi cemo koristiit resetForm() koji se nalazi u context; dakle ili cemo context.resetForm() ili cemo sa destructuring samo { resetForm }
            resetForm() // resetuje vrednosti forme u originalne vrednosti
        },
        async getComments() {
            const snapshots = await commentsCollection.where('sid', '==', this.$route.params.id).get()

            this.comments = [] // ovo radimo da ne bismo imali duplirane komentare

            snapshots.forEach((doc) => {
                this.comments.push({
                    docID: doc.id,
                    ...doc.data()
                })
            })
        }
    },

    watch: {
        /*
        ! Query Params. zelimo da mozemo da promenimo rutu kada se vrednosti promene. Jedan od nacina je da swapujemo v-model directive sa event listenerom. Ali mi cemo koristiti watcher, jer zahteva najmanju promenu nasem resenju???? Watcher je f-ja koja trackuje promene propertija u komponenti. Ako se neka promena desi, mozemo da opaliko f-ju kada god se ta promena desi. Ime f-je koju definisemo mora da odg. ime propertiju kog zelimo da pratimo. Zelimo da pratimo route kada se sort properti promeni
        */

        sort(newVal) {
            // newValue je nova vrednost za property koji pratimo

            if (newVal === this.$route.query.sort) return // Vue ce nam izbaciti gresku ukoliko pokusavamo da posetimo stranicu koju vec posecujemo (na kojoj smo vec)

            this.$router.push({
                query: {
                    sort: newVal
                }
            })
        }
    }
}

/*
? I 
    1. Validate the Comment
        - required
        - min length of 3 chars
    2. Submit Comment
    3. Clear Input
    4. Get Comments
    5. Get Latest Comments on Submission
    6. Sort Comments

    TO KNOW: 
        - Path Parameters should be used for returning a single resource or multiple resources
        - Query Parameters should be user for soting/filtering through data

? II
    1. Store Song in the State when the play button is clicked.
    2. Play song.
    3. Toggle Play/Pause
    4. Render song information onto the player
        • Duration/Current Time
        • Song Name
        • Artist
    5. Keep track of the current progression of the song.
    6. Allow user to drag the scrubber around.
    7. Pause the song after it's done playing.
*/
</script>
