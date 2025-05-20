require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_data',
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_data',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_data',
    logging: false
  }
};
