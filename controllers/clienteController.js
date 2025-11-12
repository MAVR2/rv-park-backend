const { Cliente, Renta, Usuario } = require('../models');
const { registrarAuditoria } = require('../middleware/auditoria');
const { sequelize } = require('../config/database');

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [{
        model: Renta,
        as: 'rentas'
      }]
    });

    res.status(200).json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/clientes/:id
// @access  Private
exports.getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [{
        model: Renta,
        as: 'rentas'
      }]
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
};

// @desc    Crear cliente
// @route   POST /api/clientes
// @access  Private
exports.createCliente = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, telefono, email, direccion, nombre_usuario, password_hash, rol } = req.body;
    const cliente = await Cliente.create({
      nombre,
      telefono,
      email,
      direccion
    },
      { transaction: t }
    );
    const usuario = await Usuario.create({
      id_cliente: cliente.id_cliente,
      nombre_usuario,
      password_hash,
      rol: rol || 'Cliente'
    },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      success: true,
      data: {
        cliente,
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
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
exports.updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await cliente.update(req.body);

    await registrarAuditoria(req, 'ACTUALIZAR_CLIENTE', 'clientes', {
      id: cliente.id_cliente,
      cambios: req.body
    });

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

// @desc    Eliminar cliente
// @route   DELETE /api/clientes/:id
// @access  Private/Admin
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await registrarAuditoria(req, 'ELIMINAR_CLIENTE', 'clientes', {
      id: cliente.id_cliente,
      nombre: cliente.nombre
    });

    await cliente.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};
