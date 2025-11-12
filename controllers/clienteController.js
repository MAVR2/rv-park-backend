const { Cliente, Renta } = require('../models');
const { registrarAuditoria } = require('../middleware/auditoria');

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
  try {
    const cliente = await Cliente.create(req.body);

    await registrarAuditoria(req, 'CREAR_CLIENTE', 'clientes', {
      id: cliente.id_cliente,
      nombre: cliente.nombre
    });

    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
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
