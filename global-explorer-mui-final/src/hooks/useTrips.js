import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import {
  getUserTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  addDestinationToTrip,
  removeDestinationFromTrip
} from '../services/firestoreService'
import { toast } from 'react-toastify'

export const useTrips = () => {
  const { currentUser } = useContext(AuthContext)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadTrips()
    } else {
      setTrips([])
      setLoading(false)
    }
  }, [currentUser])

  const loadTrips = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const data = await getUserTrips(currentUser.uid)
      setTrips(data)
    } catch (error) {
      console.error('Error loading trips:', error)
      toast.error('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const addTrip = async (tripData) => {
    if (!currentUser) {
      toast.error('Please login to create trips')
      return null
    }

    try {
      const tripId = await createTrip(currentUser.uid, tripData)
      await loadTrips()
      toast.success('Trip created successfully')
      return tripId
    } catch (error) {
      console.error('Error creating trip:', error)
      toast.error('Failed to create trip')
      return null
    }
  }

  const editTrip = async (tripId, updates) => {
    try {
      await updateTrip(tripId, updates)
      await loadTrips()
      toast.success('Trip updated successfully')
    } catch (error) {
      console.error('Error updating trip:', error)
      toast.error('Failed to update trip')
    }
  }

  const removeTrip = async (tripId) => {
    try {
      await deleteTrip(tripId)
      setTrips(trips.filter(t => t.id !== tripId))
      toast.success('Trip deleted successfully')
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast.error('Failed to delete trip')
    }
  }

  const addDestination = async (tripId, destination) => {
    try {
      await addDestinationToTrip(tripId, destination)
      await loadTrips()
      toast.success('Destination added to trip')
    } catch (error) {
      console.error('Error adding destination:', error)
      toast.error('Failed to add destination')
    }
  }

  const removeDestination = async (tripId, destination) => {
    try {
      await removeDestinationFromTrip(tripId, destination)
      await loadTrips()
      toast.success('Destination removed from trip')
    } catch (error) {
      console.error('Error removing destination:', error)
      toast.error('Failed to remove destination')
    }
  }

  return {
    trips,
    loading,
    addTrip,
    editTrip,
    removeTrip,
    addDestination,
    removeDestination,
    refetch: loadTrips
  }
}
