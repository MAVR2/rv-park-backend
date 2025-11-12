const express = require('express');
const {
  getSpots,
  getSpot,
  createSpot,
  updateSpot,
  deleteSpot
} = require('../controllers/spotController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getSpots)
  .post(protect, authorize('Administrador'), createSpot);

router
  .route('/:id')
  .get(protect, getSpot)
  .put(protect, updateSpot)
  .delete(protect, authorize('Administrador'), deleteSpot);

module.exports = router;
