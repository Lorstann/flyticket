import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Flight as FlightIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  ConfirmationNumber as TicketIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/tickets/my-tickets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTickets(data.tickets);
      setLoading(false);
    } catch (error) {
      setError('An error occurred while loading your tickets');
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchTickets();
    } catch (error) {
      setError('An error occurred while canceling the ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Tickets
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tickets.length === 0 ? (
        <Alert severity="info">
          You have no tickets yet.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket) => (
            <Grid key={ticket._id} sx={{ width: '100%' }}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid sx={{ width: { xs: '100%', md: '66.67%' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TicketIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Ticket No: {ticket.ticket_id}
                        </Typography>
                        <Chip
                          label={getStatusText(ticket.status)}
                          color={getStatusColor(ticket.status)}
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          {ticket.flight.from_city.city_name} → {ticket.flight.to_city.city_name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          {new Date(ticket.flight.departure_time).toLocaleString('tr-TR')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FlightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          Seat No: {ticket.seat_number}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          Passenger: {ticket.passenger_name} {ticket.passenger_surname}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          Email: {ticket.passenger_email}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                          {ticket.flight.price.toLocaleString('tr-TR')} ₺
                        </Typography>
                        {ticket.status === 'active' && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelTicket(ticket._id)}
                          >
                            Cancel Ticket
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MyTickets; 