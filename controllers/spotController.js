const { Spot, RvPark, Renta } = require('../models');
const { registrarAuditoria } = require('../middleware/auditoria');

// @desc    Obtener todos los spots
// @route   GET /api/spots
// @access  Private
exports.getSpots = async (req, res) => {
  try {
    const { id_rv_park, estado } = req.query;
    const where = {};

    if (id_rv_park) where.id_rv_park = id_rv_park;
    if (estado) where.estado = estado;

    const spots = await Spot.findAll({
      where,
      include: [{
        model: RvPark,
        as: 'rvPark'
      }]
    });

    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener spots',
      error: error.message
    });
  }
};

// @desc    Obtener un spot por ID
// @route   GET /api/spots/:id
// @access  Private
exports.getSpot = async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id, {
      include: [{
        model: RvPark,
        as: 'rvPark'
      }, {
        model: Renta,
        as: 'rentas'
      }]
    });

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Spot no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener spot',
      error: error.message
    });
  }
};

// @desc    Crear spot
// @route   POST /api/spots
// @access  Private/Admin
exports.createSpot = async (req, res) => {
  try {
    const spot = await Spot.create(req.body);

    await registrarAuditoria(req, 'CREAR_SPOT', 'spots', {
      id: spot.id_spot,
      codigo: spot.codigo_spot
    });

    res.status(201).json({
      success: true,
      data: spot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear spot',
      error: error.message
    });
  }
};

// @desc    Actualizar spot
// @route   PUT /api/spots/:id
// @access  Private
exports.updateSpot = async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id);

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Spot no encontrado'
      });
    }

    // Solo Admin puede cambiar estados manuales (Trabajador, Caliche)
    if (['Trabajador', 'Caliche'].includes(req.body.estado)) {
      if (req.user.rol !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden asignar estados manuales'
        });
      }
    }

    await spot.update({
      ...req.body,
      fecha_actualizacion: new Date()
    });

    await registrarAuditoria(req, 'ACTUALIZAR_SPOT', 'spots', {
      id: spot.id_spot,
      cambios: req.body
    });

    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar spot',
      error: error.message
    });
  }
};

// @desc    Eliminar spot
// @route   DELETE /api/spots/:id
// @access  Private/Admin
exports.deleteSpot = async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id);

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Spot no encontrado'
      });
    }

    await registrarAuditoria(req, 'ELIMINAR_SPOT', 'spots', {
      id: spot.id_spot,
      codigo: spot.codigo_spot
    });

    await spot.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar spot',
      error: error.message
    });
  }
};
