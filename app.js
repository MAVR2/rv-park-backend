const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importar modelos para establecer relaciones
require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const rvParkRoutes = require('./routes/rvParkRoutes');
const spotRoutes = require('./routes/spotRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const rentaRoutes = require('./routes/rentaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/rv-parks', rvParkRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/rentas', rentaRoutes);
app.use('/api/pagos', pagoRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RV Park System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      rvParks: '/api/rv-parks',
      spots: '/api/spots',
      clientes: '/api/clientes',
      rentas: '/api/rentas',
      pagos: '/api/pagos'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
