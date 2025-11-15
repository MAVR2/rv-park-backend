const express = require('express');


const {
  getPersonas,
  getPersona,
  createPersona,
  updatePersona,
  deletePersona
} = require('../controllers/clienteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get( getPersonas)
  .post( createPersona);

router
  .route('/:id')
  .get( getPersona)
  .put( updatePersona)
  .delete( authorize('Administrador'), deletePersona);

module.exports = router;
