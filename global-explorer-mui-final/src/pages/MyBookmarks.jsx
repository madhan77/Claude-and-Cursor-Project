import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
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
  Skeleton,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Menu,
  Divider,
  Paper,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import {
  ArrowBack,
  Search as SearchIcon,
  BookmarkRemove,
  FlightTakeoff,
  Star,
  Place,
  Public,
  AddCircleOutline,
  FileDownload,
  Delete,
  Sort,
  FilterList,
  CheckCircle,
  BookmarksOutlined,
  TravelExplore,
  Close
} from '@mui/icons-material'
import { useBookmarks } from '../hooks/useBookmarks'
import { useTrips } from '../hooks/useTrips'
import { toast } from 'react-toastify'

const CONTINENTS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']
const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'alphabetical', label: 'Alphabetically' },
  { value: 'rating', label: 'By Rating' }
]

// Unsplash image URLs for destinations (same as Home page)
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

// Generate ratings and review counts
const getDestinationRating = (id) => {
  const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9]
  return ratings[id % ratings.length]
}

const getReviewCount = (id) => {
  const counts = [234, 456, 789, 1023, 1567, 2134, 2890, 3456]
  return counts[id % counts.length]
}

const MyBookmarks = () => {
  const navigate = useNavigate()
  const { bookmarks, loading, toggleBookmark } = useBookmarks()
  const { trips, addDestination } = useTrips()

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('All')
  const [sortBy, setSortBy] = useState('recent')

  // Selection State
  const [selectedBookmarks, setSelectedBookmarks] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)

  // Dialog State
  const [addToTripDialog, setAddToTripDialog] = useState(false)
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null)

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks]

    // Filter by continent
    if (selectedContinent !== 'All') {
      filtered = filtered.filter(b => b.continent === selectedContinent)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.country.toLowerCase().includes(query)
      )
    }

    // Sort bookmarks
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'rating':
        filtered.sort((a, b) => getDestinationRating(b.id) - getDestinationRating(a.id))
        break
      case 'recent':
      default:
        // Already in reverse chronological order from Firestore
        break
    }

    return filtered
  }, [bookmarks, selectedContinent, searchQuery, sortBy])

  // Handle bookmark removal
  const handleRemoveBookmark = (destination, e) => {
    e.stopPropagation()
    toggleBookmark(destination)
  }

  // Handle view details
  const handleViewDetails = (destinationId) => {
    navigate(`/destination/${destinationId}`)
  }

  // Handle continent filter
  const handleContinentChange = (event, newContinent) => {
    if (newContinent !== null) {
      setSelectedContinent(newContinent)
    }
  }

  // Handle checkbox selection
  const handleSelectBookmark = (bookmarkId) => {
    setSelectedBookmarks(prev => {
      if (prev.includes(bookmarkId)) {
        return prev.filter(id => id !== bookmarkId)
      } else {
        return [...prev, bookmarkId]
      }
    })
  }

  // Select all / deselect all
  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredAndSortedBookmarks.length) {
      setSelectedBookmarks([])
    } else {
      setSelectedBookmarks(filteredAndSortedBookmarks.map(b => b.id))
    }
  }

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedBookmarks([])
  }

  // Add selected bookmarks to trip
  const handleAddToTrip = (tripId) => {
    const selectedDestinations = bookmarks.filter(b => selectedBookmarks.includes(b.id))

    Promise.all(
      selectedDestinations.map(dest => addDestination(tripId, dest))
    ).then(() => {
      setAddToTripDialog(false)
      setSelectionMode(false)
      setSelectedBookmarks([])
    })
  }

  // Export as CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Country', 'Continent', 'Rating', 'Reviews'],
      ...filteredAndSortedBookmarks.map(b => [
        b.name,
        b.country,
        b.continent || 'N/A',
        getDestinationRating(b.id),
        getReviewCount(b.id)
      ])
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-bookmarks-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Bookmarks exported as CSV')
    setExportMenuAnchor(null)
  }

  // Export as PDF (simple text-based PDF)
  const handleExportPDF = () => {
    // Create a simple text representation
    const content = filteredAndSortedBookmarks
      .map(b => `${b.name}, ${b.country} - Rating: ${getDestinationRating(b.id)}`)
      .join('\n')

    // Create a printable page
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Bookmarks</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #667eea; margin-bottom: 30px; }
            .bookmark { margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
            .name { font-weight: bold; font-size: 18px; color: #333; }
            .country { color: #666; margin-top: 5px; }
            .rating { color: #ff9800; margin-top: 5px; }
          </style>
        </head>
        <body>
          <h1>My Bookmarks - Global Explorer</h1>
          <p>Exported on: ${new Date().toLocaleDateString()}</p>
          <hr/>
          ${filteredAndSortedBookmarks.map(b => `
            <div class="bookmark">
              <div class="name">${b.name}</div>
              <div class="country">${b.country}, ${b.continent || 'N/A'}</div>
              <div class="rating">Rating: ${getDestinationRating(b.id)} (${getReviewCount(b.id)} reviews)</div>
            </div>
          `).join('')}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    toast.success('Opening print dialog for PDF export')
    setExportMenuAnchor(null)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedContinent('All')
    setSortBy('recent')
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <BookmarksOutlined sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            My Bookmarks
          </Typography>
          {bookmarks.length > 0 && (
            <Chip
              label={`${bookmarks.length} saved`}
              color="primary"
              size="small"
              sx={{ mr: 2 }}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Loading State */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(8)].map((_, index) => (
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
        ) : bookmarks.length === 0 ? (
          // Empty State
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 2
            }}
          >
            <BookmarksOutlined sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              No Bookmarks Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Start exploring amazing destinations and bookmark your favorites to plan your next adventure!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<TravelExplore />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                }
              }}
            >
              Explore Destinations
            </Button>
          </Box>
        ) : (
          <>
            {/* Filters and Actions Bar */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Search Bar */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search bookmarks..."
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
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Sort Dropdown */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <Sort />
                        </InputAdornment>
                      }
                    >
                      {SORT_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sm={6} md={5}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" gap={1}>
                    {selectionMode ? (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleSelectAll}
                          startIcon={<CheckCircle />}
                        >
                          {selectedBookmarks.length === filteredAndSortedBookmarks.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={selectedBookmarks.length === 0}
                          onClick={() => setAddToTripDialog(true)}
                          startIcon={<AddCircleOutline />}
                        >
                          Add to Trip ({selectedBookmarks.length})
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={handleToggleSelectionMode}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleToggleSelectionMode}
                          startIcon={<CheckCircle />}
                        >
                          Select
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                          startIcon={<FileDownload />}
                        >
                          Export
                        </Button>
                      </>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Continent Filter */}
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <FilterList fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    Filter by Continent:
                  </Typography>
                </Stack>
                <ToggleButtonGroup
                  value={selectedContinent}
                  exclusive
                  onChange={handleContinentChange}
                  size="small"
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButton-root': {
                      borderRadius: 2,
                      textTransform: 'none',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }
                    }
                  }}
                >
                  {CONTINENTS.map((continent) => (
                    <ToggleButton key={continent} value={continent}>
                      {continent === 'All' && <Public sx={{ mr: 0.5, fontSize: 18 }} />}
                      {continent}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Active Filters Display */}
              {(searchQuery || selectedContinent !== 'All' || sortBy !== 'recent') && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Active filters:
                  </Typography>
                  {searchQuery && (
                    <Chip
                      label={`Search: "${searchQuery}"`}
                      size="small"
                      onDelete={() => setSearchQuery('')}
                    />
                  )}
                  {selectedContinent !== 'All' && (
                    <Chip
                      label={`Continent: ${selectedContinent}`}
                      size="small"
                      onDelete={() => setSelectedContinent('All')}
                    />
                  )}
                  {sortBy !== 'recent' && (
                    <Chip
                      label={`Sort: ${SORT_OPTIONS.find(o => o.value === sortBy)?.label}`}
                      size="small"
                      onDelete={() => setSortBy('recent')}
                    />
                  )}
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    sx={{ ml: 1 }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Results Count */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              {filteredAndSortedBookmarks.length} Bookmark{filteredAndSortedBookmarks.length !== 1 ? 's' : ''} Found
            </Typography>

            {/* Bookmarks Grid */}
            {filteredAndSortedBookmarks.length > 0 ? (
              <Grid container spacing={3}>
                {filteredAndSortedBookmarks.map((bookmark) => {
                  const rating = getDestinationRating(bookmark.id)
                  const reviews = getReviewCount(bookmark.id)
                  const isSelected = selectedBookmarks.includes(bookmark.id)

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={bookmark.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          border: isSelected ? 3 : 0,
                          borderColor: 'primary.main',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        {/* Selection Checkbox */}
                        {selectionMode && (
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectBookmark(bookmark.id)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              bgcolor: 'white',
                              borderRadius: 1,
                              zIndex: 1,
                              '&:hover': {
                                bgcolor: 'white'
                              }
                            }}
                          />
                        )}

                        <CardMedia
                          component="img"
                          height="200"
                          image={getDestinationImage(bookmark.name)}
                          alt={bookmark.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                            {bookmark.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                            <Place sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {bookmark.country}
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
                            onClick={() => handleViewDetails(bookmark.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            View
                          </Button>
                          {!selectionMode && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBookmarks([bookmark.id])
                                  setAddToTripDialog(true)
                                }}
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <AddCircleOutline />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleRemoveBookmark(bookmark, e)}
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <BookmarkRemove />
                              </IconButton>
                            </>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            ) : (
              // No Results State
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 2
                }}
              >
                <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  No Bookmarks Match Your Filters
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search or filter criteria
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Add to Trip Dialog */}
      <Dialog
        open={addToTripDialog}
        onClose={() => setAddToTripDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddCircleOutline color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Add to Trip
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a trip to add {selectedBookmarks.length} destination{selectedBookmarks.length !== 1 ? 's' : ''}
          </Typography>
          {trips.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                You don't have any trips yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setAddToTripDialog(false)
                  navigate('/trips')
                }}
                sx={{ mt: 2 }}
              >
                Create Your First Trip
              </Button>
            </Box>
          ) : (
            <List>
              {trips.map((trip) => (
                <ListItem key={trip.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleAddToTrip(trip.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                      }
                    }}
                  >
                    <ListItemText
                      primary={trip.name}
                      secondary={`${trip.destinations?.length || 0} destinations`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddToTripDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={handleExportCSV}>
          <FileDownload sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <FileDownload sx={{ mr: 1 }} />
          Export as PDF (Print)
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default MyBookmarks
