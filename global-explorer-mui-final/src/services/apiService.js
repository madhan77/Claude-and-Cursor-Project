import axios from 'axios'

// API Configuration
const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

let amadeusAccessToken = null
let tokenExpiry = null

// ========== AMADEUS API ==========

const getAmadeusToken = async () => {
  if (amadeusAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return amadeusAccessToken
  }

  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) return null

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    amadeusAccessToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
    return amadeusAccessToken
  } catch (error) {
    console.error('Amadeus auth failed:', error)
    return null
  }
}

export const searchDestinations = async (query, options = {}) => {
  const token = await getAmadeusToken()

  if (!token) {
    return useFallbackDestinations(query, options)
  }

  try {
    const response = await axios.get(
      'https://test.api.amadeus.com/v1/reference-data/locations',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          subType: 'CITY',
          keyword: query,
          page: { limit: options.limit || 20 }
        }
      }
    )

    return transformAmadeusData(response.data.data)
  } catch (error) {
    console.error('Amadeus search failed:', error)
    return useFallbackDestinations(query, options)
  }
}

export const getFlightOffers = async (origin, destination, date) => {
  const token = await getAmadeusToken()
  if (!token) return null

  try {
    const response = await axios.get(
      'https://test.api.amadeus.com/v2/shopping/flight-offers',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: date,
          adults: 1,
          max: 10
        }
      }
    )

    return response.data.data
  } catch (error) {
    console.error('Flight search failed:', error)
    return null
  }
}

export const getHotelOffers = async (cityCode, checkInDate, checkOutDate) => {
  const token = await getAmadeusToken()
  if (!token) return generateFallbackHotels(cityCode)

  try {
    const response = await axios.get(
      'https://test.api.amadeus.com/v3/shopping/hotel-offers',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          cityCode,
          checkInDate,
          checkOutDate,
          adults: 1,
          roomQuantity: 1
        }
      }
    )

    return response.data.data
  } catch (error) {
    console.error('Hotel search failed:', error)
    return generateFallbackHotels(cityCode)
  }
}

// ========== GOOGLE PLACES API ==========

export const getPlaceDetails = async (placeId) => {
  if (!GOOGLE_PLACES_API_KEY) return null

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,rating,formatted_address,photos,opening_hours,website,price_level,reviews',
          key: GOOGLE_PLACES_API_KEY
        }
      }
    )

    return response.data.result
  } catch (error) {
    console.error('Google Places failed:', error)
    return null
  }
}

export const searchNearbyPlaces = async (lat, lng, type = 'tourist_attraction', radius = 5000) => {
  if (!GOOGLE_PLACES_API_KEY) return generateFallbackAttractions()

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: GOOGLE_PLACES_API_KEY
        }
      }
    )

    return response.data.results
  } catch (error) {
    console.error('Nearby search failed:', error)
    return generateFallbackAttractions()
  }
}

// ========== FALLBACK DATA ==========

const useFallbackDestinations = (query = '', options = {}) => {
  const destinations = [
    // Major Cities
    { id: 1, name: 'Paris', country: 'France', continent: 'Europe', iataCode: 'PAR', lat: 48.8566, lng: 2.3522 },
    { id: 2, name: 'London', country: 'United Kingdom', continent: 'Europe', iataCode: 'LON', lat: 51.5074, lng: -0.1278 },
    { id: 3, name: 'New York', country: 'USA', continent: 'North America', iataCode: 'NYC', lat: 40.7128, lng: -74.0060 },
    { id: 4, name: 'Tokyo', country: 'Japan', continent: 'Asia', iataCode: 'TYO', lat: 35.6762, lng: 139.6503 },
    { id: 5, name: 'Barcelona', country: 'Spain', continent: 'Europe', iataCode: 'BCN', lat: 41.3851, lng: 2.1734 },
    { id: 6, name: 'Dubai', country: 'UAE', continent: 'Asia', iataCode: 'DXB', lat: 25.2048, lng: 55.2708 },
    { id: 7, name: 'Singapore', country: 'Singapore', continent: 'Asia', iataCode: 'SIN', lat: 1.3521, lng: 103.8198 },
    { id: 8, name: 'Rome', country: 'Italy', continent: 'Europe', iataCode: 'ROM', lat: 41.9028, lng: 12.4964 },
    { id: 9, name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', iataCode: 'AMS', lat: 52.3676, lng: 4.9041 },
    { id: 10, name: 'Sydney', country: 'Australia', continent: 'Oceania', iataCode: 'SYD', lat: -33.8688, lng: 151.2093 },
    { id: 11, name: 'Bangkok', country: 'Thailand', continent: 'Asia', iataCode: 'BKK', lat: 13.7563, lng: 100.5018 },
    { id: 12, name: 'Istanbul', country: 'Turkey', continent: 'Europe', iataCode: 'IST', lat: 41.0082, lng: 28.9784 },
    { id: 13, name: 'Los Angeles', country: 'USA', continent: 'North America', iataCode: 'LAX', lat: 34.0522, lng: -118.2437 },
    { id: 14, name: 'Prague', country: 'Czech Republic', continent: 'Europe', iataCode: 'PRG', lat: 50.0755, lng: 14.4378 },
    { id: 15, name: 'Bali', country: 'Indonesia', continent: 'Asia', iataCode: 'DPS', lat: -8.3405, lng: 115.0920 },
    { id: 16, name: 'Vienna', country: 'Austria', continent: 'Europe', iataCode: 'VIE', lat: 48.2082, lng: 16.3738 },
    { id: 17, name: 'Hong Kong', country: 'China', continent: 'Asia', iataCode: 'HKG', lat: 22.3193, lng: 114.1694 },
    { id: 18, name: 'Venice', country: 'Italy', continent: 'Europe', iataCode: 'VCE', lat: 45.4408, lng: 12.3155 },
    { id: 19, name: 'Lisbon', country: 'Portugal', continent: 'Europe', iataCode: 'LIS', lat: 38.7223, lng: -9.1393 },
    { id: 20, name: 'Seoul', country: 'South Korea', continent: 'Asia', iataCode: 'SEL', lat: 37.5665, lng: 126.9780 },
    { id: 21, name: 'Mumbai', country: 'India', continent: 'Asia', iataCode: 'BOM', lat: 19.0760, lng: 72.8777 },
    { id: 22, name: 'Berlin', country: 'Germany', continent: 'Europe', iataCode: 'BER', lat: 52.5200, lng: 13.4050 },
    { id: 23, name: 'Athens', country: 'Greece', continent: 'Europe', iataCode: 'ATH', lat: 37.9838, lng: 23.7275 },
    { id: 24, name: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', iataCode: 'RIO', lat: -22.9068, lng: -43.1729 }
  ]

  let filtered = destinations
  if (query) {
    filtered = destinations.filter(d =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.country.toLowerCase().includes(query.toLowerCase())
    )
  }

  return filtered.slice(0, options.limit || 20)
}

const transformAmadeusData = (data) => {
  return data.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    country: item.address?.countryName || 'Unknown',
    continent: 'Various',
    iataCode: item.iataCode,
    lat: item.geoCode?.latitude || 0,
    lng: item.geoCode?.longitude || 0
  }))
}

const generateFallbackHotels = (cityCode) => {
  return [
    { name: `Grand Hotel ${cityCode}`, pricePerNight: 150, rating: 4.5, stars: 5 },
    { name: `City Center Inn ${cityCode}`, pricePerNight: 80, rating: 4.0, stars: 3 },
    { name: `Budget Stay ${cityCode}`, pricePerNight: 50, rating: 3.5, stars: 2 }
  ]
}

const generateFallbackAttractions = () => {
  return [
    { name: 'Historic Landmark', rating: 4.5, types: ['tourist_attraction'] },
    { name: 'City Museum', rating: 4.3, types: ['museum'] },
    { name: 'Central Park', rating: 4.7, types: ['park'] },
    { name: 'Local Market', rating: 4.2, types: ['point_of_interest'] }
  ]
}

export default {
  searchDestinations,
  getFlightOffers,
  getHotelOffers,
  getPlaceDetails,
  searchNearbyPlaces
}
