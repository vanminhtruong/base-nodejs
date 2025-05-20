const path = require('path');

module.exports = {
  'config': path.resolve('src/config', 'sequelize-cli.config.cjs'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src/database', 'seeders'),
  'migrations-path': path.resolve('src/database', 'migrations')
};
