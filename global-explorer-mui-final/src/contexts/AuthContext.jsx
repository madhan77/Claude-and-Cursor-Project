import { createContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })
    setCurrentUser({ ...userCredential.user, displayName })
    return userCredential
  }

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider)
  }

  const logout = () => {
    return signOut(auth)
  }

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
