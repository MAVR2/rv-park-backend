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
  .get( getClientes)
  .post( createCliente);

router
  .route('/:id')
  .get( getCliente)
  .put( updateCliente)
  .delete( authorize('Administrador'), deleteCliente);

module.exports = router;
