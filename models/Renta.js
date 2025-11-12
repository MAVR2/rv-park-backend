const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Renta = sequelize.define('Renta', {
  id_renta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_spot: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY
  },
  total_dias: {
    type: DataTypes.INTEGER
  },
  monto_total: {
    type: DataTypes.DECIMAL(10, 2)
  },
  estatus_pago: {
    type: DataTypes.ENUM('Pagado', 'Pendiente'),
    defaultValue: 'Pendiente'
  },
  metodo_pago: {
    type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Tarjeta'),
    defaultValue: 'Efectivo'
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'rentas',
  timestamps: false
});

module.exports = Renta;
