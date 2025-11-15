const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Persona = sequelize.define('Persona', {
  id_Persona: {
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
  vehiculo: {
    type: DataTypes.ENUM('Carga', 'Maquinaria', 'Caravana'),
    defaultValue: 'Caravana'
  },
  direccion: {
    type: DataTypes.STRING(255)
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
  
}, {
  tableName: 'persona',
  timestamps: false
});

module.exports = Persona;
