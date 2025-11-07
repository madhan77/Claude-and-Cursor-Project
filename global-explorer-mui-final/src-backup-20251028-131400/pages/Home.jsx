import { useContext, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { generateExpandedDestinations } from '../services/destinationApi'
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, Card,
  CardContent, CardMedia, CardActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Box, Chip, Avatar,
  IconButton, Menu, MenuItem as MenuItemMui, Pagination
} from '@mui/material'
import {
  TravelExplore, Logout, AccountCircle, Star,
  LocationOn, AttachMoney, Search
} from '@mui/icons-material'

const Home = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('All')
  const [anchorEl, setAnchorEl] = useState(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 24

  const continents = ['All', 'Europe', 'Asia', 'North America', 'Oceania', 'Africa', 'South America']

  // Generate expanded destinations (1000+ destinations) - cached with useMemo
  const destinations = useMemo(() => generateExpandedDestinations(), [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContinent = selectedContinent === 'All' || dest.continent === selectedContinent
    return matchesSearch && matchesContinent
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedContinent])

  // Pagination calculations
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageDestinations = filteredDestinations.slice(startIndex, endIndex)

  const handlePageChange = (event, value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
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

      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Discover Amazing Destinations
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Explore the world's most beautiful places
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />,
                  sx: { bgcolor: 'white', borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>Continent</InputLabel>
                <Select value={selectedContinent} onChange={(e) => setSelectedContinent(e.target.value)}>
                  {continents.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Found {filteredDestinations.length} destinations
            {filteredDestinations.length > 0 && ` (Showing ${startIndex + 1}-${Math.min(endIndex, filteredDestinations.length)})`}
          </Typography>
          {filteredDestinations.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Page {page} of {totalPages}
            </Typography>
          )}
        </Box>

        <Grid container spacing={4}>
          {currentPageDestinations.map((dest) => (
            <Grid item xs={12} sm={6} md={4} key={dest.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s' } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={dest.image}
                  alt={dest.name}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {dest.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      {dest.country}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Star fontSize="small" sx={{ color: 'gold' }} />
                    <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                      {dest.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({dest.reviews.toLocaleString()} reviews)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {dest.description.substring(0, 100)}...
                  </Typography>
                  <Chip
                    icon={<AttachMoney />}
                    label={`$${dest.averageCost}/day`}
                    color="primary"
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/destination/${dest.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

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
      </Container>
    </Box>
  )
}

export default Home
