const { Persona, Renta, Usuario } = require('../models');
const { registrarAuditoria } = require('../middleware/auditoria');
const { sequelize } = require('../config/database');

// @desc    Obtener todos los Personas
// @route   GET /api/Personas
// @access  Private
exports.getPersonas = async (req, res) => {
  try {
    const Personas = await Persona.findAll({
      include: [{
        model: Renta,
        as: 'rentas'
      }]
    });

    res.status(200).json({
      success: true,
      count: Personas.length,
      data: Personas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener Personas',
      error: error.message
    });
  }
};

// @desc    Obtener un Persona por ID
// @route   GET /api/Personas/:id
// @access  Private
exports.getPersona = async (req, res) => {
  try {
    const Persona = await Persona.findByPk(req.params.id, {
      include: [{
        model: Renta,
        as: 'rentas'
      }]
    });

    if (!Persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: Persona
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener Persona',
      error: error.message
    });
  }
};

// @desc    Crear Persona
// @route   POST /api/Personas
// @access  Private
exports.createPersona = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, telefono, email, direccion, nombre_usuario, password_hash, rol } = req.body;
    const Persona = await Persona.create({
      nombre,
      telefono,
      email,
      direccion
    },
      { transaction: t }
    );
    const usuario = await Usuario.create({
      id_Persona: Persona.id_Persona,
      nombre_usuario,
      password_hash,
      rol: rol || 'Persona'
    },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      success: true,
      data: {
        Persona,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          rol: usuario.rol
        }
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Error al crear Persona',
      error: error.message
    });
  }
};

// @desc    Actualizar Persona
// @route   PUT /api/Personas/:id
// @access  Private
exports.updatePersona = async (req, res) => {
  try {
    const Persona = await Persona.findByPk(req.params.id);

    if (!Persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrado'
      });
    }

    await Persona.update(req.body);

    await registrarAuditoria(req, 'ACTUALIZAR_Persona', 'Personas', {
      id: Persona.id_Persona,
      cambios: req.body
    });

    res.status(200).json({
      success: true,
      data: Persona
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar Persona',
      error: error.message
    });
  }
};

// @desc    Eliminar Persona
// @route   DELETE /api/Personas/:id
// @access  Private/Admin
exports.deletePersona = async (req, res) => {
  try {
    const Persona = await Persona.findByPk(req.params.id);

    if (!Persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrado'
      });
    }

    await registrarAuditoria(req, 'ELIMINAR_Persona', 'Personas', {
      id: Persona.id_Persona,
      nombre: Persona.nombre
    });

    await Persona.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar Persona',
      error: error.message
    });
  }
};
