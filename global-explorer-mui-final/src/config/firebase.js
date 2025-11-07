import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD6_fltxzke20VBf3U67Nmau0N6JawIjTQ",
  authDomain: "claude-project-10b09.firebaseapp.com",
  projectId: "claude-project-10b09",
  storageBucket: "claude-project-10b09.firebasestorage.app",
  messagingSenderId: "998432816875",
  appId: "1:998432816875:web:33189310568b759341285e"
}

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
} catch (err) {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence')
  }
}

// Auth providers
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export const githubProvider = new GithubAuthProvider()

export default app
