import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Booking() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_surname: '',
    passenger_email: '',
    seat_number: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlightDetails();
  }, [flightId]);

  const fetchFlightDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlight(data.flight);
      await fetchOccupiedSeats();
      setLoading(false);
    } catch (error) {
      setError('An error occurred while loading flight details');
      setLoading(false);
    }
  };

  const fetchOccupiedSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/tickets/flight/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data && data.occupiedSeats) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        setOccupiedSeats([]);
      }
    } catch (error) {
      console.error('Occupied seats not loaded:', error);
      setError('An error occurred while loading occupied seats');
      setOccupiedSeats([]);
    }
  };

  const handleSeatClick = (seatNumber) => {
    setSelectedSeat(seatNumber);
    setFormData({ ...formData, seat_number: seatNumber });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Form validation
      if (!selectedSeat) {
        setError('Please select a seat');
        return;
      }

      if (!formData.passenger_name || !formData.passenger_surname || !formData.passenger_email) {
        setError('Please fill in all passenger information');
        return;
      }

      // Check if the selected seat is available
      if (occupiedSeats.includes(selectedSeat)) {
        setError('The selected seat is no longer available. Please select another seat.');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/tickets`, {
        ...formData,
        flight_id: flightId,
        seat_number: selectedSeat
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Ticket created:', response.data);
      
      // Reload occupied seats
      await fetchOccupiedSeats();
      
      // Update flight details
      const { data } = await axios.get(`${API_URL}/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlight(data.flight);
      
      // Show success message and redirect to home page
      setError('');
      setSuccess('Your ticket has been successfully created! You are being redirected to the home page...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Ticket creation error:', error);
      setError(error.response?.data?.message || 'An error occurred while creating the ticket');
      setSuccess('');
    }
  };

  // Seat arrangement
  const renderSeats = () => {
    if (!flight) return null;

    const rows = Math.ceil(flight.seats_total / 6); // Her sırada 6 koltuk (3-3 düzeni)
    const seats = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < 6; col++) {
        const seatNumber = row * 6 + col + 1;
        if (seatNumber <= flight.seats_total) {
          const isOccupied = occupiedSeats.includes(seatNumber);
          const isSelected = selectedSeat === seatNumber;
          const seatLetter = col < 3 ? String.fromCharCode(65 + col) : String.fromCharCode(66 + col); // A, B, C | D, E, F
          
          rowSeats.push(
            <Box
              key={seatNumber}
              sx={{
                width: 45,
                height: 45,
                m: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : isOccupied ? 'grey.400' : 'grey.300',
                bgcolor: isSelected ? 'primary.main' : isOccupied ? 'grey.200' : 'white',
                color: isSelected ? 'white' : isOccupied ? 'grey.500' : 'text.primary',
                cursor: isOccupied ? 'not-allowed' : 'pointer',
                '&:hover': {
                  bgcolor: isOccupied ? 'grey.200' : isSelected ? 'primary.main' : 'primary.light',
                  color: isOccupied ? 'grey.500' : 'white',
                  transform: isOccupied ? 'none' : 'scale(1.05)',
                },
                borderRadius: 1,
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
              }}
              onClick={() => !isOccupied && handleSeatClick(seatNumber)}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {seatNumber}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {seatLetter}
              </Typography>
            </Box>
          );

          // Add corridor
          if (col === 2) {
            rowSeats.push(
              <Box
                key={`corridor-${row}`}
                sx={{
                  width: 30,
                  height: 45,
                  m: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 2,
                    bgcolor: 'grey.300',
                  }}
                />
              </Box>
            );
          }
        }
      }
      seats.push(
        <Box key={row} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          {rowSeats}
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Seat Selection
        </Typography>
        
        {/* Aircraft Front */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3,
          position: 'relative'
        }}>
          <Box sx={{ 
            width: '80%', 
            height: 40, 
            bgcolor: 'grey.100',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'grey.300',
            borderBottom: 'none'
          }}>
            <Typography variant="caption" color="text.secondary">
              FRONT
            </Typography>
          </Box>
        </Box>

        {/* Koltuklar */}
        <Box sx={{ 
          maxWidth: 400, 
          mx: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          {seats}
        </Box>

        {/* Indicator */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: 'grey.200', 
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'grey.400'
            }} />
            <Typography variant="caption">Occupied</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: 'white', 
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'grey.300'
            }} />
            <Typography variant="caption">Available</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: 'primary.main', 
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'primary.main'
            }} />
            <Typography variant="caption">Selected</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Flight not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ticket Reservation
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

      <Grid container spacing={3}>
        <Grid sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Flight Details
              </Typography>
              <Grid container spacing={2}>
                <Grid sx={{ width: { xs: '50%' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    From
                  </Typography>
                  <Typography variant="body1">
                    {flight.from_city.city_name}
                  </Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Where
                  </Typography>
                  <Typography variant="body1">
                    {flight.to_city.city_name}
                  </Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Departure
                  </Typography>
                  <Typography variant="body1">
                    {new Date(flight.departure_time).toLocaleString('tr-TR')}
                  </Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Arrival
                  </Typography>
                  <Typography variant="body1">
                    {new Date(flight.arrival_time).toLocaleString('tr-TR')}
                  </Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body1">
                    {flight.price.toLocaleString('tr-TR')} ₺
                  </Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Available Seats
                  </Typography>
                  <Typography variant="body1">
                    {flight.seats_available}/{flight.seats_total}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {renderSeats()}
        </Grid>

        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Passenger Information
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label="Name"
                value={formData.passenger_name}
                onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                margin="normal"
              />
              <TextField
                required
                fullWidth
                label="Surname"
                value={formData.passenger_surname}
                onChange={(e) => setFormData({ ...formData, passenger_surname: e.target.value })}
                margin="normal"
              />
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.passenger_email}
                onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
                margin="normal"
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Selected Seat: {selectedSeat || 'Not selected yet'}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!selectedSeat}
                sx={{ mt: 2 }}
              >
                Book
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Booking; 