<template>
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">Upload</span>
            <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
            <!-- Upload Dropbox -->
            <div
                class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
                :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }"
                @drag.prevent.stop=""
                @dragstart.prevent.stop=""
                @dragend.prevent.stop="is_dragover = false"
                @dragover.prevent.stop="is_dragover = true"
                @dragenter.prevent.stop="is_dragover = true"
                @dragleave.prevent.stop="is_dragover = false"
                @drop.prevent.stop="upload($event)"
            >
                <h5>Drop your files here</h5>
            </div>

            <input type="file" multiple @change="upload($event)" />
            <hr class="my-6" />
            <!-- Progess Bars -->

            <div class="mb-4" v-for="upload in uploads" :key="upload.name">
                <!-- File Name -->
                <div class="font-bold text-sm" :class="upload.text_class">
                    <i :class="upload.icon"></i> {{ upload.name }}
                </div>
                <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
                    <!-- Inner Progress Bar -->
                    <div
                        class="transition-all progress-bar"
                        :class="upload.variant"
                        :style="{ width: upload.current_progress + '%' }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { storage, auth, songsCollection } from '@/includes/firebase'

export default {
    name: 'Upload',
    data() {
        return {
            is_dragover: false,
            uploads: []
        }
    },

    props: ['addSong'],

    methods: {
        upload($event) {
            this.is_dragover = false

            // console.log($event) //! iz nekog razloga kada logujemo ovaj event, u dataTransfers > files: FileList { length: 0 }, odnosno kao da nema nikakav fajl, ali to je bug u BROWSERU

            // const { files } = $event.dataTransfer
            // console.log(files) // ali sada se vide fajlovi

            // Firebase nam omogucava da upload-ujemo vise fajlova istovremeno, ali moraju biti prosledjeni jedan po jedan. Zato cemo da lupujemo kroz files iz $eventa, i svakom iteracijom cemo da saljemo fajl na Firebase. files je ustvari objekat, mozda izgleda kao Array jer su keys numeric, ali je Object. Ne mozemo da lupujemo kroz array object. Treba da konvertujemo files u Array.

            const files = $event.dataTransfer ? [...$event.dataTransfer.files] : [...$event.target.files] // da li je event kreiran sa @drop-n-drop ili @change eventom. $event.dataTransfer ce postojati samo ako je drag-n-drop, ako je on true, onda zelimo da const files bude $event.dataTransfer, u suprotnom stavljamo $event.target.files, stavjamo [...] jer ce property biti Object pa konveertujemo u Array

            files.forEach((file) => {
                console.log(file)

                if (file.type !== 'audio/mpeg') return

                // hendlujemo moguce greske ako korisnik pokusa da upload-uje fajlove dok je OFFLINE
                if (!navigation.onLine) {
                    this.uploads.push({
                        task: {}, // task sluzi da dobijemo informacije o downloadu. Ali posto necemo inicijalizovati uopste download, ostavicemo ga kao prazan objekat
                        current_progress: 100, // koristi se za width progress bara, stavicemo 100, al cemo ga obojiti u crveno
                        name: file.name,
                        variant: 'bg-red-400',
                        icon: 'fas fa-times',
                        text_class: 'text-red-400'
                    })
                    return
                }

                const storageRef = storage.ref() //! zero2mastery--musicapp.appspot.com, kreiramo ovo za Firebase, da bi znao GDE DA UPLOAD-uje FILE. Ovo je ROOT reference

                const songsRef = storageRef.child(`songs/${file.name}`) // zero2mastery--musicapp.appspot.com/neko_ime_audia.mp3. Ovo jde subdirectory. CHILD u ROOT-u, razlika izmedju child() i ref() je ta da child() pravi path relativno u odnosu na parent ref, u ovom slucaju, parent ref je storageRef

                const task = songsRef.put(file) //! svaka reference dolazi sa metodom koji se zove put(), on inicijalizuje upload proces. U put() metod stavimo file koji zelimo da upload-ujemo
                // Firebase Object koji vraca upload-om (tj ovim put() metodom) zove taskSnapshot

                const uploadIndex =
                    this.uploads.push({
                        task,
                        current_progress: 0,
                        name: file.name,
                        variant: 'bg-blue-400',
                        icon: 'fas fa-spinner fa-spin',
                        text_class: ''
                    }) - 1

                task.on(
                    // metod on() nam omogucava da osluskujemo events nad upload-om
                    'state_changed',

                    (snapshot) => {
                        // state_changed nam daje informacije o 3 stavrui: progres upload-a, da li je upload fejlovao ili uspeo. snapshot sadrzi informacije o trenutnom upload-u
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // ovo je racunica za dobijeno procenta progresa
                        this.uploads[uploadIndex].current_progress = progress
                    },

                    (error) => {
                        this.uploads[uploadIndex].variant = 'bg-red-400'
                        this.uploads[uploadIndex].icon = 'fas fa-times'
                        this.uploads[uploadIndex].text_class = 'text-red-400'
                        console.log(error)
                    }, // drugi argument on() metoda je metod koji je zaduzen za errore

                    async () => {
                        console.log(task.snapshot)

                        const song = {
                            // 1. id of the user who upload the store
                            uid: auth.currentUser.uid,
                            displayName: auth.currentUser.displayName,
                            original_name: task.snapshot.ref.name, // ovaj snapshot u task.snapshot je isti onaj snapshot Object koji smo prosledili iz on() metoda gore sto je poslat kao argument. Snapshot Object sadrzi referencu za upload. Referenca predstavalja putanju do fajla i njegove podatke, dakle tu imamo i ref.name.
                            modified_name: task.snapshot.ref.name,
                            genre: '',
                            comment_count: 0
                        }

                        song.url = await task.snapshot.ref.getDownloadURL() // ova f-ja vraca Promise, koristicemo async await
                        const songRef = await songsCollection.add(song) // isto vraca Promise. Necemo cvati vrednost koja se vraca, jer nam nije potrebna trenutno
                        const songSnapshot = await songRef.get()

                        this.addSong(songSnapshot) // prosledjivanjem ove songRef reference bicemo u mogucnosti da pushujemo njegove podatke u ovaj songs niz koji je u Manage komponenti. Sad idemo nazad u ManageView.vue komponentu i u addSong() komponenti zelimo da kreiramo application data, da ih merdzujemo sa song podacima, i onda da pushujemo merdzovane podatke u niz. Ovo smo vec uradili u created() f-ji u ManageView.vue komponenti. Pa cemo da to prebacimo u addSong() i onda u created u forEach pozove tu f-ju

                        this.uploads[uploadIndex].variant = 'bg-green-400'
                        this.uploads[uploadIndex].icon = 'fas fa-check'
                        this.uploads[uploadIndex].text_class = 'text-green-400'
                    } // treci argument on() metoda je metod koji je zaduzen za kad je fajl uspesno upload-ovan
                )
            })
        },
        cancelUploads() {
            this.uploads.forEach((upload) => {
                upload.task.cancel()
            })
        }
    },

    beforeUnmount() {
        //! kenseluje upload-ovanje fajla ukoliko u toku procesa menjamo rute, jbg, uploadovanje vuce resurse, bandwidth, malo glupo da jos vuce i na menjanje rute valjda. BTW, kad promenimo rutu, componenta se iznova kreira i ponistava. Dakle onaj deo sa onom linijom ucitavanja fajla i sve ostalo necemo videti ukoliko promenimo rutu

        this.uploads.forEach((upload) => {
            upload.task.cancel()
        })

        //? Navigation guards moraju biti definisani u komponenti u kojoj je registrovan ruter. Upload.vue komponenta nije komponenta u kojoj smo definisali manage route, to je child komponenta ManageView.vue komponente. Dakle idemo u ManageView.vue i dodajemo beforeRouteLeave(). Medjutim blabla, ipak je ovo resenje??
    }
}
</script>
