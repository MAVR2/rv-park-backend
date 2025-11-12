const express = require('express');
const {
  getRentas,
  getRenta,
  createRenta,
  updateRenta,
  deleteRenta
} = require('../controllers/rentaController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getRentas)
  .post(protect, createRenta);

router
  .route('/:id')
  .get(protect, getRenta)
  .put(protect, updateRenta)
  .delete(protect, authorize('Administrador'), deleteRenta);

module.exports = router;
