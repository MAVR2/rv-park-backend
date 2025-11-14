const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authorize('Administrador'), register);
router.post('/login', login);
router.get('/me', getMe);

module.exports = router;
