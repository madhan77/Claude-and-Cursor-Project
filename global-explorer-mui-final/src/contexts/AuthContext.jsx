import { createContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../config/firebase'
import { createUserProfile, getUserProfile } from '../services/firestoreService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        // Load user profile from Firestore
        const profile = await getUserProfile(user.uid)
        if (!profile) {
          // Create profile if it doesn't exist
          await createUserProfile(user.uid, {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            bio: '',
            location: '',
            interests: [],
            travelStyle: ''
          })
          const newProfile = await getUserProfile(user.uid)
          setUserProfile(newProfile)
        } else {
          setUserProfile(profile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Sign up with email/password
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })

    // Create user profile in Firestore
    await createUserProfile(userCredential.user.uid, {
      email,
      displayName,
      photoURL: '',
      bio: '',
      location: '',
      interests: [],
      travelStyle: ''
    })

    // Send verification email
    await sendEmailVerification(userCredential.user)

    return userCredential
  }

  // Sign in with email/password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Sign in with Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)

    // Check if profile exists, create if not
    const profile = await getUserProfile(result.user.uid)
    if (!profile) {
      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        bio: '',
        location: '',
        interests: [],
        travelStyle: ''
      })
    }

    return result
  }

  // Sign in with GitHub
  const loginWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider)

    // Check if profile exists, create if not
    const profile = await getUserProfile(result.user.uid)
    if (!profile) {
      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        bio: '',
        location: '',
        interests: [],
        travelStyle: ''
      })
    }

    return result
  }

  // Logout
  const logout = () => {
    return signOut(auth)
  }

  // Password reset
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  // Update user password
  const changePassword = (newPassword) => {
    return updatePassword(currentUser, newPassword)
  }

  // Update user email
  const changeEmail = (newEmail) => {
    return updateEmail(currentUser, newEmail)
  }

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (updates.displayName || updates.photoURL) {
      await updateProfile(currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL
      })
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
    changePassword,
    changeEmail,
    updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
