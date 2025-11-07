import {
  doc, setDoc, getDoc, collection, query, where, getDocs, addDoc,
  updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove,
  orderBy, limit
} from 'firebase/firestore'
import { db } from '../config/firebase'

// ========== USER PROFILE ==========

export const createUserProfile = async (userId, profileData) => {
  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null
}

export const updateUserProfile = async (userId, updates) => {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

// ========== BOOKMARKS / FAVORITES ==========

export const addBookmark = async (userId, destinationData) => {
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', destinationData.id.toString())
  await setDoc(bookmarkRef, {
    ...destinationData,
    bookmarkedAt: serverTimestamp()
  })
}

export const removeBookmark = async (userId, destinationId) => {
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', destinationId.toString())
  await deleteDoc(bookmarkRef)
}

export const getUserBookmarks = async (userId) => {
  const bookmarksRef = collection(db, 'users', userId, 'bookmarks')
  const bookmarksSnap = await getDocs(bookmarksRef)
  return bookmarksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const isDestinationBookmarked = async (userId, destinationId) => {
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', destinationId.toString())
  const bookmarkSnap = await getDoc(bookmarkRef)
  return bookmarkSnap.exists()
}

// ========== TRIPS / ITINERARIES ==========

export const createTrip = async (userId, tripData) => {
  const tripsRef = collection(db, 'trips')
  const tripDoc = await addDoc(tripsRef, {
    userId,
    ...tripData,
    destinations: tripData.destinations || [],
    isPublic: tripData.isPublic || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return tripDoc.id
}

export const getUserTrips = async (userId) => {
  const tripsRef = collection(db, 'trips')
  const q = query(tripsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const tripsSnap = await getDocs(q)
  return tripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const getTrip = async (tripId) => {
  const tripRef = doc(db, 'trips', tripId)
  const tripSnap = await getDoc(tripRef)
  return tripSnap.exists() ? { id: tripSnap.id, ...tripSnap.data() } : null
}

export const updateTrip = async (tripId, updates) => {
  const tripRef = doc(db, 'trips', tripId)
  await updateDoc(tripRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export const deleteTrip = async (tripId) => {
  const tripRef = doc(db, 'trips', tripId)
  await deleteDoc(tripRef)
}

export const addDestinationToTrip = async (tripId, destinationData) => {
  const tripRef = doc(db, 'trips', tripId)
  await updateDoc(tripRef, {
    destinations: arrayUnion(destinationData),
    updatedAt: serverTimestamp()
  })
}

export const removeDestinationFromTrip = async (tripId, destinationData) => {
  const tripRef = doc(db, 'trips', tripId)
  await updateDoc(tripRef, {
    destinations: arrayRemove(destinationData),
    updatedAt: serverTimestamp()
  })
}

// ========== REVIEWS / RATINGS ==========

export const addReview = async (userId, destinationId, reviewData) => {
  const reviewsRef = collection(db, 'reviews')
  const reviewDoc = await addDoc(reviewsRef, {
    userId,
    destinationId: destinationId.toString(),
    ...reviewData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return reviewDoc.id
}

export const getDestinationReviews = async (destinationId) => {
  const reviewsRef = collection(db, 'reviews')
  const q = query(
    reviewsRef,
    where('destinationId', '==', destinationId.toString()),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const reviewsSnap = await getDocs(q)
  return reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const getUserReviews = async (userId) => {
  const reviewsRef = collection(db, 'reviews')
  const q = query(reviewsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const reviewsSnap = await getDocs(q)
  return reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updateReview = async (reviewId, updates) => {
  const reviewRef = doc(db, 'reviews', reviewId)
  await updateDoc(reviewRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export const deleteReview = async (reviewId) => {
  const reviewRef = doc(db, 'reviews', reviewId)
  await deleteDoc(reviewRef)
}

// ========== SOCIAL FEATURES ==========

export const likeReview = async (reviewId, userId) => {
  const reviewRef = doc(db, 'reviews', reviewId)
  await updateDoc(reviewRef, {
    likes: arrayUnion(userId)
  })
}

export const unlikeReview = async (reviewId, userId) => {
  const reviewRef = doc(db, 'reviews', reviewId)
  await updateDoc(reviewRef, {
    likes: arrayRemove(userId)
  })
}

// ========== ACTIVITY LOG ==========

export const logUserActivity = async (userId, activityType, activityData) => {
  const activityRef = collection(db, 'users', userId, 'activity')
  await addDoc(activityRef, {
    type: activityType,
    data: activityData,
    timestamp: serverTimestamp()
  })
}
