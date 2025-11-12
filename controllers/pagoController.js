const { Pago, Renta, Spot } = require('../models');
const { sequelize } = require('../config/database');
const { registrarAuditoria } = require('../middleware/auditoria');
const { obtenerPeriodo } = require('../utils/paymentCalculator');

// @desc    Obtener todos los pagos
// @route   GET /api/pagos
// @access  Private
exports.getPagos = async (req, res) => {
  try {
    const { id_renta, periodo } = req.query;
    const where = {};

    if (id_renta) where.id_renta = id_renta;
    if (periodo) where.periodo = periodo;

    const pagos = await Pago.findAll({
      where,
      include: [{
        model: Renta,
        as: 'renta'
      }],
      order: [['fecha_pago', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: pagos.length,
      data: pagos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message
    });
  }
};

// @desc    Obtener un pago por ID
// @route   GET /api/pagos/:id
// @access  Private
exports.getPago = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id, {
      include: [{
        model: Renta,
        as: 'renta'
      }]
    });

    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: pago
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pago',
      error: error.message
    });
  }
};

// @desc    Registrar pago mensual
// @route   POST /api/pagos
// @access  Private
exports.createPago = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id_renta, fecha_pago, monto, metodo_pago, referencia } = req.body;

    // Validar que la renta existe
    const renta = await Renta.findByPk(id_renta, {
      include: [{
        model: Spot,
        as: 'spot'
      }]
    });

    if (!renta) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Renta no encontrada'
      });
    }

    // Validar que la renta esté activa (sin fecha_fin o fecha_fin futura)
    if (renta.fecha_fin && new Date(renta.fecha_fin) < new Date()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede registrar pago para una renta finalizada'
      });
    }

    // Calcular periodo del pago
    const periodo = obtenerPeriodo(fecha_pago);

    // Verificar que no existe pago duplicado para el mismo periodo
    const pagoExistente = await Pago.findOne({
      where: {
        id_renta,
        periodo
      }
    });

    if (pagoExistente) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Ya existe un pago registrado para el periodo ${periodo}`
      });
    }

    // Usar monto de la tarifa mensual por defecto si no se proporciona
    const montoPago = monto || parseFloat(process.env.MONTHLY_RATE || 1200);

    // Crear el pago
    const pago = await Pago.create({
      id_renta,
      fecha_pago,
      monto: montoPago,
      periodo,
      metodo_pago,
      referencia: referencia || `Pago mensual - ${periodo}`
    }, { transaction: t });

    // Actualizar estatus de pago de la renta a "Pagado"
    await renta.update({
      estatus_pago: 'Pagado'
    }, { transaction: t });

    // Si el spot no está en estado "Pagado", actualizarlo
    if (renta.spot && renta.spot.estado !== 'Pagado') {
      await renta.spot.update({
        estado: 'Pagado',
        fecha_actualizacion: new Date()
      }, { transaction: t });
    }

    await registrarAuditoria(req, 'REGISTRAR_PAGO', 'pagos', {
      id_pago: pago.id_pago,
      id_renta,
      monto: montoPago,
      periodo
    });

    await t.commit();

    const pagoCompleto = await Pago.findByPk(pago.id_pago, {
      include: [{
        model: Renta,
        as: 'renta',
        include: [{
          model: Spot,
          as: 'spot'
        }]
      }]
    });

    res.status(201).json({
      success: true,
      data: pagoCompleto
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago',
      error: error.message
    });
  }
};

// @desc    Actualizar pago
// @route   PUT /api/pagos/:id
// @access  Private/Admin
exports.updatePago = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);

    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    await pago.update(req.body);

    await registrarAuditoria(req, 'ACTUALIZAR_PAGO', 'pagos', {
      id_pago: pago.id_pago,
      cambios: req.body
    });

    res.status(200).json({
      success: true,
      data: pago
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar pago',
      error: error.message
    });
  }
};

// @desc    Eliminar pago
// @route   DELETE /api/pagos/:id
// @access  Private/Admin
exports.deletePago = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const pago = await Pago.findByPk(req.params.id);

    if (!pago) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Verificar si hay otros pagos para la misma renta
    const otrosPagos = await Pago.count({
      where: {
        id_renta: pago.id_renta
      }
    });

    // Si es el único pago, actualizar estatus de renta a Pendiente
    if (otrosPagos === 1) {
      const renta = await Renta.findByPk(pago.id_renta);
      if (renta) {
        await renta.update({
          estatus_pago: 'Pendiente'
        }, { transaction: t });
      }
    }

    await registrarAuditoria(req, 'ELIMINAR_PAGO', 'pagos', {
      id_pago: pago.id_pago,
      id_renta: pago.id_renta,
      periodo: pago.periodo
    });

    await pago.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Error al eliminar pago',
      error: error.message
    });
  }
};
