const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// Search flights
router.get('/', async (req, res) => {
  try {
    const { from_city, to_city, date } = req.query;
    const query = {};

    if (from_city) query.from_city = from_city;
    if (to_city) query.to_city = to_city;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departure_time = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const flights = await Flight.find(query)
      .populate('from_city', 'city_name')
      .populate('to_city', 'city_name')
      .sort({ departure_time: 1 });

    res.json({ flights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('from_city', 'city_name')
      .populate('to_city', 'city_name');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ flight });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 