const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticket_id: {
    type: String,
    required: true,
    unique: true
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passenger_name: {
    type: String,
    required: true
  },
  passenger_surname: {
    type: String,
    required: true
  },
  passenger_email: {
    type: String,
    required: true
  },
  seat_number: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  booking_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
ticketSchema.index({ passenger_email: 1 });
ticketSchema.index({ flight_id: 1 });
ticketSchema.index({ booking_date: 1 });

module.exports = mongoose.model('Ticket', ticketSchema); 