const express = require('express');
const {
  getRvParks,
  getRvPark,
  createRvPark,
  updateRvPark,
  deleteRvPark
} = require('../controllers/rvParkController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getRvParks)
  .post(protect, authorize('Administrador'), createRvPark);

router
  .route('/:id')
  .get(protect, getRvPark)
  .put(protect, authorize('Administrador'), updateRvPark)
  .delete(protect, authorize('Administrador'), deleteRvPark);

module.exports = router;
