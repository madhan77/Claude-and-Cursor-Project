#!/bin/bash

cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/global-explorer-mui-final/src/pages"

# Create Login page with beautiful MUI design
cat > Login.jsx << 'LOGINEOF'
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import {
  Box, Container, Paper, TextField, Button, Typography,
  Tab, Tabs, Divider, Avatar, InputAdornment, IconButton,
  Stack
} from '@mui/material'
import {
  Email, Lock, Person, Visibility, VisibilityOff,
  TravelExplore
} from '@mui/icons-material'
import { FcGoogle } from 'react-icons/fc'

const Login = () => {
  const [tabValue, setTabValue] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, signup, loginWithGoogle } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const isLogin = tabValue === 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || (!isLogin && !displayName)) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
        toast.success('Welcome back!')
      } else {
        await signup(email, password, displayName)
        toast.success('Account created!')
      }
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome!')
      navigate('/')
    } catch (error) {
      toast.error('Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper elevation={10} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Stack spacing={3} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              <TravelExplore sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">Global Explorer</Typography>
            <Typography variant="body1" color="text.secondary">Discover Amazing Places</Typography>
          </Stack>

          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth" sx={{ my: 3 }}>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {!isLogin && (
              <TextField
                fullWidth margin="normal"
                label="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                disabled={loading}
              />
            )}

            <TextField
              fullWidth margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
              disabled={loading}
            />

            <TextField
              fullWidth margin="normal"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              disabled={loading}
            />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, py: 1.5 }}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}><Typography variant="body2" color="text.secondary">OR</Typography></Divider>

          <Button fullWidth variant="outlined" size="large" onClick={handleGoogleLogin} disabled={loading} sx={{ py: 1.5 }}>
            <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              <FcGoogle size={24} />
            </Box>
            Continue with Google
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
LOGINEOF

# Create Home page with beautiful design
cat > Home.jsx << 'HOMEEOF'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { destinations } from '../data/destinations'
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, Card,
  CardContent, CardMedia, CardActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Box, Chip, Avatar,
  IconButton, Menu, MenuItem as MenuItemMui
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

  const continents = ['All', 'Europe', 'Asia', 'North America', 'Oceania', 'Africa', 'South America']

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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Found {filteredDestinations.length} destinations
        </Typography>

        <Grid container spacing={4}>
          {filteredDestinations.map((dest) => (
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
                  <Button size="small" fullWidth variant="contained">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default Home
HOMEEOF

echo "Pages created successfully!"
