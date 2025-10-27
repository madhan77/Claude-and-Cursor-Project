import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Divider,
  Avatar,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  TravelExplore,
  Google,
} from '@mui/icons-material'

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
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (!isLogin && !displayName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
        toast.success('Welcome back!')
      } else {
        await signup(email, password, displayName)
        toast.success('Account created successfully!')
      }
      navigate('/')
    } catch (error) {
      console.error('Auth error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use')
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password')
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters')
      } else {
        toast.error(isLogin ? 'Failed to login' : 'Failed to create account')
      }
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
      console.error('Google login error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled')
      } else {
        toast.error('Failed to login with Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                margin: '0 auto',
                mb: 2,
              }}
            >
              <TravelExplore sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Global Explorer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover Your Next Adventure
            </Typography>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            )}

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5, fontWeight: 'bold' }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            Continue with Google
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
