<template>
    <!-- Main Content -->
    <section class="container mx-auto mt-6">
        <div class="md:grid md:grid-cols-3 md:gap-4">
            <div class="col-span-1">
                <app-upload ref="upload" :addSong="addSong" />
            </div>

            <div class="col-span-2">
                <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
                        <span class="card-title">My Songs</span>
                        <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
                    </div>
                    <div class="p-6">
                        <!-- Composition Items -->
                        <composition-item
                            v-for="(song, i) in songs"
                            :key="song.docID"
                            :song="song"
                            :updateSong="updateSong"
                            :index="i"
                            :removeSong="removeSong"
                            :updateUnsavedFlag="updateUnsavedFlag"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// import useUserStore from '@/stores/user'
import AppUpload from '@/components/Upload.vue'
import CompositionItem from '@/components/CompositionItem.vue'
import { songsCollection, auth } from '@/includes/firebase'

export default {
    name: 'manage',
    components: { AppUpload, CompositionItem },

    data() {
        return {
            songs: [],
            unsavedFlag: false // ako je true treba da sprecimo korisnike od navigate away. Ovaj property treba da se apdejtuje kad god se vrednost promeni u nekih od pesama. data() proeprty je stored u Manage komponenti, ali polja su u CompositionItem.vue komponenti. Uradicemo sto i do sad: kreiracemo f-ju za modifikovanje vrednosti u ManageView.vue komponenti, pa cemo je proslediti u CompositionItem komponentu koja ce biti u mogucnosti da pozove ovu f-ju kad god se desi izmena u inputima (change kad se opali). Te hajde u methods da kreiramo updateUnsavedFlag f-ju
        }
    },

    async created() {
        /*
            kada napisemo async ovde, Vue ce da saceka sa okidanjem koda unutar created(), to znaci da ce Componenta da ucita template unutar stranice iako imamo async lifecycle f-ju.

            Trebalo bi da importujemo Firebase u Componentu ukoliko zelimo da kreiramo rikvest sa bazom. songsCollection nam je potrebno da bismo retrieve listu pesama iz baze podataka. Ovaj Object ce nam omoguciti direktu interakciju collection-a u db-u. auth servis ce nam omoguciti da dohvatimo ID korisnika, sacuvali smo ID korisnika sa song podacima sto ce nam pomoci da identifikujemo korisnika koji je uploadovao pesmu. Zelimo da se uverimo da dohvatamo pesme koje je korisnik upload-ovao.

            shift + alt + A
        */

        const snapshot = await songsCollection.where('uid', '==', auth.currentUser.uid).get() // chain-ujemo get() property, on nam vraca snapshot

        /*
        snapshot.forEach((document) => {
            // nismo sacuvali direkt snapshot u niz songs, jer on sadrzi svakakve podatke koje nam nisu potrebni, treba biti efikasan, te cemo da lupujemo kroz snapshot i izvucemo samo informacije koje su nam potrebne

            const song = {
                ...document.data(),
                docID: document.id
            }

            this.songs.push(song)
        })
        */

        snapshot.forEach(this.addSong)

        /*
            Sledece, treba da sacuvamo snapshot podatke u componentu. Imamo opciju da cuvamo u state, ali to necemo ciniti, jer nam ovi podaci nisu potrebni globalno dostupni. Smisao ove stranice jeste da korisnik moze da upravlja muzikom koju je on upload-ovao, oni licno imaju dozvolu da modifikuju ili brisu muziku koju su oni upload-ovali. Nema razloga da ovaj tip podataka bude dostupan svakoj stranici, ako je korisnik na stranici gde moze da edituje svoje podatke, onda ni ne postoji razlog da ti podaci budu tu, bzvz zauzimaju memoriju i prostor na masini
        */
    },

    methods: {
        updateSong(i, values) {
            this.songs[i].modified_name = values.modified_name
            this.songs[i].genre = values.genre
        },
        removeSong(i) {
            this.songs.splice(i, 1) // splice uklanja item iz niza, odn pesmu iz niza songs
            // Sad treba da pozovemo ovu f-ju u CompositionItem.vue kompoennti gde cemo je prihvatiti kao props
        },

        /*
            Upload.vue komponenta je child ove ManageView.vue komponente. songs array je definisan  u ManageView.vue komponenti. Mi treba da pushujemo song iz Upload.vue komponente u ManageView.vue komponentu. Ovo moze da se uradi na vise nacina. Prosledicemo f-ju iz Manage komponente u Upload koponentu. Ako upload-ovanje uspesno, pozvacemo f-ju koja ce imati pristup data propertijima i metodama u ManageView.vue komponente jer je definisano u parent kompnenti. Bicemo u mogucnosti da pushujemo song u niz.
            Dakle, prvo idemo da definisemo f-ju za dodavanje pesama. Ova f-ja mora biti definisana u Manage komponenti, u suprotnom necemo biti u mogucnosti da pushujemo song u songs niz.
        */

        addSong(document) {
            const song = {
                ...document.data(),
                docID: document.id
            }

            this.songs.push(song)
        },

        updateUnsavedFlag(value) {
            // value parametar ce se korisitti za unsavedFlag property
            this.unsavedFlag = value
        }
    },

    beforeRouteLeave(to, from, next) {
        // ovaj navigation guard se pokrene svaki x kad god ruter ide dalje od trenutne komponente, ovo nam omogucava da stopiramo router da ode sa ove trenutne stranice ako recimo korisnik upisuje formu.

        if (!this.unsavedFlag) {
            next()
        } else {
            const leave = confirm('You have unsaved changes. Are you sure you want to leave?')

            next(leave) // next() f-ja ima jedan opcioni argument, mozemo da mu prosledimo Boolean vrednost kojom bismo rekli ruteru kako da procesuira navigaciju. Ako prosledimo false, to je isto kao i da ne zovemo ovu f-ju, dok true govori ruteru da procesuira do sledece stranice
        }
    }

    /* beforeRouteEnter(to, from, next) {
        const store = useUserStore()

        if (store.userLoggedIn) {
            next()
            console.log('LOGGED')
        } else {
            next({ name: 'home' })
            console.log('NOT LOGGED')
        }
    },
    beforeRouteLeave(to, from, next) {
        //? issue: nemamo pristup podacima iz Upload.vue componente. Izolovano je iako je koristimo kao child komponentu. Ovo mozemo resiti koristeci referencu. $ref nam omogucava da selektujemo elemente u Vue

        this.$refs.upload.cancelUploads //? sa $ref mozemo da pozovemo metod komponente kojoj pristupamo

        next() //? bez ovoga korisnik ne bi bio u mogucnosti da naviguje dalje sa ove stranice
    } */
}

/*
    btw, reference ne mogu da menjaju Vue instancu ili njegove podatke (date), moze samo pristupati DOM-u

    1. WITH REACTIVITY
    Kako reactivity f-nise:
        - kada god menjas data, apdejtujes Vue instancu
        - nakon apdejtovanja Vue instance, promene se reflektuju na template
        - te promene se potom renderuju u DOM

        Dakle svaka promena u data, rezultuje promenom u DOMu


    2. WITH REFERENCE
        $ref nam daje direktan pristup DOM-u, kada pristupamo DOM-u preko $ref, Vue instanca se ne apdejtuje, i zato VUe nece pratiti nikakve promene za nas, i zato se data ne apdejtuje.
        Svaka promena u DOMU ucinjena preko $ref nije reaktivna. Ugl ih treba ozbegavati, ali pruzaju odlicno resenje kada se nadjete u situaciji gde ni jedno drugo resenje ne bi bilo prikladno
*/
</script>
