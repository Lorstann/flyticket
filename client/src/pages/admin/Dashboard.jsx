import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flight as FlightIcon,
  ConfirmationNumber as TicketIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard({ user }) {
  const [tab, setTab] = useState(0);
  const [flights, setFlights] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [flightDialog, setFlightDialog] = useState({ open: false, flight: null });
  const [flightForm, setFlightForm] = useState({
    flight_id: '',
    from_city: '',
    to_city: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    seats_total: '',
    seats_available: ''
  });

  // Filter available cities for destination based on selected departure city
  const availableDestinationCities = cities.filter(city => city._id !== flightForm.from_city);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().slice(0, 16);
  };

  // Get minimum arrival time based on departure time
  const getMinArrivalTime = () => {
    if (!flightForm.departure_time) return getMinDate();
    const departureTime = new Date(flightForm.departure_time);
    departureTime.setMinutes(departureTime.getMinutes() + 30); // Minimum 30 minutes between flights
    return departureTime.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchFlights();
    fetchTickets();
    fetchCities();
  }, []);

  const fetchFlights = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/admin/flights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlights(data.flights);
    } catch (error) {
      setError('An error occurred while loading flights');
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(data.tickets);
    } catch (error) {
      setError('An error occurred while loading tickets');
    }
  };

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/cities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCities(data.cities);
    } catch (error) {
      setError('An error occurred while loading cities');
    }
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation rules
    if (flightForm.from_city === flightForm.to_city) {
      setError('Departure and arrival cities cannot be the same');
      return;
    }

    const departureTime = new Date(flightForm.departure_time);
    const arrivalTime = new Date(flightForm.arrival_time);

    if (departureTime >= arrivalTime) {
      setError('Arrival time must be after departure time');
      return;
    }

    if (parseInt(flightForm.seats_total) < parseInt(flightForm.seats_available)) {
      setError('Total seats cannot be less than available seats');
      return;
    }

    if (parseFloat(flightForm.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const formData = {
        ...flightForm,
        departure_time: departureTime.toISOString(),
        arrival_time: arrivalTime.toISOString()
      };

      if (flightDialog.flight) {
        await axios.put(`${API_URL}/admin/flights/${flightDialog.flight._id}`, formData, { headers });
        setSuccess('Flight updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/flights`, formData, { headers });
        setSuccess('Flight created successfully');
      }
      setFlightDialog({ open: false, flight: null });
      setFlightForm({
        flight_id: '',
        from_city: '',
        to_city: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        seats_total: '',
        seats_available: ''
      });
      fetchFlights();
    } catch (error) {
      if (error.response?.status === 409) {
        setError('This flight ID is already in use');
      } else {
        setError(error.response?.data?.message || 'An error occurred');
      }
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight? This will also cancel all active tickets for this flight.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh both flights and tickets lists
      await Promise.all([
        fetchFlights(),
        fetchTickets()
      ]);
      
      setSuccess('Flight deleted successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while deleting the flight');
    }
  };

  const handleEditFlight = (flight) => {
    setFlightForm({
      flight_id: flight.flight_id,
      from_city: flight.from_city._id,
      to_city: flight.to_city._id,
      departure_time: new Date(flight.departure_time).toISOString().slice(0, 16),
      arrival_time: new Date(flight.arrival_time).toISOString().slice(0, 16),
      price: flight.price,
      seats_total: flight.seats_total,
      seats_available: flight.seats_available
    });
    setFlightDialog({ open: true, flight });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Paneli
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<FlightIcon />} label="Flights" />
          <Tab icon={<TicketIcon />} label="Tickets" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFlightDialog({ open: true, flight: null })}
            >
              New Flight
            </Button>
          </Box>

          <Grid container spacing={3}>
            {flights.map((flight) => (
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
                    <Box sx={{ mt: 2 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditFlight(flight)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteFlight(flight._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          {tickets.map((ticket) => (
            <Grid key={ticket._id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ticket No: {ticket.ticket_id}
                  </Typography>
                  {ticket.flight ? (
                    <>
                      <Typography color="textSecondary" gutterBottom>
                        {ticket.flight.from_city?.city_name} → {ticket.flight.to_city?.city_name}
                      </Typography>
                      <Typography variant="body2">
                        Flight: {ticket.flight.flight_id}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="error" gutterBottom>
                      Flight information not found
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Seats: {ticket.seat_number}
                  </Typography>
                  <Typography variant="body2">
                    Status: {ticket.status}
                  </Typography>
                  <Typography variant="body2">
                    User: {ticket.user?.name} {ticket.user?.surname}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={flightDialog.open}
        onClose={() => setFlightDialog({ open: false, flight: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {flightDialog.flight ? 'Edit Flight' : 'New Flight'}
        </DialogTitle>
        <form onSubmit={handleFlightSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Flight ID"
                  value={flightForm.flight_id}
                  onChange={(e) => setFlightForm({ ...flightForm, flight_id: e.target.value.toUpperCase() })}
                  required
                  inputProps={{ maxLength: 6 }}
                  helperText="6 char length unique ID"
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  select
                  fullWidth
                  label="Departure City"
                  value={flightForm.from_city}
                  onChange={(e) => {
                    const newFromCity = e.target.value;
                    setFlightForm({
                      ...flightForm,
                      from_city: newFromCity,
                      to_city: newFromCity === flightForm.to_city ? '' : flightForm.to_city
                    });
                  }}
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  select
                  fullWidth
                  label="Arrival City"
                  value={flightForm.to_city}
                  onChange={(e) => setFlightForm({ ...flightForm, to_city: e.target.value })}
                  required
                  disabled={!flightForm.from_city}
                  error={flightForm.from_city === flightForm.to_city && flightForm.to_city !== ''}
                  helperText={flightForm.from_city === flightForm.to_city && flightForm.to_city !== '' ? 'Departure and arrival cities cannot be the same' : ''}
                >
                  {availableDestinationCities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Departure Time"
                  name="departure_time"
                  value={flightForm.departure_time}
                  onChange={(e) => {
                    const newDepartureTime = e.target.value;
                    setFlightForm({
                      ...flightForm,
                      departure_time: newDepartureTime,
                      arrival_time: newDepartureTime > flightForm.arrival_time ? '' : flightForm.arrival_time
                    });
                  }}
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{ min: getMinDate() }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          const input = document.querySelector('input[name="departure_time"]');
                          if (input) {
                            input.showPicker();
                          }
                        }}
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Arrival Time"
                  name="arrival_time"
                  value={flightForm.arrival_time}
                  onChange={(e) => setFlightForm({ ...flightForm, arrival_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{ min: getMinArrivalTime() }}
                  disabled={!flightForm.departure_time}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          const input = document.querySelector('input[name="arrival_time"]');
                          if (input) {
                            input.showPicker();
                          }
                        }}
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  value={flightForm.price}
                  onChange={(e) => setFlightForm({ ...flightForm, price: e.target.value })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Price in USD"
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Seats"
                  value={flightForm.seats_total}
                  onChange={(e) => setFlightForm({ ...flightForm, seats_total: e.target.value })}
                  required
                  inputProps={{ min: 1, max: 200 }}
                  helperText="1-200 range"
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Available Seats"
                  value={flightForm.seats_available}
                  onChange={(e) => setFlightForm({ ...flightForm, seats_available: e.target.value })}
                  required
                  inputProps={{ min: 0, max: flightForm.seats_total || 200 }}
                  helperText={`0-${flightForm.seats_total || 200} range`}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFlightDialog({ open: false, flight: null })}>
              İptal
            </Button>
            <Button type="submit" variant="contained">
              {flightDialog.flight ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard; 