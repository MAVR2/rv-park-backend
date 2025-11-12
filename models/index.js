const RvPark = require('./RvPark');
const Spot = require('./Spot');
const Cliente = require('./Cliente');
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

// Cliente -> Rentas
Cliente.hasMany(Renta, {
  foreignKey: 'id_cliente',
  as: 'rentas'
});
Renta.belongsTo(Cliente, {
  foreignKey: 'id_cliente',
  as: 'cliente'
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
  Cliente,
  Renta,
  Pago,
  Usuario,
  Auditoria
};
