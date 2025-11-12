const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API disponible en: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
