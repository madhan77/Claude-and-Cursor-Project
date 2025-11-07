import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { FcGoogle } from 'react-icons/fc'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Alert
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  GitHub,
  Email,
  Lock,
  Person,
  TravelExplore
} from '@mui/icons-material'

const Login = () => {
  const navigate = useNavigate()
  const { login, signup, loginWithGoogle, loginWithGithub } = useContext(AuthContext)

  // Tab state
  const [activeTab, setActiveTab] = useState(0)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form validation
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [displayNameError, setDisplayNameError] = useState('')

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setError('')
    setEmailError('')
    setPasswordError('')
    setDisplayNameError('')
    setEmail('')
    setPassword('')
    setDisplayName('')
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateDisplayName = (name) => {
    if (!name) {
      setDisplayNameError('Display name is required')
      return false
    }
    if (name.length < 2) {
      setDisplayNameError('Display name must be at least 2 characters')
      return false
    }
    setDisplayNameError('')
    return true
  }

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    let isDisplayNameValid = true

    if (activeTab === 1) {
      isDisplayNameValid = validateDisplayName(displayName)
    }

    if (!isEmailValid || !isPasswordValid || !isDisplayNameValid) {
      return
    }

    setLoading(true)

    try {
      if (activeTab === 0) {
        // Sign In
        await login(email, password)
        toast.success('Welcome back! Signed in successfully.')
      } else {
        // Sign Up
        await signup(email, password, displayName)
        toast.success('Account created successfully! Welcome to Global Explorer.')
      }
      navigate('/')
    } catch (err) {
      console.error('Authentication error:', err)
      let errorMessage = 'An error occurred. Please try again.'

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      await loginWithGoogle()
      toast.success('Signed in with Google successfully!')
      navigate('/')
    } catch (err) {
      console.error('Google sign-in error:', err)
      let errorMessage = 'Failed to sign in with Google. Please try again.'

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.'
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled.'
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      await loginWithGithub()
      toast.success('Signed in with GitHub successfully!')
      navigate('/')
    } catch (err) {
      console.error('GitHub sign-in error:', err)
      let errorMessage = 'Failed to sign in with GitHub. Please try again.'

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.'
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled.'
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(240, 147, 251, 0.3), transparent 50%)',
          animation: 'gradient 15s ease infinite',
        },
        '@keyframes gradient': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.8,
          },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          {/* Logo and Title */}
          <Box textAlign="center" mb={3}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2,
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              }}
            >
              <TravelExplore sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Global Explorer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover the world, one destination at a time
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: '#667eea',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              label="Sign In"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#667eea',
                },
              }}
            />
            <Tab
              label="Sign Up"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#667eea',
                },
              }}
            />
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleEmailPasswordAuth}>
            <Stack spacing={2.5}>
              {/* Display Name (Sign Up only) */}
              {activeTab === 1 && (
                <TextField
                  fullWidth
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    if (displayNameError) validateDisplayName(e.target.value)
                  }}
                  onBlur={() => validateDisplayName(displayName)}
                  error={!!displayNameError}
                  helperText={displayNameError}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    },
                  }}
                />
              )}

              {/* Email */}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(email)}
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) validatePassword(e.target.value)
                }}
                onBlur={() => validatePassword(password)}
                error={!!passwordError}
                helperText={passwordError || (activeTab === 1 && 'Must be at least 6 characters')}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6b3f93 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)',
                  },
                }}
              >
                {loading ? 'Processing...' : activeTab === 0 ? 'Sign In' : 'Create Account'}
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Social Sign In Buttons */}
          <Stack spacing={2}>
            {/* Google Sign In */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleSignIn}
              disabled={loading}
              startIcon={<FcGoogle size={24} />}
              sx={{
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
              }}
            >
              Continue with Google
            </Button>

            {/* GitHub Sign In */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGithubSignIn}
              disabled={loading}
              startIcon={<GitHub sx={{ fontSize: 24 }} />}
              sx={{
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Continue with GitHub
            </Button>
          </Stack>

          {/* Footer Text */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 3 }}
          >
            {activeTab === 0 ? (
              <>
                Don't have an account?{' '}
                <Box
                  component="span"
                  onClick={() => setActiveTab(1)}
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up here
                </Box>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Box
                  component="span"
                  onClick={() => setActiveTab(0)}
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Box>
              </>
            )}
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
