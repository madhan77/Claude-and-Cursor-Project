import { useState, useEffect, useMemo, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { generateExpandedDestinations, fetchAttractionData } from '../services/destinationApi'
import { toast } from 'react-toastify'
import {
  AppBar, Toolbar, Typography, Container, Box, Chip, Paper,
  Grid, Card, CardContent, CardMedia, Button, IconButton, Divider,
  List, ListItem, ListItemIcon, ListItemText, Avatar,
  Tabs, Tab, Stack, Alert, Menu, MenuItem as MenuItemMui, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import {
  ArrowBack, Star, LocationOn, AttachMoney, CalendarToday,
  Language, WbSunny, Landscape, Restaurant, Museum,
  LocalActivity, ShoppingBag, Nightlife, BeachAccess,
  Hiking, CheckCircle, Add, TravelExplore, Logout, AccountCircle,
  Hotel, Wifi, Pool, Restaurant as RestaurantIcon, FitnessCenter, Close
} from '@mui/icons-material'

const DestinationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, logout } = useContext(AuthContext)
  const [tabValue, setTabValue] = useState(0)
  const [tripDays, setTripDays] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [attractionDetails, setAttractionDetails] = useState({})
  const [loadingAttractions, setLoadingAttractions] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [hotelModalOpen, setHotelModalOpen] = useState(false)

  // Generate all destinations
  const allDestinations = useMemo(() => generateExpandedDestinations(), [])

  // Find the specific destination
  const destination = allDestinations.find(dest => dest.id.toString() === id)

  // Helper function to generate attractions
  const generateAttractions = (cityName) => {
    return [
      `${cityName} Old Town`,
      `${cityName} Museum`,
      `${cityName} Central Park`,
      `${cityName} Cathedral`,
      `${cityName} Market Square`,
      `${cityName} Waterfront`,
      `${cityName} Historic District`,
      `${cityName} Art Gallery`,
      `${cityName} Castle`
    ]
  }

  // Get hotels - if neighborhood, get parent city hotels
  const getHotelsForDestination = () => {
    if (!destination) return []

    if (destination.popularHotels && destination.popularHotels.length > 0) {
      return destination.popularHotels
    }

    // If this is a neighborhood, try to find parent city
    if (destination.parentCity) {
      const parentCity = allDestinations.find(d =>
        d.name === destination.parentCity && d.type === 'city'
      )
      return parentCity?.popularHotels || []
    }

    return []
  }

  useEffect(() => {
    if (!destination) {
      toast.error('Destination not found')
      navigate('/')
    }
  }, [destination, navigate])

  // Fetch real-time attraction data when Popular Places tab is viewed
  useEffect(() => {
    if (tabValue === 1 && destination && Object.keys(attractionDetails).length === 0) {
      loadAttractionDetails()
    }
  }, [tabValue, destination])

  const loadAttractionDetails = async () => {
    if (!destination) return

    setLoadingAttractions(true)
    const attractions = destination.topAttractions?.length > 0
      ? destination.topAttractions
      : generateAttractions(destination.name)

    const cityName = destination.parentCity || destination.name
    const details = {}

    // Fetch details for first 6 attractions (to avoid rate limits)
    for (let i = 0; i < Math.min(attractions.length, 6); i++) {
      const attraction = attractions[i]
      try {
        const data = await fetchAttractionData(cityName, attraction)
        details[attraction] = data
      } catch (error) {
        console.error(`Error fetching data for ${attraction}:`, error)
      }
    }

    setAttractionDetails(details)
    setLoadingAttractions(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleAddToTrip = (attraction) => {
    setTripDays(prev => [...prev, {
      attraction,
      time: prev.filter(t => t.type !== 'hotel').length % 3 === 0 ? 'Morning' :
            prev.filter(t => t.type !== 'hotel').length % 3 === 1 ? 'Afternoon' : 'Evening',
      type: 'attraction'
    }])
    toast.success(`Added ${attraction} to your trip plan`)
  }

  const handleRemoveFromTrip = (index) => {
    setTripDays(prev => prev.filter((_, i) => i !== index))
    toast.info('Removed from trip plan')
  }

  const handleHotelDetailsClick = (hotel) => {
    setSelectedHotel(hotel)
    setHotelModalOpen(true)
  }

  const handleCloseHotelModal = () => {
    setHotelModalOpen(false)
    setSelectedHotel(null)
  }

  const handleBookHotel = () => {
    if (selectedHotel) {
      setTripDays(prev => [...prev, {
        attraction: `${selectedHotel.name}`,
        time: 'Accommodation',
        type: 'hotel',
        hotel: selectedHotel
      }])
      toast.success(`Added ${selectedHotel.name} to your trip plan`)
      handleCloseHotelModal()
    }
  }

  // Calculate trip statistics
  const tripAttractions = tripDays.filter(item => item.type === 'attraction')
  const tripHotels = tripDays.filter(item => item.type === 'hotel')
  const totalDays = Math.ceil(tripAttractions.length / 3) || 0 // Assume 3 attractions per day
  const recommendedHotelNights = Math.max(0, totalDays - 1) // Need hotel for (days - 1) nights
  const totalHotelCost = tripHotels.reduce((sum, item) => sum + (item.hotel?.pricePerNight || 0), 0)
  const totalAttractionCost = destination.averageCost * totalDays
  const totalTripCost = totalAttractionCost + totalHotelCost

  if (!destination) {
    return null
  }

  // Generate popular attractions if not available
  const attractions = destination.topAttractions?.length > 0
    ? destination.topAttractions
    : generateAttractions(destination.name)

  const activityIcons = {
    'Sightseeing': <Landscape />,
    'Adventure': <Hiking />,
    'Culture': <Museum />,
    'Food': <Restaurant />,
    'Nature': <BeachAccess />,
    'Shopping': <ShoppingBag />,
    'Nightlife': <Nightlife />,
    'Beach': <BeachAccess />,
    'Hiking': <Hiking />,
    'Museums': <Museum />
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <TravelExplore sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Global Explorer
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {currentUser?.displayName || currentUser?.email}
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItemMui onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItemMui>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          height: '400px',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${destination.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          color: 'white'
        }}
      >
        <Container sx={{ pb: 4 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            {destination.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<LocationOn />}
              label={destination.country}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}
            />
            <Chip
              icon={<Star sx={{ color: 'gold' }} />}
              label={`${destination.rating} (${destination.reviews.toLocaleString()} reviews)`}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}
            />
            <Chip
              icon={<AttachMoney />}
              label={`${destination.currency} ${destination.averageCost}/day`}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}
            />
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
            <Tab label="Overview" />
            <Tab label="Popular Places" />
            <Tab label="Hotels" />
            <Tab label="Plan Trip" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* About */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  About {destination.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {destination.description}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {destination.name} is one of the most beautiful destinations in {destination.continent},
                  offering a perfect blend of culture, history, and modern attractions. Whether you're
                  interested in exploring historic landmarks, enjoying local cuisine, or experiencing
                  vibrant nightlife, {destination.name} has something for everyone.
                </Typography>
              </Paper>

              {/* Popular Activities */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Popular Activities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {destination.popularActivities.map((activity, idx) => (
                    <Chip
                      key={idx}
                      icon={activityIcons[activity] || <LocalActivity />}
                      label={activity}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Key Information */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Key Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Best Time to Visit"
                      secondary={destination.bestTimeToVisit}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Language color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Languages"
                      secondary={destination.languages.join(', ')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WbSunny color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Weather"
                      secondary={destination.weatherInfo}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {destination.visaRequired ?
                        <CheckCircle color="warning" /> :
                        <CheckCircle color="success" />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary="Visa Required"
                      secondary={destination.visaRequired ? 'Yes' : 'No'}
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* Quick Stats */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Stats
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Daily Cost
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {destination.currency} {destination.averageCost}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Recommended Duration
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      3-5 days
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Traveler Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" fontWeight="bold">
                        {destination.rating}
                      </Typography>
                      <Star sx={{ color: 'gold', fontSize: 28 }} />
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {loadingAttractions ? 'Loading real-time data...' : 'Click "Add to Trip" to include these attractions in your trip plan! Real-time data shown when available.'}
            </Alert>
            <Grid container spacing={3}>
              {attractions.map((attraction, idx) => {
                const details = attractionDetails[attraction]
                return (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getAttractionImage(attraction)}
                        alt={attraction}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60' }}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {attraction}
                        </Typography>

                        {/* Real-time rating and reviews */}
                        {details && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Star sx={{ color: 'gold', fontSize: 18 }} />
                            <Typography variant="body2" fontWeight="bold">
                              {details.rating}
                            </Typography>
                            {details.reviews > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                ({details.reviews.toLocaleString()} reviews)
                              </Typography>
                            )}
                          </Box>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {getAttractionDescription(attraction, destination.name)}
                        </Typography>

                        {/* Estimated Cost */}
                        {details && details.estimatedCost > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              ~{destination.currency} {details.estimatedCost}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              entry fee
                            </Typography>
                          </Box>
                        )}

                        {/* Open/Closed status */}
                        {details && details.isOpen !== null && (
                          <Chip
                            label={details.isOpen ? 'Open Now' : 'Closed'}
                            color={details.isOpen ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => handleAddToTrip(attraction)}
                          disabled={loadingAttractions}
                        >
                          Add to Trip
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Popular hotels near {destination.parentCity || destination.name} with prices per night
            </Alert>
            <Grid container spacing={3}>
              {getHotelsForDestination().map((hotel, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={hotel.image}
                      alt={hotel.name}
                      onError={(e) => { e.target.src = 'https://source.unsplash.com/400x300/?hotel,luxury' }}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                          {hotel.name}
                        </Typography>
                        <Chip label={hotel.type} size="small" color="primary" />
                      </Box>

                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Star sx={{ color: 'gold', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight="bold">
                          {hotel.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({hotel.reviews.toLocaleString()} reviews)
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {destination.currency} {hotel.pricePerNight}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          /night
                        </Typography>
                      </Box>

                      {/* Distance */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {hotel.distance} km from center
                        </Typography>
                      </Box>

                      {/* Amenities */}
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Amenities:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {hotel.amenities.slice(0, 4).map((amenity, i) => (
                          <Chip key={i} label={amenity} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleHotelDetailsClick(hotel)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {getHotelsForDestination().length === 0 && (
              <Alert severity="warning">
                No hotel information available for this location. Try selecting a main city destination to view hotel options!
              </Alert>
            )}
          </Box>
        )}

        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Your Trip Itinerary
                </Typography>
                {tripDays.length === 0 ? (
                  <Alert severity="info">
                    Your trip plan is empty. Go to "Popular Places" tab and add attractions to build your itinerary!
                  </Alert>
                ) : (
                  <>
                    {/* Attractions organized by day */}
                    {tripAttractions.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="primary" /> Places to Visit
                        </Typography>
                        <List>
                          {tripAttractions.map((item, idx) => {
                            const dayNumber = Math.floor(idx / 3) + 1
                            return (
                              <Paper key={idx} sx={{ mb: 2, p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                      {dayNumber}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" fontWeight="bold">
                                        Day {dayNumber} - {item.time}
                                      </Typography>
                                      <Typography variant="body1" color="text.secondary">
                                        {item.attraction}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleRemoveFromTrip(tripDays.indexOf(item))}
                                  >
                                    Remove
                                  </Button>
                                </Box>
                              </Paper>
                            )
                          })}
                        </List>
                      </Box>
                    )}

                    {/* Hotels section */}
                    {tripHotels.length > 0 && (
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Hotel color="primary" /> Accommodations
                        </Typography>
                        <List>
                          {tripHotels.map((item, idx) => (
                            <Paper key={idx} sx={{ mb: 2, p: 2, bgcolor: 'success.light' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: 'success.main' }}>
                                    <Hotel />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                      {item.attraction}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {destination.currency} {item.hotel?.pricePerNight}/night - {item.hotel?.type} Hotel
                                    </Typography>
                                  </Box>
                                </Box>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleRemoveFromTrip(tripDays.indexOf(item))}
                                >
                                  Remove
                                </Button>
                              </Box>
                            </Paper>
                          ))}
                        </List>
                      </Box>
                    )}

                    {/* Recommendation for hotels */}
                    {tripAttractions.length > 0 && tripHotels.length < recommendedHotelNights && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Hotel Recommendation
                        </Typography>
                        <Typography variant="body2">
                          Based on your {totalDays}-day itinerary, you'll need accommodation for {recommendedHotelNights} night{recommendedHotelNights !== 1 ? 's' : ''}.
                          You currently have {tripHotels.length} hotel{tripHotels.length !== 1 ? 's' : ''} booked.
                          Visit the Hotels tab to add {recommendedHotelNights - tripHotels.length} more accommodation{(recommendedHotelNights - tripHotels.length) !== 1 ? 's' : ''}.
                        </Typography>
                      </Alert>
                    )}
                  </>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Trip Summary
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Trip Duration
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Attractions to Visit
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {tripAttractions.length}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Hotel Nights Booked
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={tripHotels.length >= recommendedHotelNights ? 'success.main' : 'warning.main'}>
                      {tripHotels.length} / {recommendedHotelNights}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Cost
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Daily expenses: {destination.currency} {totalAttractionCost}
                    </Typography>
                    <Typography variant="body2">
                      Hotel costs: {destination.currency} {totalHotelCost}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {destination.currency} {totalTripCost}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total trip cost
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Alert severity="success">
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Pro Tip!
                </Typography>
                <Typography variant="body2">
                  Save {destination.currency} 20-30% by booking accommodations and activities in advance.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Hotel Details Modal */}
      <Dialog
        open={hotelModalOpen}
        onClose={handleCloseHotelModal}
        maxWidth="md"
        fullWidth
      >
        {selectedHotel && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  {selectedHotel.name}
                </Typography>
                <IconButton onClick={handleCloseHotelModal}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <CardMedia
                component="img"
                height="300"
                image={selectedHotel.image}
                alt={selectedHotel.name}
                sx={{ borderRadius: 2, mb: 3 }}
              />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="body2" gutterBottom>
                      Hotel Type
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedHotel.type}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="body2" gutterBottom>
                      Price per Night
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {destination.currency} {selectedHotel.pricePerNight}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Rating & Reviews
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Star sx={{ color: 'gold', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {selectedHotel.rating}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ({selectedHotel.reviews.toLocaleString()} reviews)
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Location
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  <Typography variant="body1">
                    {selectedHotel.distance} km from city center
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Amenities
                </Typography>
                <Grid container spacing={1}>
                  {selectedHotel.amenities.map((amenity, i) => (
                    <Grid item xs={6} sm={4} key={i}>
                      <Chip label={amenity} variant="outlined" size="medium" />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseHotelModal} variant="outlined">
                Close
              </Button>
              <Button onClick={handleBookHotel} variant="contained" startIcon={<Add />}>
                Add to Trip Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

// Helper functions
const generateAttractions = (cityName) => {
  const attractions = [
    `${cityName} Old Town`,
    `${cityName} Museum`,
    `${cityName} Central Park`,
    `${cityName} Cathedral`,
    `${cityName} Market Square`,
    `${cityName} Waterfront`,
    `${cityName} Historic District`,
    `${cityName} Art Gallery`,
    `${cityName} Castle`,
  ]
  return attractions.slice(0, 6)
}

const getGradientColor = (index) => {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140']
  return colors[index % colors.length]
}

const getAttractionIcon = (attraction) => {
  if (attraction.includes('Museum') || attraction.includes('Gallery')) return <Museum sx={{ fontSize: 40, color: 'primary.main' }} />
  if (attraction.includes('Park') || attraction.includes('Garden')) return <Landscape sx={{ fontSize: 40, color: 'success.main' }} />
  if (attraction.includes('Market') || attraction.includes('Shopping')) return <ShoppingBag sx={{ fontSize: 40, color: 'warning.main' }} />
  if (attraction.includes('Beach') || attraction.includes('Waterfront')) return <BeachAccess sx={{ fontSize: 40, color: 'info.main' }} />
  if (attraction.includes('Cathedral') || attraction.includes('Temple')) return <Star sx={{ fontSize: 40, color: 'secondary.main' }} />
  return <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />
}

const getAttractionDescription = (attraction, cityName) => {
  if (attraction.includes('Museum')) return `Explore the rich history and culture at this renowned museum in ${cityName}.`
  if (attraction.includes('Park')) return `Relax and enjoy nature in this beautiful green space in the heart of ${cityName}.`
  if (attraction.includes('Market')) return `Experience local flavors, crafts, and culture at this vibrant market.`
  if (attraction.includes('Cathedral')) return `Marvel at the stunning architecture and spiritual significance of this historic site.`
  if (attraction.includes('Waterfront')) return `Enjoy scenic views and waterside activities at this popular destination.`
  return `A must-visit attraction that captures the essence of ${cityName}.`
}

const getAttractionImage = (attractionName) => {
  // Using Unsplash Source API for dynamic, accurate attraction images
  const baseUrl = 'https://source.unsplash.com/400x300/?'

  // Map specific famous attractions to targeted search terms
  const attractionImageMap = {
    // ========== INDIA ==========
    // Mumbai
    'Gateway of India': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop&auto=format&q=60',
    'Marine Drive': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop&auto=format&q=60',
    'Taj Mahal Palace Hotel': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&auto=format&q=60',
    'Elephanta Caves': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop&auto=format&q=60',
    'Chhatrapati Shivaji Terminus': 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400&h=300&fit=crop&auto=format&q=60',
    'Bandra-Worli Sea Link': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&h=300&fit=crop&auto=format&q=60',

    // Delhi
    'India Gate': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop&auto=format&q=60',
    'Red Fort': 'https://images.unsplash.com/photo-1597074866923-dc0589150537?w=400&h=300&fit=crop&auto=format&q=60',
    'Qutub Minar': 'https://images.unsplash.com/photo-1586526546299-96b7fa7c83b5?w=400&h=300&fit=crop&auto=format&q=60',
    'Lotus Temple': 'https://images.unsplash.com/photo-1610048022615-f549dd98b8d6?w=400&h=300&fit=crop&auto=format&q=60',
    'Humayun\'s Tomb': 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=400&h=300&fit=crop&auto=format&q=60',
    'Akshardham Temple': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&h=300&fit=crop&auto=format&q=60',

    // Bangalore - Verified specific attraction images
    'Lalbagh Botanical Garden': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&auto=format&q=60', // Botanical garden
    'Bangalore Palace': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop&auto=format&q=60', // Palace architecture
    'Cubbon Park': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop&auto=format&q=60', // Park greenery
    'Vidhana Soudha': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop&auto=format&q=60', // Government building
    'ISKCON Temple': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60', // Temple architecture
    'Tipu Sultan\'s Palace': 'https://images.unsplash.com/photo-1585468274952-66591eb14a6e?w=400&h=300&fit=crop&auto=format&q=60', // Historical palace

    // Jaipur
    'Amber Fort': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=300&fit=crop&auto=format&q=60',
    'Hawa Mahal': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop&auto=format&q=60',
    'City Palace': 'https://images.unsplash.com/photo-1599657043314-e6c628c1a7c8?w=400&h=300&fit=crop&auto=format&q=60',
    'Jantar Mantar': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop&auto=format&q=60',
    'Nahargarh Fort': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop&auto=format&q=60',
    'Jal Mahal': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop&auto=format&q=60',

    // Agra
    'Taj Mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&auto=format&q=60',
    'Agra Fort': 'https://images.unsplash.com/photo-1585104266153-ae83eabc4e24?w=400&h=300&fit=crop&auto=format&q=60',
    'Fatehpur Sikri': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop&auto=format&q=60',
    'Mehtab Bagh': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop&auto=format&q=60',
    'Itmad-ud-Daulah': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop&auto=format&q=60',
    'Akbar\'s Tomb': 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=400&h=300&fit=crop&auto=format&q=60',

    // Varanasi
    'Ganges River': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop&auto=format&q=60',
    'Kashi Vishwanath Temple': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop&auto=format&q=60',
    'Dashashwamedh Ghat': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop&auto=format&q=60',
    'Sarnath': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Assi Ghat': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop&auto=format&q=60',
    'Ramnagar Fort': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop&auto=format&q=60',

    // Goa
    'Baga Beach': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop&auto=format&q=60',
    'Basilica of Bom Jesus': 'https://images.unsplash.com/photo-1578763105920-880a4dc5fbc2?w=400&h=300&fit=crop&auto=format&q=60',
    'Fort Aguada': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop&auto=format&q=60',
    'Dudhsagar Falls': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format&q=60',
    'Anjuna Market': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Calangute Beach': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop&auto=format&q=60',

    // ========== USA ==========
    // New York
    'Statue of Liberty': 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=400&h=300&fit=crop&auto=format&q=60',
    'Central Park': 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400&h=300&fit=crop&auto=format&q=60',
    'Times Square': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=400&h=300&fit=crop&auto=format&q=60',
    'Empire State Building': 'https://images.unsplash.com/photo-1605559911160-a3d95d213904?w=400&h=300&fit=crop&auto=format&q=60',
    'Brooklyn Bridge': 'https://images.unsplash.com/photo-1490299267228-8ea8c1b21d1f?w=400&h=300&fit=crop&auto=format&q=60',
    '9/11 Memorial': 'https://images.unsplash.com/photo-1548960032-bf4de152d0d5?w=400&h=300&fit=crop&auto=format&q=60',

    // Los Angeles
    'Hollywood Sign': 'https://images.unsplash.com/photo-1598252447881-f74e2fa95e7d?w=400&h=300&fit=crop&auto=format&q=60',
    'Santa Monica Pier': 'https://images.unsplash.com/photo-1583591917010-0e3bec556423?w=400&h=300&fit=crop&auto=format&q=60',
    'Griffith Observatory': 'https://images.unsplash.com/photo-1534430458055-a3a55aa27dfd?w=400&h=300&fit=crop&auto=format&q=60',
    'Venice Beach': 'https://images.unsplash.com/photo-1527066579998-fad295f0b6e6?w=400&h=300&fit=crop&auto=format&q=60',
    'Getty Center': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Universal Studios': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=60',

    // San Francisco
    'Golden Gate Bridge': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&auto=format&q=60',
    'Alcatraz Island': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=60',
    'Fisherman\'s Wharf': 'https://images.unsplash.com/photo-1542646283-81f96f7fce4b?w=400&h=300&fit=crop&auto=format&q=60',
    'Cable Cars': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&auto=format&q=60',
    'Chinatown': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Lombard Street': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&auto=format&q=60',

    // Las Vegas
    'The Strip': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop&auto=format&q=60',
    'Bellagio Fountains': 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&h=300&fit=crop&auto=format&q=60',
    'Fremont Street': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop&auto=format&q=60',
    'High Roller': 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&h=300&fit=crop&auto=format&q=60',
    'Red Rock Canyon': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',
    'Hoover Dam': 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&h=300&fit=crop&auto=format&q=60',

    // Miami
    'South Beach': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop&auto=format&q=60',
    'Art Deco District': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop&auto=format&q=60',
    'Vizcaya Museum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Little Havana': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Wynwood Walls': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Everglades National Park': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',

    // Chicago
    'Willis Tower': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60',
    'Navy Pier': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&auto=format&q=60',
    'Millennium Park': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',
    'Cloud Gate': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop&auto=format&q=60',
    'Art Institute of Chicago': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Magnificent Mile': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',

    // ========== AUSTRALIA ==========
    // Sydney
    'Sydney Opera House': 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=400&h=300&fit=crop&auto=format&q=60',
    'Harbour Bridge': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop&auto=format&q=60',
    'Bondi Beach': 'https://images.unsplash.com/photo-1506967726964-da9127fdec36?w=400&h=300&fit=crop&auto=format&q=60',
    'The Rocks': 'https://images.unsplash.com/photo-1532061414639-cdf4930af757?w=400&h=300&fit=crop&auto=format&q=60',
    'Taronga Zoo': 'https://images.unsplash.com/photo-1535537412994-3edbdfffd146?w=400&h=300&fit=crop&auto=format&q=60',
    'Royal Botanic Gardens': 'https://images.unsplash.com/photo-1585468274952-66591eb14a6e?w=400&h=300&fit=crop&auto=format&q=60',

    // Melbourne
    'Federation Square': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400&h=300&fit=crop&auto=format&q=60',
    'Royal Botanic Gardens Melbourne': 'https://images.unsplash.com/photo-1585468274952-66591eb14a6e?w=400&h=300&fit=crop&auto=format&q=60',
    'Great Ocean Road': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',
    'St Kilda Beach': 'https://images.unsplash.com/photo-1506967726964-da9127fdec36?w=400&h=300&fit=crop&auto=format&q=60',
    'Queen Victoria Market': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Eureka Tower': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60',

    // Brisbane
    'South Bank Parklands': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',
    'Story Bridge': 'https://images.unsplash.com/photo-1490299267228-8ea8c1b21d1f?w=400&h=300&fit=crop&auto=format&q=60',
    'Lone Pine Koala Sanctuary': 'https://images.unsplash.com/photo-1535537412994-3edbdfffd146?w=400&h=300&fit=crop&auto=format&q=60',
    'City Botanic Gardens': 'https://images.unsplash.com/photo-1585468274952-66591eb14a6e?w=400&h=300&fit=crop&auto=format&q=60',
    'Mount Coot-tha': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',
    'Roma Street Parkland': 'https://images.unsplash.com/photo-1585468274952-66591eb14a6e?w=400&h=300&fit=crop&auto=format&q=60',

    // Perth
    'Kings Park': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',
    'Cottesloe Beach': 'https://images.unsplash.com/photo-1506967726964-da9127fdec36?w=400&h=300&fit=crop&auto=format&q=60',
    'Rottnest Island': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format&q=60',
    'Swan River': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop&auto=format&q=60',
    'Perth Mint': 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&h=300&fit=crop&auto=format&q=60',
    'Fremantle': 'https://images.unsplash.com/photo-1506967726964-da9127fdec36?w=400&h=300&fit=crop&auto=format&q=60',

    // ========== EUROPE ==========
    // Paris
    'Eiffel Tower': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop&auto=format&q=60',
    'Louvre Museum': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop&auto=format&q=60',
    'Notre-Dame': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop&auto=format&q=60',
    'Arc de Triomphe': 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&h=300&fit=crop&auto=format&q=60',
    'Sacré-Cœur': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop&auto=format&q=60',
    'Champs-Élysées': 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=400&h=300&fit=crop&auto=format&q=60',

    // London
    'Big Ben': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60',
    'Tower of London': 'https://images.unsplash.com/photo-1529180279021-ea7e29f2e370?w=400&h=300&fit=crop&auto=format&q=60',
    'British Museum': 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=400&h=300&fit=crop&auto=format&q=60',
    'London Eye': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60',
    'Buckingham Palace': 'https://images.unsplash.com/photo-1585821569331-f5f9cd8e7a5b?w=400&h=300&fit=crop&auto=format&q=60',
    'Tower Bridge': 'https://images.unsplash.com/photo-1543832923-44667a44c804?w=400&h=300&fit=crop&auto=format&q=60',

    // Rome
    'Colosseum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop&auto=format&q=60',
    'Vatican Museums': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&h=300&fit=crop&auto=format&q=60',
    'Trevi Fountain': 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400&h=300&fit=crop&auto=format&q=60',
    'Pantheon': 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400&h=300&fit=crop&auto=format&q=60',
    'Roman Forum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop&auto=format&q=60',
    'Spanish Steps': 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400&h=300&fit=crop&auto=format&q=60',

    // Barcelona
    'Sagrada Familia': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop&auto=format&q=60',
    'Park Güell': 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=400&h=300&fit=crop&auto=format&q=60',
    'La Rambla': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=400&h=300&fit=crop&auto=format&q=60',
    'Casa Batlló': 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=400&h=300&fit=crop&auto=format&q=60',
    'Gothic Quarter': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=400&h=300&fit=crop&auto=format&q=60',
    'Camp Nou': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=300&fit=crop&auto=format&q=60',

    // Amsterdam
    'Anne Frank House': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop&auto=format&q=60',
    'Van Gogh Museum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Canal Ring': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop&auto=format&q=60',
    'Rijksmuseum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Jordaan': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop&auto=format&q=60',
    'Vondelpark': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',

    // Berlin
    'Brandenburg Gate': 'https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=400&h=300&fit=crop&auto=format&q=60',
    'Berlin Wall': 'https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=400&h=300&fit=crop&auto=format&q=60',
    'Reichstag': 'https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=400&h=300&fit=crop&auto=format&q=60',
    'Museum Island': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60',
    'Checkpoint Charlie': 'https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=400&h=300&fit=crop&auto=format&q=60',
    'TV Tower': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60',

    // Prague
    'Charles Bridge': 'https://images.unsplash.com/photo-1490299267228-8ea8c1b21d1f?w=400&h=300&fit=crop&auto=format&q=60',
    'Prague Castle': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format&q=60',
    'Old Town Square': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop&auto=format&q=60',
    'Astronomical Clock': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop&auto=format&q=60',
    'St. Vitus Cathedral': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Wenceslas Square': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop&auto=format&q=60',

    // Vienna
    'Schönbrunn Palace': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format&q=60',
    'St. Stephen\'s Cathedral': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Hofburg Palace': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format&q=60',
    'Belvedere Palace': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format&q=60',
    'Vienna State Opera': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Prater': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60',

    // ========== ASIA ==========
    // Tokyo
    'Tokyo Tower': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop&auto=format&q=60',
    'Senso-ji Temple': 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop&auto=format&q=60',
    'Meiji Shrine': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop&auto=format&q=60',
    'Shibuya Crossing': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=300&fit=crop&auto=format&q=60',
    'Tokyo Skytree': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60',
    'Imperial Palace': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format&q=60',

    // Bangkok
    'Grand Palace': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop&auto=format&q=60',
    'Wat Arun': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop&auto=format&q=60',
    'Wat Pho': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop&auto=format&q=60',
    'Chatuchak Market': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Khao San Road': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop&auto=format&q=60',
    'Jim Thompson House': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop&auto=format&q=60',

    // Singapore
    'Marina Bay Sands': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop&auto=format&q=60',
    'Gardens by the Bay': 'https://images.unsplash.com/photo-1562992843-452a5c99eedb?w=400&h=300&fit=crop&auto=format&q=60',
    'Sentosa Island': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format&q=60',
    'Universal Studios Singapore': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=60',
    'Singapore Chinatown': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Little India': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',

    // Dubai
    'Burj Khalifa': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&auto=format&q=60',
    'Dubai Mall': 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=400&h=300&fit=crop&auto=format&q=60',
    'Palm Jumeirah': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&h=300&fit=crop&auto=format&q=60',
    'Dubai Marina': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop&auto=format&q=60',
    'Gold Souk': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Desert Safari': 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400&h=300&fit=crop&auto=format&q=60',

    // Hong Kong
    'Victoria Peak': 'https://images.unsplash.com/photo-1518083165041-2a9c0c2b9a42?w=400&h=300&fit=crop&auto=format&q=60',
    'Star Ferry': 'https://images.unsplash.com/photo-1518083165041-2a9c0c2b9a42?w=400&h=300&fit=crop&auto=format&q=60',
    'Temple Street Market': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60',
    'Tian Tan Buddha': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop&auto=format&q=60',
    'Victoria Harbour': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop&auto=format&q=60',
    'Lan Kwai Fong': 'https://images.unsplash.com/photo-1518083165041-2a9c0c2b9a42?w=400&h=300&fit=crop&auto=format&q=60',
  }

  // Try exact match first
  if (attractionImageMap[attractionName]) {
    return attractionImageMap[attractionName]
  }

  // Fallback: keyword-based matching for common attraction types
  const lowerName = attractionName.toLowerCase()

  if (lowerName.includes('temple') || lowerName.includes('shrine')) {
    return 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('fort') || lowerName.includes('castle')) {
    return 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('palace')) {
    return 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('museum') || lowerName.includes('gallery')) {
    return 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3a6?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('beach')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('park') || lowerName.includes('garden')) {
    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('bridge')) {
    return 'https://images.unsplash.com/photo-1490299267228-8ea8c1b21d1f?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('tower')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('market') || lowerName.includes('bazaar')) {
    return 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=60'
  }
  if (lowerName.includes('church') || lowerName.includes('cathedral') || lowerName.includes('basilica')) {
    return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&auto=format&q=60'
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&auto=format&q=60'
}

export default DestinationDetail
