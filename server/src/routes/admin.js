const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Admin login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin middleware
const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not authorized to perform this action' });
  }
  next();
};

// Protected routes
router.use(auth);
router.use(adminAuth);

// Get all flights
router.get('/flights', async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate('from_city', 'city_name')
      .populate('to_city', 'city_name')
      .sort({ departure_time: 1 });
    res.json({ flights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create flight
router.post('/flights', [
  body('flight_id').notEmpty(),
  body('from_city').notEmpty(),
  body('to_city').notEmpty(),
  body('departure_time').isISO8601(),
  body('arrival_time').isISO8601(),
  body('price').isFloat({ min: 0 }),
  body('seats_total').isInt({ min: 1 }),
  body('seats_available').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const flight = await new Flight(req.body).save();
    res.status(201).json({ flight });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update flight
router.put('/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    // If the number of seats is being reduced, check the occupied seats
    if (req.body.seats_total && req.body.seats_total < flight.seats_total) {
      const activeTickets = await Ticket.countDocuments({
        flight: req.params.id,
        status: 'active'
      });
      
      if (activeTickets > req.body.seats_total) {
        return res.status(400).json({ 
          message: `There are ${activeTickets} active tickets on this flight. The total number of seats cannot be less than ${activeTickets}.` 
        });
      }
    }

    // Update flight
    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      { ...req.body, seats_available: req.body.seats_total - (flight.seats_total - flight.seats_available) },
      { new: true, runValidators: true }
    );

    if (!updatedFlight) {
      return res.status(400).json({ message: 'An error occurred while updating the flight' });
    }

    res.json({ flight: updatedFlight });
  } catch (error) {
    console.error('Flight update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete flight
router.delete('/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    // Check and cancel active tickets
    const activeTickets = await Ticket.countDocuments({
      flight: req.params.id,
      status: 'active'
    });

    if (activeTickets > 0) {
      // Cancel active tickets
      await Ticket.updateMany(
        { flight: req.params.id, status: 'active' },
        { status: 'cancelled' }
      );
    }

    // Delete flight and all related tickets
    await Promise.all([
      Flight.findByIdAndDelete(req.params.id),
      Ticket.deleteMany({ flight: req.params.id, status: { $ne: 'active' } })
    ]);
    
    res.json({ 
      message: activeTickets > 0 
        ? `${activeTickets} active tickets were cancelled and the flight was deleted` 
        : 'Flight and related tickets were deleted successfully' 
    });
  } catch (error) {
    console.error('Uçuş silme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all tickets
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: 'flight',
        populate: [
          { path: 'from_city', select: 'city_name' },
          { path: 'to_city', select: 'city_name' }
        ]
      })
      .populate('user', 'name surname email')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    console.error('Ticket loading error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 