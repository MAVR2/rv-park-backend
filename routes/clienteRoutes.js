const express = require('express');
const {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente
} = require('../controllers/clienteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getClientes)
  .post(protect, createCliente);

router
  .route('/:id')
  .get(protect, getCliente)
  .put(protect, updateCliente)
  .delete(protect, authorize('Administrador'), deleteCliente);

module.exports = router;
