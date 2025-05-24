const express = require('express');
const router = express.Router();
const City = require('../models/City');

// Get all cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find().sort({ city_name: 1 });
    res.json({ cities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get city by ID
router.get('/:id', async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json({ city });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 