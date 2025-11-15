const jwt = require('jsonwebtoken');
const { Usuario, Persona } = require('../models');
const { registrarAuditoria } = require('../middleware/auditoria');

// Generar token JWT
const generarToken = (id_usuario) => {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res) => {
  try {
    const { 
      //datos usuario
      nombre_usuario, 
      password_hash, 
      rol,   
      
      //datos persona
      nombre,
      telefono,
    } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ where: { nombre_usuario } });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está registrado'
      });
    }

    const persona = await Persona.create({
      nombre,
      telefono,
      email: nombre_usuario,
    });


    const usuario = await Usuario.create({
      nombre_usuario,
      password_hash,
      rol,
      id_Persona: persona.id_Persona
    });

    await registrarAuditoria(req, 'CREAR_USUARIO', 'usuarios', {
      usuario_creado: nombre_usuario,
      rol
    });

    res.status(201).json({
      success: true,
      data: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol,
        nombre: persona.nombre,
        telefono: persona.telefono,
        email: persona.email,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
}

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { nombre_usuario, password } = req.body;

    if (!nombre_usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione usuario y contraseña'
      });
    }

    const usuario = await Usuario.findOne({ where: { nombre_usuario},
    include:{
      model: Persona,
      as: 'Persona'
    } });

    if (!usuario || !(await usuario.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    await registrarAuditoria({ user: usuario }, 'LOGIN', 'usuarios', {
      usuario: nombre_usuario
    });

    res.status(200).json({
      success: true,
      data: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        nombre: usuario.Persona.nombre,
        telefono: usuario.Persona.telefono,
        email: usuario.Persona.email,
        rol: usuario.rol,
        id_rv_park: usuario.id_rv_park,
        token: generarToken(usuario.id_usuario)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};


// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id_usuario, {
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message
    });
  }
};
