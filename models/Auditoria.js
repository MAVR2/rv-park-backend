const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
  id_auditoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER
  },
  accion: {
    type: DataTypes.STRING(100)
  },
  tabla_afectada: {
    type: DataTypes.STRING(50)
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  detalle: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'auditoria',
  timestamps: false
});

module.exports = Auditoria;
