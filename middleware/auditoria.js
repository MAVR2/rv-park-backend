const { Auditoria } = require('../models');

// Registrar acción en auditoría
exports.registrarAuditoria = async (req, accion, tabla_afectada, detalle) => {
  try {
    await Auditoria.create({
      id_usuario: req.user?.id_usuario || null,
      accion,
      tabla_afectada,
      detalle: JSON.stringify(detalle)
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
};
