import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Flight as FlightIcon,
  AdminPanelSettings as AdminIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchParams, setSearchParams] = useState({
    from_city: '',
    to_city: '',
    departure_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Auth states
  const [user, setUser] = useState(null);
  const [authDialog, setAuthDialog] = useState({ open: false, type: '' });
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    surname: ''
  });
  const [authError, setAuthError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchFlights();
    fetchCities();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  };

  const fetchFlights = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/flights`);
      setFlights(data.flights);
      setLoading(false);
    } catch (error) {
      setError('An error occurred while loading flights');
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/cities`);
      setCities(data.cities);
    } catch (error) {
      console.error('An error occurred while loading cities:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`${API_URL}/flights`, {
        params: searchParams
      });
      setFlights(data.flights);
    } catch (error) {
      setError('An error occurred while searching for flights');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const endpoint = authDialog.type === 'login' ? '/login' : '/register';
      const { data } = await axios.post(`${API_URL}/auth${endpoint}`, authForm);
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setAuthDialog({ open: false, type: '' });
      setAuthForm({ email: '', password: '', name: '', surname: '' });
    } catch (error) {
      setAuthError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAnchorEl(null);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Sort flights by price
  const sortedFlights = [...flights].sort((a, b) => {
    return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <FlightIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flight Reservation
          </Typography>
          
          {user ? (
            <>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.name[0]}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => navigate('/my-tickets')}>
                  My Tickets
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem onClick={() => navigate('/admin')}>
                    <AdminIcon sx={{ mr: 1 }} /> Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={() => setAuthDialog({ open: true, type: 'login' })}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                startIcon={<RegisterIcon />}
                onClick={() => setAuthDialog({ open: true, type: 'register' })}
                variant="outlined"
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid xs={12}>
              <Typography variant="h2" component="h1" gutterBottom>
                Find Your Dream Flight
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Discover the best flights and book now
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Form */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={3}>
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                <TextField
                  select
                  fullWidth
                  label="From"
                  name="from"
                  value={searchParams.from_city}
                  onChange={(e) => setSearchParams({ ...searchParams, from_city: e.target.value })}
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                <TextField
                  select
                  fullWidth
                  label="To"
                  name="to"
                  value={searchParams.to_city}
                  onChange={(e) => setSearchParams({ ...searchParams, to_city: e.target.value })}
                  required
                  error={searchParams.from_city === searchParams.to_city && searchParams.to_city !== ''}
                  helperText={searchParams.from_city === searchParams.to_city && searchParams.to_city !== '' ? 'Departure and arrival points cannot be the same' : ''}
                >
                  {cities
                    .filter(city => city._id !== searchParams.from_city)
                    .map((city) => (
                      <MenuItem key={city._id} value={city._id}>
                        {city.city_name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="date"
                  value={searchParams.departure_date}
                  onChange={(e) => setSearchParams({ ...searchParams, departure_date: e.target.value })}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => {
                          const input = document.querySelector('input[name="date"]');
                          if (input) input.showPicker();
                        }}
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid sx={{ width: '100%' }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSearch}
                  disabled={!searchParams.from_city || !searchParams.to_city || !searchParams.departure_date}
                >
                  Search Flights
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Available Flights
          </Typography>
          <Button
            variant="outlined"
            onClick={handleSort}
            startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          >
            Sort by Price {sortOrder === 'asc' ? '(Low to High)' : '(High to Low)'}
          </Button>
        </Box>

        {/* Flights List */}
        <Grid container spacing={3}>
          {sortedFlights.map((flight) => (
            <Grid key={flight._id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {flight.flight_id}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {flight.from_city.city_name} → {flight.to_city.city_name}
                  </Typography>
                  <Typography variant="body2">
                    Departure: {new Date(flight.departure_time).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Arrival: {new Date(flight.arrival_time).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Price: {flight.price} USD
                  </Typography>
                  <Typography variant="body2">
                    Seats: {flight.seats_available}/{flight.seats_total}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/booking/${flight._id}`)}
                    disabled={flight.seats_available === 0}
                  >
                    {flight.seats_available === 0 ? 'Full' : 'Book'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Auth Dialog */}
      <Dialog
        open={authDialog.open}
        onClose={() => setAuthDialog({ open: false, type: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {authDialog.type === 'login' ? 'Login' : 'Register'}
        </DialogTitle>
        <DialogContent>
          {authError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleAuth} sx={{ mt: 2 }}>
            {authDialog.type === 'register' && (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Surname"
                  value={authForm.surname}
                  onChange={(e) => setAuthForm({ ...authForm, surname: e.target.value })}
                  margin="normal"
                  required
                />
              </>
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              margin="normal"
              required
            />
            <DialogActions>
              <Button
                onClick={() => setAuthDialog({ open: false, type: '' })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
              >
                {authDialog.type === 'login' ? 'Login' : 'Register'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Home; 