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
    <Box sx={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}>
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
