const User = require('./User');
const Movement = require('./Movement');
const Client = require('./Client');

// Definir relaciones
User.hasMany(Movement, { foreignKey: 'userId' });
Movement.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Client, { foreignKey: 'userId' });
Client.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Movement,
  Client
};