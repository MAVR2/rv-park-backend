const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  direccion: {
    type: DataTypes.STRING(255)
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'clientes',
  timestamps: false
});

module.exports = Cliente;
