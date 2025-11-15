const RvPark = require('./RvPark');
const Spot = require('./Spot');
const Persona = require('./Persona');
const Renta = require('./Renta');
const Pago = require('./Pago');
const Usuario = require('./Usuario');
const Auditoria = require('./Auditoria');

// Relaciones

// RvPark -> Spots
RvPark.hasMany(Spot, {
  foreignKey: 'id_rv_park',
  as: 'spots'
});
Spot.belongsTo(RvPark, {
  foreignKey: 'id_rv_park',
  as: 'rvPark'
});

// RvPark -> Usuarios
RvPark.hasMany(Usuario, {
  foreignKey: 'id_rv_park',
  as: 'usuarios'
});
Usuario.belongsTo(RvPark, {
  foreignKey: 'id_rv_park',
  as: 'rvPark'
});

// Persona -> Rentas
Persona.hasMany(Renta, {
  foreignKey: 'id_Persona',
  as: 'rentas'
});
Renta.belongsTo(Persona, {
  foreignKey: 'id_Persona',
  as: 'Persona'
});

//Persona-> usuario
Persona.hasOne(Usuario, {
  foreignKey: 'id_Persona',
  as: 'usuario'
});
Usuario.belongsTo(Persona, {
  foreignKey: 'id_Persona',
  as: 'Persona'
});


// Spot -> Rentas
Spot.hasMany(Renta, {
  foreignKey: 'id_spot',
  as: 'rentas'
});
Renta.belongsTo(Spot, {
  foreignKey: 'id_spot',
  as: 'spot'
});

// Renta -> Pagos
Renta.hasMany(Pago, {
  foreignKey: 'id_renta',
  as: 'pagos'
});
Pago.belongsTo(Renta, {
  foreignKey: 'id_renta',
  as: 'renta'
});

// Usuario -> Auditoría
Usuario.hasMany(Auditoria, {
  foreignKey: 'id_usuario',
  as: 'auditorias'
});
Auditoria.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

module.exports = {
  RvPark,
  Spot,
  Persona,
  Renta,
  Pago,
  Usuario,
  Auditoria
};
