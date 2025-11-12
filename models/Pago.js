const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_renta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  periodo: {
    type: DataTypes.STRING(20)
  },
  metodo_pago: {
    type: DataTypes.STRING(20)
  },
  referencia: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'pagos',
  timestamps: false
});

module.exports = Pago;
