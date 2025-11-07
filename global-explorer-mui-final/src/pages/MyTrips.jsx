import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Skeleton,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  CardActions,
  Avatar,
  Tooltip,
  Paper,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  MoreVert,
  ViewModule,
  ViewList,
  Share,
  Public,
  Lock,
  Place,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  Close,
  Luggage,
  TravelExplore,
  Image as ImageIcon,
  FilterList,
  Sort,
  Event,
  EventAvailable,
  EventBusy
} from '@mui/icons-material'
import { useTrips } from '../hooks/useTrips'
import { toast } from 'react-toastify'

// Empty state illustration component
const EmptyState = ({ onCreateTrip }) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 10,
      px: 3
    }}
  >
    <Box
      sx={{
        width: 200,
        height: 200,
        mx: 'auto',
        mb: 4,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'primary.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Luggage sx={{ fontSize: 60, color: 'primary.main' }} />
      </Box>
      <TravelExplore
        sx={{
          position: 'absolute',
          top: 20,
          right: 30,
          fontSize: 40,
          color: 'primary.light',
          animation: 'float 3s ease-in-out infinite'
        }}
      />
      <Place
        sx={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          fontSize: 35,
          color: 'secondary.main',
          animation: 'float 3s ease-in-out infinite 1s'
        }}
      />
    </Box>
    <Typography variant="h5" fontWeight={600} gutterBottom>
      No trips yet
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
      Start planning your next adventure! Create a trip to organize your destinations and share your journey.
    </Typography>
    <Button
      variant="contained"
      size="large"
      startIcon={<Add />}
      onClick={onCreateTrip}
      sx={{ borderRadius: 2, px: 4, py: 1.5 }}
    >
      Create Your First Trip
    </Button>
  </Box>
)

// Trip card component
const TripCard = ({
  trip,
  viewMode,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onRemoveDestination,
  onShare
}) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    onEdit(trip)
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete(trip.id)
  }

  const handleShare = () => {
    handleMenuClose()
    onShare(trip)
  }

  const startDate = trip.startDate ? new Date(trip.startDate) : null
  const endDate = trip.endDate ? new Date(trip.endDate) : null
  const isUpcoming = startDate && startDate > new Date()
  const isPast = endDate && endDate < new Date()

  // Create thumbnail collage from destinations
  const thumbnails = trip.destinations?.slice(0, 4) || []

  return (
    <Card
      sx={{
        height: viewMode === 'grid' ? '100%' : 'auto',
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: viewMode === 'grid' ? 'translateY(-4px)' : 'none'
        }
      }}
    >
      {/* Thumbnail Collage */}
      <Box
        sx={{
          width: viewMode === 'grid' ? '100%' : 280,
          height: viewMode === 'grid' ? 200 : 'auto',
          minHeight: viewMode === 'list' ? 180 : 0,
          position: 'relative',
          flexShrink: 0
        }}
      >
        {thumbnails.length > 0 ? (
          <Grid container sx={{ height: '100%' }}>
            {thumbnails.map((dest, index) => (
              <Grid
                item
                xs={thumbnails.length === 1 ? 12 : 6}
                key={index}
                sx={{
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  image={dest.image || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400`}
                  alt={dest.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
          </Box>
        )}
        {trip.isPublic && (
          <Chip
            icon={<Public />}
            label="Public"
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, pr: 1 }}>
              {trip.name || 'Untitled Trip'}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Trip</ListItemText>
              </MenuItem>
              {trip.isPublic && (
                <MenuItem onClick={handleShare}>
                  <ListItemIcon>
                    <Share fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share Trip</ListItemText>
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Trip</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          {trip.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {trip.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5, gap: 1 }}>
            {startDate && (
              <Chip
                icon={<CalendarMonth />}
                label={`${startDate.toLocaleDateString()} ${endDate ? '- ' + endDate.toLocaleDateString() : ''}`}
                size="small"
                variant="outlined"
              />
            )}
            {isUpcoming && (
              <Chip label="Upcoming" size="small" color="success" />
            )}
            {isPast && (
              <Chip label="Past" size="small" color="default" />
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <Place sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={600}>
              {trip.destinations?.length || 0} destination{trip.destinations?.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => onToggleExpand(trip.id)}
          >
            {expanded ? 'Hide' : 'View'} Destinations
          </Button>
        </CardActions>

        {/* Expanded Destinations */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            {trip.destinations && trip.destinations.length > 0 ? (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Destinations in this trip:
                </Typography>
                {trip.destinations.map((dest, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Avatar
                      src={dest.image}
                      alt={dest.name}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      <Place />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {dest.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dest.country}
                      </Typography>
                    </Box>
                    <Tooltip title="Remove from trip">
                      <IconButton
                        size="small"
                        onClick={() => onRemoveDestination(trip.id, dest)}
                        sx={{ color: 'error.main' }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No destinations added yet
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    </Card>
  )
}

const MyTrips = () => {
  const navigate = useNavigate()
  const { trips, loading, addTrip, editTrip, removeTrip, removeDestination } = useTrips()

  const [viewMode, setViewMode] = useState('grid')
  const [expandedTrips, setExpandedTrips] = useState(new Set())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentTrip, setCurrentTrip] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortAnchorEl, setSortAnchorEl] = useState(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isPublic: false
  })

  // Handle expand/collapse
  const handleToggleExpand = (tripId) => {
    const newExpanded = new Set(expandedTrips)
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId)
    } else {
      newExpanded.add(tripId)
    }
    setExpandedTrips(newExpanded)
  }

  // Handle create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isPublic: false
    })
    setCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
  }

  const handleCreateTrip = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a trip name')
      return
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      toast.error('End date must be after start date')
      return
    }

    await addTrip(formData)
    handleCloseCreateDialog()
  }

  // Handle edit dialog
  const handleOpenEditDialog = (trip) => {
    setCurrentTrip(trip)
    setFormData({
      name: trip.name || '',
      description: trip.description || '',
      startDate: trip.startDate || '',
      endDate: trip.endDate || '',
      isPublic: trip.isPublic || false
    })
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setCurrentTrip(null)
  }

  const handleUpdateTrip = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a trip name')
      return
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      toast.error('End date must be after start date')
      return
    }

    await editTrip(currentTrip.id, formData)
    handleCloseEditDialog()
  }

  // Handle delete
  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await removeTrip(tripId)
    }
  }

  // Handle remove destination
  const handleRemoveDestination = async (tripId, destination) => {
    if (window.confirm(`Remove ${destination.name} from this trip?`)) {
      await removeDestination(tripId, destination)
    }
  }

  // Handle share
  const handleShareTrip = (trip) => {
    const url = `${window.location.origin}/trip/${trip.id}`
    navigator.clipboard.writeText(url)
    toast.success('Trip link copied to clipboard!')
  }

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips]

    // Filter
    if (filterType === 'upcoming') {
      result = result.filter(trip => {
        if (!trip.startDate) return false
        return new Date(trip.startDate) > new Date()
      })
    } else if (filterType === 'past') {
      result = result.filter(trip => {
        if (!trip.endDate) return false
        return new Date(trip.endDate) < new Date()
      })
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate) : new Date(0)
        const dateB = b.startDate ? new Date(b.startDate) : new Date(0)
        return dateB - dateA
      })
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    return result
  }, [trips, filterType, sortBy])

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Luggage sx={{ fontSize: 28, color: 'primary.main', mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            My Trips
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            sx={{ borderRadius: 2 }}
          >
            Create New Trip
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Toolbar */}
        {trips.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Filter */}
            <Button
              startIcon={<FilterList />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Filter: {filterType === 'all' ? 'All Trips' : filterType === 'upcoming' ? 'Upcoming' : 'Past'}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setFilterType('all')
                  setFilterAnchorEl(null)
                }}
                selected={filterType === 'all'}
              >
                <ListItemIcon>
                  <Event fontSize="small" />
                </ListItemIcon>
                <ListItemText>All Trips</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFilterType('upcoming')
                  setFilterAnchorEl(null)
                }}
                selected={filterType === 'upcoming'}
              >
                <ListItemIcon>
                  <EventAvailable fontSize="small" />
                </ListItemIcon>
                <ListItemText>Upcoming</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFilterType('past')
                  setFilterAnchorEl(null)
                }}
                selected={filterType === 'past'}
              >
                <ListItemIcon>
                  <EventBusy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Past</ListItemText>
              </MenuItem>
            </Menu>

            {/* Sort */}
            <Button
              startIcon={<Sort />}
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Sort: {sortBy === 'date' ? 'By Date' : 'By Name'}
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={() => setSortAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setSortBy('date')
                  setSortAnchorEl(null)
                }}
                selected={sortBy === 'date'}
              >
                <ListItemIcon>
                  <CalendarMonth fontSize="small" />
                </ListItemIcon>
                <ListItemText>By Date</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSortBy('name')
                  setSortAnchorEl(null)
                }}
                selected={sortBy === 'name'}
              >
                <ListItemIcon>
                  <Sort fontSize="small" />
                </ListItemIcon>
                <ListItemText>By Name</ListItemText>
              </MenuItem>
            </Menu>

            <Box sx={{ flexGrow: 1 }} />

            {/* View Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid">
                <ViewModule />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Loading State */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} width="60%" />
                    <Skeleton variant="text" height={20} width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredAndSortedTrips.length > 0 ? (
          <>
            {/* Trips Count */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {filteredAndSortedTrips.length} trip{filteredAndSortedTrips.length !== 1 ? 's' : ''} found
            </Typography>

            {/* Trips Grid/List */}
            <Grid container spacing={3}>
              {filteredAndSortedTrips.map((trip) => (
                <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={trip.id}>
                  <TripCard
                    trip={trip}
                    viewMode={viewMode}
                    expanded={expandedTrips.has(trip.id)}
                    onToggleExpand={handleToggleExpand}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleDeleteTrip}
                    onRemoveDestination={handleRemoveDestination}
                    onShare={handleShareTrip}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : trips.length === 0 ? (
          <EmptyState onCreateTrip={handleOpenCreateDialog} />
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No trips found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterType('all')
                setSortBy('date')
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Create Trip Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Create New Trip
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              label="Trip Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer in Europe"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your trip..."
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {formData.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                  <Typography variant="body2">
                    {formData.isPublic ? 'Public (anyone can view)' : 'Private (only you can view)'}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseCreateDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTrip}
            disabled={!formData.name.trim()}
            sx={{ borderRadius: 2 }}
          >
            Create Trip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Edit Trip
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              label="Trip Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer in Europe"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your trip..."
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {formData.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                  <Typography variant="body2">
                    {formData.isPublic ? 'Public (anyone can view)' : 'Private (only you can view)'}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEditDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateTrip}
            disabled={!formData.name.trim()}
            sx={{ borderRadius: 2 }}
          >
            Update Trip
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </Box>
  )
}

export default MyTrips
