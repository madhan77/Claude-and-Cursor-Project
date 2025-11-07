import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Pagination,
  Skeleton,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Search as SearchIcon,
  AccountCircle,
  Logout,
  BookmarkBorder,
  Bookmark,
  FlightTakeoff,
  Star,
  Place,
  Public,
  Person,
  Luggage,
  TravelExplore
} from '@mui/icons-material'
import { AuthContext } from '../contexts/AuthContext'
import { useBookmarks } from '../hooks/useBookmarks'
import { searchDestinations } from '../services/apiService'
import { toast } from 'react-toastify'

const ITEMS_PER_PAGE = 12
const CONTINENTS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']

// Unsplash image URLs for destinations
const getDestinationImage = (name) => {
  const images = {
    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
    'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
    'Los Angeles': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800',
    'Prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
    'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
    'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800',
    'Venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
    'Lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800',
    'Seoul': 'https://images.unsplash.com/photo-1601399363868-c73a36a7b0f9?w=800',
    'Mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
    'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
    'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
    'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800'
  }
  return images[name] || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800`
}

// Generate random ratings and review counts for destinations
const getDestinationRating = (id) => {
  const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9]
  return ratings[id % ratings.length]
}

const getReviewCount = (id) => {
  const counts = [234, 456, 789, 1023, 1567, 2134, 2890, 3456]
  return counts[id % counts.length]
}

const Home = () => {
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useContext(AuthContext)
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks()

  const [anchorEl, setAnchorEl] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('All')
  const [destinations, setDestinations] = useState([])
  const [filteredDestinations, setFilteredDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Load destinations on mount
  useEffect(() => {
    loadDestinations()
  }, [])

  // Filter destinations when search query or continent changes
  useEffect(() => {
    filterDestinations()
  }, [searchQuery, selectedContinent, destinations])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const data = await searchDestinations('', { limit: 100 })
      setDestinations(data)
    } catch (error) {
      console.error('Error loading destinations:', error)
      toast.error('Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }

  const filterDestinations = () => {
    let filtered = destinations

    // Filter by continent
    if (selectedContinent !== 'All') {
      filtered = filtered.filter(d => d.continent === selectedContinent)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query)
      )
    }

    setFilteredDestinations(filtered)
    setPage(1) // Reset to first page when filters change
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLoading(true)
      try {
        const data = await searchDestinations(searchQuery, { limit: 100 })
        setDestinations(data)
      } catch (error) {
        console.error('Error searching destinations:', error)
        toast.error('Search failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const handleViewDetails = (destinationId) => {
    navigate(`/destination/${destinationId}`)
  }

  const handleBookmarkClick = (destination) => {
    toggleBookmark(destination)
  }

  const handleContinentChange = (event, newContinent) => {
    if (newContinent !== null) {
      setSelectedContinent(newContinent)
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Pagination
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedDestinations = filteredDestinations.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE)

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <TravelExplore sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}
          >
            Global Explorer
          </Typography>

          {currentUser ? (
            <>
              <IconButton onClick={handleMenuOpen} size="large">
                <Avatar
                  src={userProfile?.photoURL || currentUser.photoURL}
                  alt={userProfile?.displayName || currentUser.displayName || 'User'}
                  sx={{ width: 40, height: 40 }}
                >
                  {(userProfile?.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: { minWidth: 200, mt: 1 }
                }}
              >
                <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {userProfile?.displayName || currentUser.displayName || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.email}
                  </Typography>
                </Box>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/my-trips'); }}>
                  <ListItemIcon>
                    <Luggage fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Trips</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/bookmarks'); }}>
                  <ListItemIcon>
                    <Bookmark fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Bookmarks</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              startIcon={<AccountCircle />}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" fontWeight={700} gutterBottom>
              Discover Your Next Adventure
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Explore amazing destinations around the world
            </Typography>

            {/* Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: 4
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search destinations, countries, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        edge="end"
                      >
                        ×
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& fieldset': { border: 'none' }
                  }
                }}
              />
            </Box>

            {/* Continent Filter */}
            <ToggleButtonGroup
              value={selectedContinent}
              exclusive
              onChange={handleContinentChange}
              aria-label="continent filter"
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }
              }}
            >
              {CONTINENTS.map((continent) => (
                <ToggleButton key={continent} value={continent}>
                  {continent === 'All' && <Public sx={{ mr: 1, fontSize: 20 }} />}
                  {continent}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Container>

        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }}
        />
      </Box>

      {/* Destinations Grid */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Results Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={600}>
            {filteredDestinations.length} Destination{filteredDestinations.length !== 1 ? 's' : ''} Found
          </Typography>
          {searchQuery && (
            <Chip
              label={`Search: "${searchQuery}"`}
              onDelete={() => setSearchQuery('')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {/* Loading State */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(12)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} width="60%" />
                    <Skeleton variant="text" height={20} width="40%" />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rectangular" width={100} height={36} />
                    <Skeleton variant="circular" width={40} height={40} sx={{ ml: 'auto' }} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : paginatedDestinations.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginatedDestinations.map((destination) => {
                const rating = getDestinationRating(destination.id)
                const reviews = getReviewCount(destination.id)
                const bookmarked = isBookmarked(destination.id)

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={destination.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={getDestinationImage(destination.name)}
                        alt={destination.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                          {destination.name}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                          <Place sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {destination.country}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {rating.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({reviews.toLocaleString()} reviews)
                          </Typography>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<FlightTakeoff />}
                          onClick={() => handleViewDetails(destination.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          View Details
                        </Button>
                        <IconButton
                          onClick={() => handleBookmarkClick(destination)}
                          color={bookmarked ? 'primary' : 'default'}
                          sx={{
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          {bookmarked ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        ) : (
          // Empty State
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 2
            }}
          >
            <TravelExplore sx={{ fontSize: 100, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No destinations found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : `No destinations available in ${selectedContinent}. Try selecting a different continent.`}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchQuery('')
                setSelectedContinent('All')
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Home
