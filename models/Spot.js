const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Spot = sequelize.define('Spot', {
  id_spot: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_rv_park: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  codigo_spot: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Disponible', 'Pagado', 'Trabajador', 'Caliche'),
    defaultValue: 'Disponible'
  },
  color_estado: {
    type: DataTypes.STRING(20)
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'spots',
  timestamps: false
});

module.exports = Spot;
