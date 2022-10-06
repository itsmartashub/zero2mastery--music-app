import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
    // apiKey: 'AIzaSyCtVnduxFitcZh7wtPz4jDSqyKpBQ1fvwE',
    apiKey: import.meta.env.VITE_FIREBASE_API_K,
    authDomain: 'zero2mastery--musicapp.firebaseapp.com',
    projectId: 'zero2mastery--musicapp',
    storageBucket: 'zero2mastery--musicapp.appspot.com',
    // appId: '1:466256287640:web:204490d9b0903f497ebded'
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const db = firebase.firestore()
const usersCollection = db.collection('users')

export { auth, db, usersCollection }