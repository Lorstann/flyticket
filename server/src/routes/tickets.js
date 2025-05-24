const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');

// Get all tickets (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .populate('flight')
      .populate('user', 'name surname email');
    
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while loading tickets' });
  }
});

// Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
  try {
    console.log('Fetching tickets for user:', req.user.id);
    
    const tickets = await Ticket.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'flight',
        populate: [
          { path: 'from_city', select: 'city_name' },
          { path: 'to_city', select: 'city_name' }
        ]
      })
      .populate({
        path: 'user',
        select: 'name surname email'
      });
    
    console.log('Found tickets:', tickets.length);
    console.log('First ticket:', JSON.stringify(tickets[0], null, 2));
    console.log('First ticket user:', tickets[0]?.user);
    
    res.json({ tickets });
  } catch (error) {
    console.error('Error in my-tickets route:', error);
    res.status(500).json({ message: 'An error occurred while loading your tickets' });
  }
});

// Get occupied seats for a flight
router.get('/flight/:flightId', async (req, res) => {
  try {
    const tickets = await Ticket.find({
      flight: req.params.flightId,
      status: 'active'
    }).select('seat_number');
    
    const occupiedSeats = tickets.map(ticket => ticket.seat_number);
    res.json({ occupiedSeats });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while loading occupied seats' });
  }
});

// Create a new ticket
router.post('/', auth, async (req, res) => {
  try {
    const { flight_id, seat_number, passenger_name, passenger_surname, passenger_email } = req.body;

    // Check if flight exists
    const flight = await Flight.findById(flight_id)
      .populate('from_city')
      .populate('to_city');
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Check if seat is valid
    if (seat_number < 1 || seat_number > flight.seats_total) {
      return res.status(400).json({ message: 'Invalid seat number' });
    }

    // Check if seat is already occupied
    const existingTicket = await Ticket.findOne({
      flight: flight_id,
      seat_number,
      status: 'active'
    });

    if (existingTicket) {
      return res.status(400).json({ message: 'This seat is already occupied' });
    }

    // Check if there are available seats
    if (flight.seats_available <= 0) {
      return res.status(400).json({ message: 'No available seats for this flight' });
    }

    // Generate ticket ID
    const ticket_id = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create ticket
    const ticket = new Ticket({
      ticket_id,
      flight: flight_id,
      user: req.user.id,
      passenger_name,
      passenger_surname,
      passenger_email,
      seat_number,
      status: 'active'
    });

    await ticket.save();

    // Update flight's available seats
    flight.seats_available -= 1;
    await flight.save();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: {
        ...ticket.toObject(),
        flight
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while creating a ticket' });
  }
});

// Cancel a ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    // Check if ticket is already cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: 'This ticket is already cancelled' });
    }

    // Update ticket status
    ticket.status = 'cancelled';
    await ticket.save();

    // Update flight's available seats
    const flight = await Flight.findById(ticket.flight);
    if (flight) {
      flight.seats_available += 1;
      await flight.save();
    }

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while cancelling a ticket' });
  }
});

module.exports = router; 