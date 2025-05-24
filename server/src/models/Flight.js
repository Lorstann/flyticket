const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flight_id: {
    type: String,
    required: true,
    unique: true
  },
  from_city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  to_city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true,
    validate: {
      validator: function(v) {
        return v.toString() !== this.from_city.toString();
      },
      message: 'Departure and arrival city cannot be the same'
    }
  },
  departure_time: {
    type: Date,
    required: true
  },
  arrival_time: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    get: v => Math.round(v * 100) / 100
  },
  seats_total: {
    type: Number,
    required: true,
    min: 1
  },
  seats_available: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Validation: departure_time must be before arrival_time
flightSchema.pre('save', async function(next) {
  if (this.departure_time >= this.arrival_time) {
    next(new Error('Departure time must be before arrival time'));
  }
  if (this.seats_available > this.seats_total) {
    next(new Error('Available seats cannot be greater than total seats'));
  }

  // Aynı saatte aynı şehirden kalkan başka uçuş var mı kontrol et
  const departureHour = new Date(this.departure_time);
  departureHour.setMinutes(0, 0, 0);
  const nextHour = new Date(departureHour);
  nextHour.setHours(departureHour.getHours() + 1);

  const sameDepartureTime = await this.constructor.findOne({
    from_city: this.from_city,
    departure_time: {
      $gte: departureHour,
      $lt: nextHour
    },
    _id: { $ne: this._id }
  });

  if (sameDepartureTime) {
    next(new Error('There is another flight at the same time from the same city'));
  }

  // Aynı saatte aynı şehre varan başka uçuş var mı kontrol et
  const arrivalHour = new Date(this.arrival_time);
  arrivalHour.setMinutes(0, 0, 0);
  const nextArrivalHour = new Date(arrivalHour);
  nextArrivalHour.setHours(arrivalHour.getHours() + 1);

  const sameArrivalTime = await this.constructor.findOne({
    to_city: this.to_city,
    arrival_time: {
      $gte: arrivalHour,
      $lt: nextArrivalHour
    },
    _id: { $ne: this._id }
  });

  if (sameArrivalTime) {
    next(new Error('There is another flight at the same time to the same city'));
  }

  next();
});

// Create compound index for faster queries
flightSchema.index({ from_city: 1, to_city: 1, departure_time: 1 });

module.exports = mongoose.model('Flight', flightSchema); 