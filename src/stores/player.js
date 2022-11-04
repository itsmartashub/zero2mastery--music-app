import { Howl } from 'howler'
import { defineStore } from 'pinia'
import helper from '@/includes/helper'

export default defineStore('player', {
    state: () => ({
        current_song: {},
        sound: {},
        seek: '00:00',
        duration: '00:00',
        playerProgress: '0%'
    }),
    actions: {
        async newSong(song) {
            //! Ovako mozemo da pustamo vise pesma odj, a to ne zelimo. Zelimo da prethodnu instancu uklonimo, ako se nova kreira. Dakle ako stisnemo veliko play dugme tipa dva x, audio treba SAMO JEDNOM da se pusti!!!
            if (this.sound instanceof Howl) {
                this.sound.unload() //! Pauzira trenutni audio. Takodje ce da obrise instancu i ukloni je iz memorije
            }

            this.current_song = song

            this.sound = new Howl({
                src: [song.url],
                html5: true
            })
            this.sound.play()

            this.sound.on('play', () => {
                requestAnimationFrame(this.progress) // Slicna je kao i setInterval(), osim sto je f-ja pozvana PRE nego sto je sledeci frejm painted on the screen. Idealan je za apdejtovanje seek i duration propertija
            })
        },

        async toggleAudio() {
            // Trenutno nismo sigurni da li je Howler uopste ready. Ako nemamo Howl Object, mi ne mozemo da togglujemo audio. Inicijalno, nasa app ce ucitati sound property kao prazan Object. Ne bi bilo lose da proverimo da li je Object Howl Object ili je prazan Object:
            if (!this.sound.playing) return // playing je property koji imamo na Howl Objectu, ako je undefined ovo, onda nemamo Howl Object

            // Prvo proveravamo da li je audio pustem (is playing), jer onda znamo da li treba da budemo u mogucnosti da pauziramo ili pustimo pesmu:
            if (this.sound.playing()) {
                //! Ovde gde imamo playing() sa zagradama, gde invokujemo f-ju playing(), a ne samo playing kao gore, ovde proverava da li je aduio pusten! A gore proverava da li uopste postoji taj property, ondosno da li imamo Howl Object
                this.sound.pause()
            } else {
                this.sound.play()
            }
        },

        progress() {
            this.seek = helper.formatTime(this.sound.seek()) // vratice trenutnu poziciju gde se audio pusta
            this.duration = helper.formatTime(this.sound.duration())

            this.playerProgress = `${(this.sound.seek() / this.sound.duration()) * 100}%`

            //! 💣💣💣 REKURZIJA 💣💣💣
            if (this.sound.playing()) {
                requestAnimationFrame(this.progress)
            }

            // Ne moramo da brinemo o pozivanju f-je ako je audio pauziran. Event listener koji smo dodali u newSong() action f-ji ( this.sound.on('play', () => {requestAnimationFrame(this.progress)}) ) ce dispatchovati progress() f-ju ukoliko je pesma pazuirana i onda je pustiti ponovo.
        },
        updateSeek(event) {
            // Srecom, Vue uvek prosledi event object kao argument kad pozovemo neki event
            if (!this.sound.playing) return

            // const clickX = event.clientX //! Ali ovo ne valja. Player nije sirine citavog ekrana, tj entire width of the page, ako korisnik klikne na sredini player timeline, clientX property nece predstavljati koordinate relativne plejeru, vec ce biti reklativno document-u. Recimo: Document = 2000, Timeline = 1000, clientX = 1000 (ako kliknemo na sredinu timeline), Distance = 500. Ako zelimo da dobijemo koordinate relativne Timeline-u, treba da dohvatimo distancu od leve strane Documenta do leve strane Timelinea

            const { x, width } = event.currentTarget.getBoundingClientRect() // x je distanca od leve strane dokumenta do leve strane elementa na kom je nakacen click listener tj. plejera.
            const clickX = event.clientX - x
            const percentage = clickX / width // Ovo width je width  plejera
            const seconds = this.sound.duration() * percentage // Ovo nam daje poziciju gde treba audio da postavimo

            console.log(clickX)
            console.log(width)
            console.log(clickX / width)

            this.sound.seek(seconds)
            // Audio plejer se nece reflektovati na trenutnu poziciju audia. Treba da pozovemo progress() action fn nakon menjanja audio pozicije:
            this.sound.once('seek', this.progress) //? 💥💥💥 Seek ce privremeno pauzirati audio, istovremeno kontinuirano dispatchujemo progress() action. On ce mozda primetiti da se audio ne pusta vise, action ce prestati da dispatchuje samu sebe; ne zelimo da se ovo desi jer znamo da audio treba da promeni svoju poziciju. Pusticemo loop opet tako sto cemo da dispatchujemo action nakon sto audio promeni svoju poziciju. Koristicemo Howl fn once() koja osluskuje neki event, ako se event desi (emitted), pozvace cb fn koju posaljemo u nju za argument. Ova cb ce se izvrsiti samo jednom. Event koji osluskujemo je seek, a cb ce biti this.progress koju stavljamo za drugi argument once() fn-e
        }
    },

    getters: {
        playing: (state) => {
            if (state.sound.playing) return state.sound.playing()

            return false
        }
    }
})
