import { defineStore } from 'pinia'
import { auth, usersCollection } from '@/includes/firebase'

export default defineStore('user', {
    state: () => ({
        userLoggedIn: false
    }),

    actions: {
        async register(values) {
            const userCredentials = await auth.createUserWithEmailAndPassword(values.email, values.password)

            await usersCollection.doc(userCredentials.user.uid).set({
                name: values.name,
                email: values.email,
                age: values.age,
                country: values.country
            })

            await userCredentials.user.updateProfile({
                displayName: values.name
            })

            this.userLoggedIn = true
        },

        async authenticate(values) {
            await auth.signInWithEmailAndPassword(values.email, values.password)

            this.userLoggedIn = true

            //! u suprotnom, app ce da throw-uje error, sl linija koda se nece pokrenuti, ne moram nista vise. Ne moramo da ovu async f-ju smestimo u trycatch blok jer ce baciti error ako authentifikacija ne bude uspesna, error ce spreciti f-ju od daljeg executovanja.
        },

        async signOut() {
            await auth.signOut()
            this.userLoggedIn = false
            // window.location.reload()
        }
    }
})
