const { RvPark, Spot } = require('../models');
const { registrarAuditoria } = require('../middleware/auditoria');

// @desc    Obtener todos los RV Parks
// @route   GET /api/rv-parks
// @access  Private
exports.getRvParks = async (req, res) => {
  try {
    const rvParks = await RvPark.findAll({
      include: [{
        model: Spot,
        as: 'spots'
      }]
    });

    res.status(200).json({
      success: true,
      count: rvParks.length,
      data: rvParks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener RV Parks',
      error: error.message
    });
  }
};

// @desc    Obtener un RV Park por ID
// @route   GET /api/rv-parks/:id
// @access  Private
exports.getRvPark = async (req, res) => {
  try {
    const rvPark = await RvPark.findByPk(req.params.id, {
      include: [{
        model: Spot,
        as: 'spots'
      }]
    });

    if (!rvPark) {
      return res.status(404).json({
        success: false,
        message: 'RV Park no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: rvPark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener RV Park',
      error: error.message
    });
  }
};

// @desc    Crear RV Park
// @route   POST /api/rv-parks
// @access  Private/Admin
exports.createRvPark = async (req, res) => {
  try {
    const rvPark = await RvPark.create(req.body);

    await registrarAuditoria(req, 'CREAR_RV_PARK', 'rv_parks', {
      id: rvPark.id_rv_park,
      nombre: rvPark.nombre
    });

    res.status(201).json({
      success: true,
      data: rvPark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear RV Park',
      error: error.message
    });
  }
};

// @desc    Actualizar RV Park
// @route   PUT /api/rv-parks/:id
// @access  Private/Admin
exports.updateRvPark = async (req, res) => {
  try {
    const rvPark = await RvPark.findByPk(req.params.id);

    if (!rvPark) {
      return res.status(404).json({
        success: false,
        message: 'RV Park no encontrado'
      });
    }

    await rvPark.update(req.body);

    await registrarAuditoria(req, 'ACTUALIZAR_RV_PARK', 'rv_parks', {
      id: rvPark.id_rv_park,
      cambios: req.body
    });

    res.status(200).json({
      success: true,
      data: rvPark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar RV Park',
      error: error.message
    });
  }
};

// @desc    Eliminar RV Park
// @route   DELETE /api/rv-parks/:id
// @access  Private/Admin
exports.deleteRvPark = async (req, res) => {
  try {
    const rvPark = await RvPark.findByPk(req.params.id);

    if (!rvPark) {
      return res.status(404).json({
        success: false,
        message: 'RV Park no encontrado'
      });
    }

    await registrarAuditoria(req, 'ELIMINAR_RV_PARK', 'rv_parks', {
      id: rvPark.id_rv_park,
      nombre: rvPark.nombre
    });

    await rvPark.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar RV Park',
      error: error.message
    });
  }
};
