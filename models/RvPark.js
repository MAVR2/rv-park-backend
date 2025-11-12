const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RvPark = sequelize.define('RvPark', {
  id_rv_park: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(255)
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'rv_parks',
  timestamps: false
});

module.exports = RvPark;
