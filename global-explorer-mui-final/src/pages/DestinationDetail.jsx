import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  Skeleton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem
} from '@mui/material'
import {
  ArrowBack,
  Bookmark,
  BookmarkBorder,
  Star,
  Place,
  Flight,
  Hotel,
  Restaurant,
  AttractionsOutlined,
  CalendarMonth,
  WbSunny,
  Cloud,
  AcUnit,
  Thermostat,
  Person,
  Add,
  Search,
  AddCircleOutline,
  Luggage
} from '@mui/icons-material'
import { AuthContext } from '../contexts/AuthContext'
import { useBookmarks } from '../hooks/useBookmarks'
import {
  searchDestinations,
  searchNearbyPlaces,
  getHotelOffers,
  getFlightOffers
} from '../services/apiService'
import {
  getDestinationReviews,
  addReview,
  getUserTrips,
  createTrip,
  addDestinationToTrip
} from '../services/firestoreService'
import { toast } from 'react-toastify'

// Unsplash image URLs for destinations
const getDestinationImage = (name) => {
  const images = {
    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200',
    'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200',
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200',
    'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200',
    'Los Angeles': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=1200',
    'Prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200',
    'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
    'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200',
    'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200',
    'Venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200',
    'Lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200',
    'Seoul': 'https://images.unsplash.com/photo-1601399363868-c73a36a7b0f9?w=1200',
    'Mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200',
    'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200',
    'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200',
    'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200'
  }
  return images[name] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'
}

// Generate destination descriptions
const getDestinationDescription = (name) => {
  const descriptions = {
    'Paris': 'The City of Light captivates visitors with its iconic landmarks, world-class museums, and romantic ambiance. From the Eiffel Tower to the Louvre, Paris offers an unforgettable blend of history, art, and culinary excellence.',
    'London': 'A vibrant metropolis where historic landmarks meet modern innovation. Experience royal palaces, world-renowned museums, diverse cuisine, and a thriving cultural scene in this dynamic city.',
    'New York': 'The city that never sleeps offers endless excitement with its iconic skyline, diverse neighborhoods, Broadway shows, world-class dining, and unparalleled energy.',
    'Tokyo': 'A fascinating blend of ancient tradition and cutting-edge technology. Discover serene temples, bustling markets, incredible cuisine, and futuristic architecture in this dynamic metropolis.',
    'Barcelona': 'A Mediterranean gem known for its stunning architecture, beautiful beaches, vibrant culture, and delicious cuisine. Gaudi\'s masterpieces and lively atmosphere make it truly special.',
    'Dubai': 'A futuristic oasis in the desert featuring record-breaking architecture, luxury shopping, pristine beaches, and world-class entertainment.',
    'Singapore': 'A clean, modern city-state offering a perfect mix of cultures, incredible food, lush gardens, and efficient urban planning.',
    'Rome': 'The Eternal City is a living museum where ancient ruins, Renaissance art, and delicious Italian cuisine create an unforgettable experience.',
    'Amsterdam': 'Charming canals, historic architecture, world-class museums, and a relaxed atmosphere make this Dutch capital truly special.'
  }
  return descriptions[name] || 'Discover this amazing destination with its unique culture, stunning landscapes, and unforgettable experiences.'
}

// Weather data generator
const getWeatherInfo = (name) => {
  const weather = {
    'Paris': { spring: '10-17°C', summer: '17-25°C', fall: '8-16°C', winter: '3-8°C', bestTime: 'April to October' },
    'London': { spring: '8-15°C', summer: '15-22°C', fall: '8-15°C', winter: '2-8°C', bestTime: 'May to September' },
    'New York': { spring: '10-20°C', summer: '20-29°C', fall: '10-20°C', winter: '-3-5°C', bestTime: 'April to June, September to November' },
    'Tokyo': { spring: '10-20°C', summer: '22-30°C', fall: '15-23°C', winter: '5-12°C', bestTime: 'March to May, September to November' },
    'Barcelona': { spring: '13-20°C', summer: '23-28°C', fall: '15-22°C', winter: '8-15°C', bestTime: 'May to September' },
    'Dubai': { spring: '24-33°C', summer: '33-42°C', fall: '27-35°C', winter: '18-26°C', bestTime: 'November to March' },
    'Singapore': { spring: '25-31°C', summer: '25-31°C', fall: '25-31°C', winter: '25-31°C', bestTime: 'February to April' }
  }
  return weather[name] || { spring: '15-25°C', summer: '25-35°C', fall: '15-25°C', winter: '5-15°C', bestTime: 'Spring and Fall' }
}

const DestinationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useContext(AuthContext)
  const { toggleBookmark, isBookmarked } = useBookmarks()

  const [destination, setDestination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  // Attractions state
  const [attractions, setAttractions] = useState([])
  const [attractionsLoading, setAttractionsLoading] = useState(false)

  // Hotels state
  const [hotels, setHotels] = useState([])
  const [hotelsLoading, setHotelsLoading] = useState(false)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')

  // Flights state
  const [flights, setFlights] = useState([])
  const [flightsLoading, setFlightsLoading] = useState(false)
  const [flightOrigin, setFlightOrigin] = useState('')
  const [flightDate, setFlightDate] = useState('')

  // Trip dialog state
  const [tripDialogOpen, setTripDialogOpen] = useState(false)
  const [trips, setTrips] = useState([])
  const [newTripName, setNewTripName] = useState('')
  const [creatingNewTrip, setCreatingNewTrip] = useState(false)

  // Load destination data
  useEffect(() => {
    loadDestination()
  }, [id])

  // Load reviews when tab changes
  useEffect(() => {
    if (tabValue === 0 && destination) {
      loadReviews()
    }
  }, [tabValue, destination])

  // Load attractions when tab changes
  useEffect(() => {
    if (tabValue === 1 && destination && attractions.length === 0) {
      loadAttractions()
    }
  }, [tabValue, destination])

  const loadDestination = async () => {
    setLoading(true)
    setError(null)
    try {
      const destinations = await searchDestinations('', { limit: 100 })
      const found = destinations.find(d => d.id === parseInt(id))

      if (found) {
        // Add rating and review count
        const rating = 4.2 + (found.id % 8) * 0.1
        const reviewCount = [234, 456, 789, 1023, 1567, 2134, 2890, 3456][found.id % 8]

        setDestination({
          ...found,
          rating: parseFloat(rating.toFixed(1)),
          reviewCount,
          description: getDestinationDescription(found.name),
          weather: getWeatherInfo(found.name)
        })
      } else {
        setError('Destination not found')
      }
    } catch (err) {
      console.error('Error loading destination:', err)
      setError('Failed to load destination')
      toast.error('Failed to load destination details')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    if (!destination) return

    setReviewsLoading(true)
    try {
      const data = await getDestinationReviews(destination.id)
      setReviews(data)
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const loadAttractions = async () => {
    if (!destination) return

    setAttractionsLoading(true)
    try {
      const data = await searchNearbyPlaces(destination.lat, destination.lng, 'tourist_attraction', 5000)
      setAttractions(data || [])
    } catch (err) {
      console.error('Error loading attractions:', err)
      toast.error('Failed to load attractions')
    } finally {
      setAttractionsLoading(false)
    }
  }

  const loadHotels = async () => {
    if (!destination || !checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    setHotelsLoading(true)
    try {
      const data = await getHotelOffers(destination.iataCode, checkInDate, checkOutDate)
      setHotels(data || [])

      if (!data || data.length === 0) {
        toast.info('No hotels found. Showing sample hotels.')
      }
    } catch (err) {
      console.error('Error loading hotels:', err)
      toast.error('Failed to load hotels')
    } finally {
      setHotelsLoading(false)
    }
  }

  const loadFlights = async () => {
    if (!flightOrigin || !flightDate) {
      toast.error('Please enter origin and departure date')
      return
    }

    setFlightsLoading(true)
    try {
      const data = await getFlightOffers(flightOrigin.toUpperCase(), destination.iataCode, flightDate)
      setFlights(data || [])

      if (!data || data.length === 0) {
        toast.info('No flights found for the selected criteria')
      }
    } catch (err) {
      console.error('Error loading flights:', err)
      toast.error('Failed to load flights')
    } finally {
      setFlightsLoading(false)
    }
  }

  const handleAddReview = async () => {
    if (!currentUser) {
      toast.error('Please login to add a review')
      navigate('/login')
      return
    }

    if (!newReview.comment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      await addReview(currentUser.uid, destination.id, {
        rating: newReview.rating,
        comment: newReview.comment,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        userEmail: currentUser.email
      })

      toast.success('Review added successfully')
      setNewReview({ rating: 5, comment: '' })
      setReviewDialogOpen(false)
      loadReviews()
    } catch (err) {
      console.error('Error adding review:', err)
      toast.error('Failed to add review')
    }
  }

  const handleAddToTrip = async () => {
    if (!currentUser) {
      toast.error('Please login to add to trip')
      navigate('/login')
      return
    }

    try {
      const userTrips = await getUserTrips(currentUser.uid)
      setTrips(userTrips)
      setTripDialogOpen(true)
    } catch (err) {
      console.error('Error loading trips:', err)
      toast.error('Failed to load trips')
    }
  }

  const handleSelectTrip = async (tripId) => {
    try {
      await addDestinationToTrip(tripId, {
        id: destination.id,
        name: destination.name,
        country: destination.country,
        iataCode: destination.iataCode
      })

      toast.success('Added to trip successfully')
      setTripDialogOpen(false)
    } catch (err) {
      console.error('Error adding to trip:', err)
      toast.error('Failed to add to trip')
    }
  }

  const handleCreateNewTrip = async () => {
    if (!newTripName.trim()) {
      toast.error('Please enter a trip name')
      return
    }

    setCreatingNewTrip(true)
    try {
      const tripId = await createTrip(currentUser.uid, {
        name: newTripName,
        destinations: [{
          id: destination.id,
          name: destination.name,
          country: destination.country,
          iataCode: destination.iataCode
        }],
        startDate: null,
        endDate: null
      })

      toast.success('Trip created and destination added')
      setTripDialogOpen(false)
      setNewTripName('')
    } catch (err) {
      console.error('Error creating trip:', err)
      toast.error('Failed to create trip')
    } finally {
      setCreatingNewTrip(false)
    }
  }

  const handleBookmarkClick = () => {
    if (!currentUser) {
      toast.error('Please login to bookmark destinations')
      navigate('/login')
      return
    }
    toggleBookmark(destination)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => navigate('/')}>
              <ArrowBack />
            </IconButton>
            <Skeleton variant="text" width={200} height={32} sx={{ ml: 2 }} />
          </Toolbar>
        </AppBar>

        <Skeleton variant="rectangular" height={400} />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" height={48} width={300} />
          <Skeleton variant="text" height={32} width={200} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={200} />
        </Container>
      </Box>
    )
  }

  if (error || !destination) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => navigate('/')}>
              <ArrowBack />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Destination not found'}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 600 }}>
            {destination.name}
          </Typography>
          <IconButton
            onClick={handleBookmarkClick}
            color={isBookmarked(destination.id) ? 'primary' : 'default'}
          >
            {isBookmarked(destination.id) ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Image */}
      <Box sx={{ position: 'relative', height: { xs: 300, md: 500 }, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={getDestinationImage(destination.name)}
          alt={destination.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            color: 'white',
            p: 4
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {destination.name}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
              <Chip
                icon={<Place />}
                label={`${destination.country}, ${destination.continent}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
              />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Star sx={{ color: 'warning.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {destination.rating}
                </Typography>
                <Typography variant="body2">
                  ({destination.reviewCount.toLocaleString()} reviews)
                </Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" gap={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Luggage />}
            onClick={handleAddToTrip}
            sx={{ borderRadius: 2 }}
          >
            Add to Trip
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setReviewDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Write a Review
          </Button>
        </Stack>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 600 }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Attractions" />
            <Tab label="Hotels" />
            <Tab label="Flights" />
          </Tabs>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Box>
                {/* Description */}
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  About {destination.name}
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  {destination.description}
                </Typography>

                {/* Best Time to Visit */}
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mt: 4 }}>
                  Best Time to Visit
                </Typography>
                <Card sx={{ mb: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CalendarMonth sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} color="primary.main">
                          {destination.weather.bestTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Optimal weather and conditions for visiting
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Weather Information */}
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Weather Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <WbSunny sx={{ color: 'warning.main' }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Spring
                          </Typography>
                        </Stack>
                        <Typography variant="h6">{destination.weather.spring}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Thermostat sx={{ color: 'error.main' }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Summer
                          </Typography>
                        </Stack>
                        <Typography variant="h6">{destination.weather.summer}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Cloud sx={{ color: 'info.main' }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Fall
                          </Typography>
                        </Stack>
                        <Typography variant="h6">{destination.weather.fall}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <AcUnit sx={{ color: 'primary.main' }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Winter
                          </Typography>
                        </Stack>
                        <Typography variant="h6">{destination.weather.winter}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Reviews Section */}
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Reviews ({reviews.length})
                </Typography>

                {reviewsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : reviews.length > 0 ? (
                  <Stack spacing={2}>
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {review.userName?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {review.userName || 'Anonymous'}
                                </Typography>
                                <Rating value={review.rating} readOnly size="small" />
                              </Stack>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {review.comment}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    No reviews yet. Be the first to review {destination.name}!
                  </Alert>
                )}
              </Box>
            )}

            {/* Attractions Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Top Attractions
                </Typography>

                {attractionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : attractions.length > 0 ? (
                  <Grid container spacing={3}>
                    {attractions.slice(0, 12).map((attraction, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <AttractionsOutlined color="primary" />
                              <Typography variant="h6" fontWeight={600} noWrap>
                                {attraction.name}
                              </Typography>
                            </Stack>
                            {attraction.rating && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Rating value={attraction.rating} readOnly size="small" precision={0.1} />
                                <Typography variant="body2" color="text.secondary">
                                  {attraction.rating.toFixed(1)}
                                </Typography>
                              </Stack>
                            )}
                            {attraction.vicinity && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {attraction.vicinity}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No attractions found. Try exploring the area when you visit!
                  </Alert>
                )}
              </Box>
            )}

            {/* Hotels Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Find Hotels
                </Typography>

                <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Check-in Date"
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Check-out Date"
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: checkInDate || new Date().toISOString().split('T')[0] }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Search />}
                          onClick={loadHotels}
                          disabled={hotelsLoading}
                          sx={{ height: '56px' }}
                        >
                          {hotelsLoading ? 'Searching...' : 'Search Hotels'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {hotelsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : hotels.length > 0 ? (
                  <Grid container spacing={3}>
                    {hotels.map((hotel, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                          <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Hotel color="primary" />
                              <Typography variant="h6" fontWeight={600} noWrap>
                                {hotel.hotel?.name || hotel.name || `Hotel ${index + 1}`}
                              </Typography>
                            </Stack>
                            {hotel.rating && (
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                <Rating value={hotel.rating} readOnly size="small" precision={0.1} />
                                <Chip label={`${hotel.stars || 3} Stars`} size="small" />
                              </Stack>
                            )}
                            <Typography variant="h5" fontWeight={700} color="primary.main">
                              ${hotel.offers?.[0]?.price?.total || hotel.pricePerNight || 120}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              per night
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Search for hotels by selecting your check-in and check-out dates
                  </Alert>
                )}
              </Box>
            )}

            {/* Flights Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Find Flights
                </Typography>

                <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Origin (Airport Code)"
                          placeholder="e.g., JFK, LAX"
                          value={flightOrigin}
                          onChange={(e) => setFlightOrigin(e.target.value.toUpperCase())}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Flight />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Departure Date"
                          type="date"
                          value={flightDate}
                          onChange={(e) => setFlightDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Search />}
                          onClick={loadFlights}
                          disabled={flightsLoading}
                          sx={{ height: '56px' }}
                        >
                          {flightsLoading ? 'Searching...' : 'Search Flights'}
                        </Button>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Destination: {destination.name} ({destination.iataCode})
                    </Typography>
                  </CardContent>
                </Card>

                {flightsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : flights.length > 0 ? (
                  <Stack spacing={2}>
                    {flights.map((flight, index) => (
                      <Card key={index}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Flight {index + 1}
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {flightOrigin} → {destination.iataCode}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Duration
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {flight.itineraries?.[0]?.duration || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Stops
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {flight.itineraries?.[0]?.segments?.length - 1 || 0} stops
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="right">
                                ${flight.price?.total || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" textAlign="right" display="block">
                                {flight.price?.currency || 'USD'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    Search for flights by entering your departure airport and travel date
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review for {destination.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Your Rating
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(e, newValue) => setNewReview({ ...newReview, rating: newValue })}
              size="large"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              placeholder="Share your experience about this destination..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddReview}>
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add to Trip Dialog */}
      <Dialog
        open={tripDialogOpen}
        onClose={() => setTripDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add to Trip</DialogTitle>
        <DialogContent>
          {trips.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select an existing trip or create a new one
              </Typography>
              <List>
                {trips.map((trip) => (
                  <ListItem key={trip.id} disablePadding>
                    <ListItemButton onClick={() => handleSelectTrip(trip.id)}>
                      <Luggage sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={trip.name}
                        secondary={`${trip.destinations?.length || 0} destinations`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              You don't have any trips yet. Create your first trip!
            </Alert>
          )}

          <Typography variant="subtitle2" gutterBottom>
            Create New Trip
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter trip name"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={handleCreateNewTrip}
              disabled={creatingNewTrip}
            >
              Create
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTripDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DestinationDetail
