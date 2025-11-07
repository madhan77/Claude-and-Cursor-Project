import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import {
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  isDestinationBookmarked
} from '../services/firestoreService'
import { toast } from 'react-toastify'

export const useBookmarks = () => {
  const { currentUser } = useContext(AuthContext)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadBookmarks()
    } else {
      setBookmarks([])
      setLoading(false)
    }
  }, [currentUser])

  const loadBookmarks = async () => {
    try {
      const data = await getUserBookmarks(currentUser.uid)
      setBookmarks(data)
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (destination) => {
    if (!currentUser) {
      toast.error('Please login to bookmark destinations')
      return
    }

    try {
      const isBookmarked = await isDestinationBookmarked(currentUser.uid, destination.id)

      if (isBookmarked) {
        await removeBookmark(currentUser.uid, destination.id)
        setBookmarks(bookmarks.filter(b => b.id !== destination.id))
        toast.success('Removed from bookmarks')
      } else {
        await addBookmark(currentUser.uid, destination)
        setBookmarks([...bookmarks, destination])
        toast.success('Added to bookmarks')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark')
    }
  }

  const isBookmarked = (destinationId) => {
    return bookmarks.some(b => b.id === destinationId)
  }

  return {
    bookmarks,
    loading,
    toggleBookmark,
    isBookmarked,
    refetch: loadBookmarks
  }
}
