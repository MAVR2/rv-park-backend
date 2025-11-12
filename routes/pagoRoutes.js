const express = require('express');
const {
  getPagos,
  getPago,
  createPago,
  updatePago,
  deletePago
} = require('../controllers/pagoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getPagos)
  .post(protect, createPago);

router
  .route('/:id')
  .get(protect, getPago)
  .put(protect, authorize('Administrador'), updatePago)
  .delete(protect, authorize('Administrador'), deletePago);

module.exports = router;
