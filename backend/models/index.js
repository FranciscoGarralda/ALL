const sequelize = require('../config/database');
const User = require('./User');
const Movement = require('./Movement');
const Client = require('./Client');

// Definir asociaciones
User.hasMany(Movement, { foreignKey: 'userId', as: 'movements' });
Movement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Client, { foreignKey: 'userId', as: 'clients' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Movement,
  Client
};