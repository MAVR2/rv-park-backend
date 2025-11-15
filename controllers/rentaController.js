const { Renta, Persona, Spot, Pago } = require('../models');
const { sequelize } = require('../config/database');
const { registrarAuditoria } = require('../middleware/auditoria');
const { calcularMontoPrimerPeriodo, calcularDias } = require('../utils/paymentCalculator');

// @desc    Obtener todas las rentas
// @route   GET /api/rentas
// @access  Private
exports.getRentas = async (req, res) => {
  try {
    const { estatus_pago, id_Persona, id_spot } = req.query;
    const where = {};

    if (estatus_pago) where.estatus_pago = estatus_pago;
    if (id_Persona) where.id_Persona = id_Persona;
    if (id_spot) where.id_spot = id_spot;

    const rentas = await Renta.findAll({
      where,
      include: [
        { model: Persona, as: 'Persona' },
        { model: Spot, as: 'spot' },
        { model: Pago, as: 'pagos' }
      ],
      order: [['fecha_inicio', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: rentas.length,
      data: rentas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener rentas',
      error: error.message
    });
  }
};

// @desc    Obtener una renta por ID
// @route   GET /api/rentas/:id
// @access  Private
exports.getRenta = async (req, res) => {
  try {
    const renta = await Renta.findByPk(req.params.id, {
      include: [
        { model: Persona, as: 'Persona' },
        { model: Spot, as: 'spot' },
        { model: Pago, as: 'pagos' }
      ]
    });

    if (!renta) {
      return res.status(404).json({
        success: false,
        message: 'Renta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: renta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener renta',
      error: error.message
    });
  }
};

// @desc    Crear renta (con cálculo automático de pago)
// @route   POST /api/rentas
// @access  Private
exports.createRenta = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id_Persona, id_spot, fecha_inicio, fecha_fin, metodo_pago, observaciones } = req.body;

    // Validar que el spot existe
    const spot = await Spot.findByPk(id_spot);
    if (!spot) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Spot no encontrado'
      });
    }

    // Validar que el spot esté disponible
    if (spot.estado !== 'Disponible') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `El spot no está disponible. Estado actual: ${spot.estado}`
      });
    }

    // Verificar que no hay rentas activas para este spot
    const rentaActiva = await Renta.findOne({
      where: {
        id_spot,
        fecha_fin: null
      }
    });

    if (rentaActiva) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El spot ya tiene una renta activa'
      });
    }

    // Calcular monto del primer periodo (proporcional o completo)
    const calculoPago = calcularMontoPrimerPeriodo(fecha_inicio);
    
    // Calcular días totales si hay fecha_fin
    let total_dias = null;
    if (fecha_fin) {
      total_dias = calcularDias(fecha_inicio, fecha_fin);
    }

    // Crear la renta
    const renta = await Renta.create({
      id_Persona,
      id_spot,
      fecha_inicio,
      fecha_fin,
      total_dias,
      monto_total: calculoPago.monto,
      estatus_pago: 'Pagado', // Se marca como pagado al crear el pago inicial
      metodo_pago,
      observaciones
    }, { transaction: t });

    // Crear el primer pago automáticamente
    await Pago.create({
      id_renta: renta.id_renta,
      fecha_pago: fecha_inicio,
      monto: calculoPago.monto,
      periodo: calculoPago.periodo,
      metodo_pago,
      referencia: `Pago inicial - ${calculoPago.diasRestantes} días de ${calculoPago.ultimoDiaMes}`
    }, { transaction: t });

    // Actualizar estado del spot a "Pagado"
    await spot.update({
      estado: 'Pagado',
      fecha_actualizacion: new Date()
    }, { transaction: t });

    await registrarAuditoria(req, 'CREAR_RENTA', 'rentas', {
      id_renta: renta.id_renta,
      id_Persona,
      id_spot,
      monto: calculoPago.monto,
      periodo: calculoPago.periodo
    });

    await t.commit();

    // Obtener la renta con todas las relaciones
    const rentaCompleta = await Renta.findByPk(renta.id_renta, {
      include: [
        { model: Persona, as: 'Persona' },
        { model: Spot, as: 'spot' },
        { model: Pago, as: 'pagos' }
      ]
    });

    res.status(201).json({
      success: true,
      data: rentaCompleta,
      calculoPago: {
        monto: calculoPago.monto,
        diasRestantes: calculoPago.diasRestantes,
        ultimoDiaMes: calculoPago.ultimoDiaMes,
        periodo: calculoPago.periodo
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Error al crear renta',
      error: error.message
    });
  }
};

// @desc    Actualizar renta
// @route   PUT /api/rentas/:id
// @access  Private
exports.updateRenta = async (req, res) => {
  try {
    const renta = await Renta.findByPk(req.params.id);

    if (!renta) {
      return res.status(404).json({
        success: false,
        message: 'Renta no encontrada'
      });
    }

    // Recalcular días si se actualiza fecha_fin
    if (req.body.fecha_fin) {
      req.body.total_dias = calcularDias(renta.fecha_inicio, req.body.fecha_fin);
    }

    await renta.update(req.body);

    await registrarAuditoria(req, 'ACTUALIZAR_RENTA', 'rentas', {
      id_renta: renta.id_renta,
      cambios: req.body
    });

    // Si se termina la renta (se agrega fecha_fin), actualizar estado del spot
    if (req.body.fecha_fin && !renta.fecha_fin) {
      const spot = await Spot.findByPk(renta.id_spot);
      if (spot && spot.estado === 'Pagado') {
        await spot.update({
          estado: 'Disponible',
          fecha_actualizacion: new Date()
        });
      }
    }

    const rentaActualizada = await Renta.findByPk(renta.id_renta, {
      include: [
        { model: Persona, as: 'Persona' },
        { model: Spot, as: 'spot' },
        { model: Pago, as: 'pagos' }
      ]
    });

    res.status(200).json({
      success: true,
      data: rentaActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar renta',
      error: error.message
    });
  }
};

// @desc    Eliminar renta
// @route   DELETE /api/rentas/:id
// @access  Private/Admin
exports.deleteRenta = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const renta = await Renta.findByPk(req.params.id);

    if (!renta) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Renta no encontrada'
      });
    }

    // Actualizar estado del spot a Disponible
    const spot = await Spot.findByPk(renta.id_spot);
    if (spot && spot.estado === 'Pagado') {
      await spot.update({
        estado: 'Disponible',
        fecha_actualizacion: new Date()
      }, { transaction: t });
    }

    await registrarAuditoria(req, 'ELIMINAR_RENTA', 'rentas', {
      id_renta: renta.id_renta,
      id_spot: renta.id_spot
    });

    await renta.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Error al eliminar renta',
      error: error.message
    });
  }
};
