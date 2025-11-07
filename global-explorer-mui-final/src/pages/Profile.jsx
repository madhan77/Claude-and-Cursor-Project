import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  LocationOn,
  Email,
  Lock,
  TravelExplore,
  Bookmark,
  RateReview,
  DarkMode,
  LightMode,
  Person,
  FlightTakeoff,
  CheckCircle,
  Info
} from '@mui/icons-material'
import { AuthContext } from '../contexts/AuthContext'
import { updateUserProfile, getUserTrips, getUserBookmarks, getUserReviews } from '../services/firestoreService'
import { toast } from 'react-toastify'

// Available interests for chips
const AVAILABLE_INTERESTS = [
  'Adventure',
  'Beach',
  'Culture',
  'Food',
  'History',
  'Mountains',
  'Nature',
  'Nightlife',
  'Photography',
  'Shopping',
  'Sports',
  'Wildlife'
]

// Travel style options
const TRAVEL_STYLES = [
  'Backpacker',
  'Budget Traveler',
  'Luxury Traveler',
  'Business Traveler',
  'Family Traveler',
  'Solo Traveler',
  'Group Traveler',
  'Adventure Seeker',
  'Cultural Explorer',
  'Beach Lover'
]

const Profile = () => {
  const navigate = useNavigate()
  const { currentUser, userProfile, changePassword, updateUserProfile: updateAuthProfile } = useContext(AuthContext)

  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    interests: [],
    travelStyle: '',
    photoURL: ''
  })

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')

  // Statistics state
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookmarks: 0,
    totalReviews: 0
  })

  // Recent activity state
  const [recentActivity, setRecentActivity] = useState([])

  // Dark mode state (using localStorage for persistence)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Validation errors
  const [errors, setErrors] = useState({})

  // Load user profile data on mount
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        interests: userProfile.interests || [],
        travelStyle: userProfile.travelStyle || '',
        photoURL: userProfile.photoURL || ''
      })
    }
  }, [userProfile])

  // Load statistics and activity on mount
  useEffect(() => {
    loadStatistics()
    loadRecentActivity()
  }, [currentUser])

  // Handle dark mode toggle
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    // You can dispatch an event here to update the theme globally
    window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: darkMode }))
  }, [darkMode])

  const loadStatistics = async () => {
    if (!currentUser) return

    setStatsLoading(true)
    try {
      const [trips, bookmarks, reviews] = await Promise.all([
        getUserTrips(currentUser.uid),
        getUserBookmarks(currentUser.uid),
        getUserReviews(currentUser.uid)
      ])

      setStats({
        totalTrips: trips.length,
        totalBookmarks: bookmarks.length,
        totalReviews: reviews.length
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    if (!currentUser) return

    try {
      // Load recent trips and bookmarks to show as activity
      const [trips, bookmarks, reviews] = await Promise.all([
        getUserTrips(currentUser.uid),
        getUserBookmarks(currentUser.uid),
        getUserReviews(currentUser.uid)
      ])

      const activities = []

      // Add recent trips
      trips.slice(0, 3).forEach(trip => {
        activities.push({
          type: 'trip',
          icon: <FlightTakeoff />,
          title: `Created trip: ${trip.title || 'Untitled Trip'}`,
          timestamp: trip.createdAt,
          color: 'primary'
        })
      })

      // Add recent bookmarks
      bookmarks.slice(0, 3).forEach(bookmark => {
        activities.push({
          type: 'bookmark',
          icon: <Bookmark />,
          title: `Bookmarked: ${bookmark.name || 'Unknown Destination'}`,
          timestamp: bookmark.bookmarkedAt,
          color: 'secondary'
        })
      })

      // Add recent reviews
      reviews.slice(0, 3).forEach(review => {
        activities.push({
          type: 'review',
          icon: <RateReview />,
          title: `Reviewed a destination`,
          timestamp: review.createdAt,
          color: 'success'
        })
      })

      // Sort by timestamp and take top 5
      activities.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0)
        const timeB = b.timestamp?.toDate?.() || new Date(0)
        return timeB - timeA
      })

      setRecentActivity(activities.slice(0, 5))
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    setSaving(true)
    try {
      // Update Firestore profile
      await updateUserProfile(currentUser.uid, formData)

      // Update Auth profile (displayName and photoURL)
      if (updateAuthProfile) {
        await updateAuthProfile({
          displayName: formData.displayName,
          photoURL: formData.photoURL
        })
      }

      toast.success('Profile updated successfully!')
      setIsEditing(false)

      // Reload the page to get updated profile
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form data to original profile
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        interests: userProfile.interests || [],
        travelStyle: userProfile.travelStyle || '',
        photoURL: userProfile.photoURL || ''
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  const validatePassword = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required')
      return false
    }
    if (!passwordData.newPassword) {
      setPasswordError('New password is required')
      return false
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return false
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    setPasswordError('')

    if (!validatePassword()) {
      return
    }

    setSaving(true)
    try {
      await changePassword(passwordData.newPassword)
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordSection(false)
    } catch (error) {
      console.error('Error changing password:', error)
      if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Please log out and log in again to change your password')
      } else {
        setPasswordError('Failed to change password. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently'

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch (error) {
      return 'Recently'
    }
  }

  // Check if user signed in with email/password
  const isEmailProvider = currentUser?.providerData?.some(
    provider => provider.providerId === 'password'
  )

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ bgcolor: darkMode ? 'grey.800' : 'white', color: darkMode ? 'white' : 'text.primary' }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            My Profile
          </Typography>
          {!isEditing && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{ borderRadius: 2 }}
            >
              Edit Profile
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={8}>
            {/* Profile Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={formData.photoURL || currentUser?.photoURL}
                    alt={formData.displayName}
                    sx={{ width: 100, height: 100, fontSize: 40 }}
                  >
                    {(formData.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 36,
                        height: 36
                      }}
                      size="small"
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ ml: 3, flexGrow: 1 }}>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="displayName"
                      label="Display Name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      error={!!errors.displayName}
                      helperText={errors.displayName}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>
                      {formData.displayName || 'Anonymous User'}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {currentUser?.email}
                    </Typography>
                    {currentUser?.emailVerified && (
                      <CheckCircle fontSize="small" color="success" />
                    )}
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Bio */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Bio
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    error={!!errors.bio}
                    helperText={errors.bio || `${formData.bio.length}/500 characters`}
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body1" color="text.primary">
                    {formData.bio || 'No bio added yet. Click Edit Profile to add one!'}
                  </Typography>
                )}
              </Box>

              {/* Location */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Location
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="location"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      )
                    }}
                  />
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body1">
                      {formData.location || 'Not specified'}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Travel Style */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Travel Style
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth>
                    <Select
                      name="travelStyle"
                      value={formData.travelStyle}
                      onChange={handleInputChange}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Select your travel style</em>
                      </MenuItem>
                      {TRAVEL_STYLES.map((style) => (
                        <MenuItem key={style} value={style}>
                          {style}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={formData.travelStyle || 'Not specified'}
                    color={formData.travelStyle ? 'primary' : 'default'}
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Interests */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Interests
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {isEditing ? (
                    AVAILABLE_INTERESTS.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        onClick={() => handleInterestToggle(interest)}
                        color={formData.interests.includes(interest) ? 'primary' : 'default'}
                        variant={formData.interests.includes(interest) ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))
                  ) : formData.interests.length > 0 ? (
                    formData.interests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No interests added yet
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Action Buttons */}
              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Change Password Section */}
            {isEmailProvider && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock color="action" />
                    <Typography variant="h6" fontWeight={600}>
                      Change Password
                    </Typography>
                  </Box>
                  <Button
                    variant={showPasswordSection ? 'outlined' : 'text'}
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                  >
                    {showPasswordSection ? 'Hide' : 'Show'}
                  </Button>
                </Box>

                {showPasswordSection && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Password must be at least 6 characters long. You may need to re-login after changing your password.
                      </Typography>
                    </Alert>

                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {passwordError}
                      </Alert>
                    )}

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        variant="outlined"
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} /> : <Lock />}
                        onClick={handleChangePassword}
                        disabled={saving}
                        sx={{ borderRadius: 2 }}
                      >
                        {saving ? 'Changing...' : 'Change Password'}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>

          {/* Right Column - Stats & Activity */}
          <Grid item xs={12} md={4}>
            {/* Dark Mode Toggle */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    icon={<LightMode />}
                    checkedIcon={<DarkMode />}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {darkMode ? <DarkMode /> : <LightMode />}
                    <Typography variant="body1">
                      {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            {/* Account Statistics */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account Statistics
              </Typography>
              <Divider sx={{ my: 2 }} />

              {statsLoading ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          p: 1.5,
                          borderRadius: 2,
                          display: 'flex'
                        }}
                      >
                        <FlightTakeoff />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          {stats.totalTrips}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Trips
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ bgcolor: 'secondary.50' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'secondary.main',
                          color: 'white',
                          p: 1.5,
                          borderRadius: 2,
                          display: 'flex'
                        }}
                      >
                        <Bookmark />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="secondary.main">
                          {stats.totalBookmarks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Bookmarks
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          p: 1.5,
                          borderRadius: 2,
                          display: 'flex'
                        }}
                      >
                        <RateReview />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {stats.totalReviews}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Reviews
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>
              )}
            </Paper>

            {/* Recent Activity */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ my: 2 }} />

              {recentActivity.length > 0 ? (
                <List>
                  {recentActivity.map((activity, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        borderLeft: 3,
                        borderColor: `${activity.color}.main`,
                        pl: 2,
                        mb: 1
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box
                          sx={{
                            color: `${activity.color}.main`,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {activity.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={formatTimestamp(activity.timestamp)}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Info color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent activity yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Start exploring destinations!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Profile
