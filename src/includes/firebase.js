import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

const firebaseConfig = {
    // apiKey: 'AIzaSyCtVnduxFitcZh7wtPz4jDSqyKpBQ1fvwE',
    apiKey: import.meta.env.VITE_FIREBASE_API_K,
    authDomain: 'zero2mastery--musicapp.firebaseapp.com',
    projectId: 'zero2mastery--musicapp',
    storageBucket: 'zero2mastery--musicapp.appspot.com',
    // appId: '1:466256287640:web:204490d9b0903f497ebded',
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const db = firebase.firestore()
const storage = firebase.storage()

db.enablePersistence().catch((err) => {
    console.log(`Firebase persistence error ${err.code}`)
}) // enablePersistence je firebase feature koji s ekoristi sa kesiranje podataka sa firebase. enablePersistence() ce reci Firebase-u da zadrzi kopiju baze podataka na korisnikovom browseru. Vrednost koja se vrati ovom f-jom je Promise. Mi ne treba da hendujemo Promise, ali bi trebalo da hendlujemo ukoliko dodje do nekih gresaka te cemo chainovati catch() f-ju

const usersCollection = db.collection('users')
const songsCollection = db.collection('songs')
const commentsCollection = db.collection('comments')

export { auth, db, usersCollection, songsCollection, commentsCollection, storage }
