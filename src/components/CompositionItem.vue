<template>
    <div class="border border-gray-200 p-3 mb-4 rounded">
        <div v-show="!showForm">
            <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
            <button
                class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
                @click.prevent="deleteSong"
            >
                <i class="fa fa-times"></i>
            </button>
            <button
                class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
                @click.prevent="showForm = !showForm"
            >
                <i class="fa fa-pencil-alt"></i>
            </button>
        </div>

        <div v-show="showForm">
            <div class="text-white text-center font-bold p-4 mb-4" v-if="show_alert" :class="alert_variant">
                {{ alert_message }}
            </div>

            <vee-form :validation-schema="schema" :initial-values="song" @submit="edit">
                <div class="mb-3">
                    <label class="inline-block mb-2">Song Title</label>
                    <vee-field
                        name="modified_name"
                        type="text"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        placeholder="Enter Song Title"
                        @input="updateUnsavedFlag(true)"
                    />
                    <ErrorMessage class="text-red-600" name="modified_name" />
                </div>
                <div class="mb-3">
                    <label class="inline-block mb-2">Genre</label>
                    <vee-field
                        name="genre"
                        type="text"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        placeholder="Enter Genre"
                        @input="updateUnsavedFlag(true)"
                    />
                    <ErrorMessage class="text-red-600" name="genre" />
                </div>

                <button type="submit" class="py-1.5 px-3 rounded text-white bg-green-600" :disabled="in_submission">
                    Submit
                </button>
                <button
                    type="button"
                    class="py-1.5 px-3 rounded text-white bg-gray-600"
                    :disabled="in_submission"
                    @click.prevent="showFarm = false"
                >
                    Go Back
                </button>
            </vee-form>
        </div>
    </div>
</template>

<script>
import { songsCollection, storage } from '@/includes/firebase'

export default {
    name: 'CompositionItem',
    props: {
        song: {
            type: Object,
            required: true
        },
        updateSong: {
            type: Function,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        removeSong: {
            type: Function,
            required: true
        },
        updateUnsavedFlag: {
            type: Function
        }
    },
    data() {
        return {
            showForm: false,
            schema: {
                modified_name: 'required',
                genre: 'alpha_spaces'
            },
            in_submission: false, // za disejblovanje submission dugmeta
            show_alert: false,
            alert_variant: 'bg-blue-500',
            alert_message: 'Please wait! Updating song info.'
        }
    },
    methods: {
        async edit(values) {
            // obavesticemo korisnika o statusu svog editovanja
            console.log('Song edited')
            this.in_submission = true
            this.show_alert = true
            this.alert_variant = 'bg-blue-500'
            this.alert_message = 'Please wait! Updating song info.'

            try {
                await songsCollection.doc(this.song.docID).update(values) // update f-ja nam omogucava da editujemo bilo koji property unutar Objecta vracenog ovom doc() f-jom/ Ali nama nije potrebno da editujemo svaki property vec neki konkretan. Dakle ne moramo u update da prosledimo citav Object. Zelimo da editujemo modified_name i genre properties. Pitanje je, kako dohvatamo vrednosti iz forme? Vee-validate ce da prosledi vrednost field-a kao argument nasoj edit() f-ji, on to radi za nas automatski. Mozemo da prohvatimo argumente dodajuci values parametar edit() f-ji, ovo values ce da sadrzi vrednosti iz polja koja mogu konkretno biti prozvana pozivajuci property koji smo dali u name atributima. Update() f-ja ce vratiti Promise te cemo dodati async ispred edit(). Zelimo da hendlujemo errore, zato koristimo try-catch
            } catch (error) {
                this.in_submission = false
                this.show_alert = true
                this.alert_variant = 'bg-red-500'
                this.alert_message = 'Something went wrong! Try again later'
                return
            }

            this.updateSong(this.index, values)
            this.updateUnsavedFlag(false)

            this.in_submission = false
            this.alert_variant = 'bg-green-500'
            this.alert_message = 'Success'

            // Medjutim, iako smo editovali pesmu, kada se vratimo na Manage, ovo se ne reflektuje na pesme. To je jer se podaci u ManageView nisu apdejtovali. Moramo da posaljemo promene gore u ManageView komponentu da bi prihvatila promene. Idemo u ManageView.vue da kreiramo updateSong() metod, kojoj prosledjujemo index pesme koju zelimo da epdejtujemo, i values odnosto podatke iz forme tj ime pesme i zanr
        },

        async deleteSong() {
            // async je jer cemo da saljemo zahtev Firebase-u
            // odakle da pocnemo, da li sa brisanjem pesme u storage ili database? U ovom slucaju to stv nije vazno. Pocecemo sa Storage. Referenca ce morati biti kreirana ukoliko zelimo interakciju sa fajlom u storage-u. Najbolja praksa je da kreiramo dve reference: jedna za root storage-a, a druga za konkretan fajl u storage-u. Da bismo ovo mogli da uradimo, potrebno je da importujemo storage Object iz naseg firebase.js
            const storageRef = storage.ref()
            const songRef = storageRef.child(`songs/${this.song.original_name}`) // child() ima 1 argument, a to je putnja relativna referenci nad kojom se zove. Sacuvali smo tu fajl pod original_name, te je vrlo bitno i sad da koristimo original_name, a ne modified_name, jer korisnik moze cesto da menja to ime, dobili bismo error ili bismo mozda cak i obrisali pogresnu pesmu

            await songRef.delete() // medjutim, imamo problem. Ovo nece f-nisati jer nismo napisali kod kojim bismo dozvolili korisniku da brise pesme. Moramo da prilagodimo pravila tome. Idemou rules da dodamo allow delete: if request.auth != null

            // sad treba da selektujemo Document sa kojim zelimo interakciju
            await songsCollection.doc(this.song.docID).delete()

            // postoji jos jedan probleb. Pesma ce se i dalje pojavljivati na listi jer se nalazi u Upload nizu, treba da je uklonimo. To ce biti tricky jer mi smo u child componenti, ne mozemo da pristupimo tom uploads nizu, imamo samo pristup pojedinoj pesmi. Ovo mozemo resiti kreirajuci f-ju u ManageView.vue komponenti, onda cemo tu f-ju da prosledimo u CompositionItem.vue komponenti da obrise pesmu
            this.removeSong(this.index)
        }
    }
}
</script>
