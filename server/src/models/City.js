const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  city_id: {
    type: String,
    required: true,
    unique: true
  },
  city_name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Create index for faster queries
citySchema.index({ city_name: 1 });

module.exports = mongoose.model('City', citySchema); 