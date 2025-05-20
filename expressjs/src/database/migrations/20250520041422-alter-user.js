// Alter table migration for users

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('users', 'username', {
    type: Sequelize.STRING(255),
    allowNull: false,
    
    
    unique: true,
    
  });

  await queryInterface.changeColumn('users', 'email', {
    type: Sequelize.STRING(255),
    allowNull: false,
    
    
    unique: true,
    
  });

  await queryInterface.changeColumn('users', 'password', {
    type: Sequelize.STRING(255),
    allowNull: false,
    
    
    
    
  });

  await queryInterface.changeColumn('users', 'roles', {
    type: Sequelize.STRING(255),
    allowNull: false,
    
    
    
    defaultValue: "user",
  });

  await queryInterface.changeColumn('users', 'refreshToken', {
    type: Sequelize.STRING(255),
    allowNull: true,
    
    
    
    
  });

  await queryInterface.changeColumn('users', 'isActive', {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    
    
    
    defaultValue: true,
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('users', 'username', {
    type: Sequelize.VARCHAR(255),
    allowNull: false,
    unique: true,
    
  });

  await queryInterface.changeColumn('users', 'email', {
    type: Sequelize.VARCHAR(255),
    allowNull: false,
    unique: true,
    
  });

  await queryInterface.changeColumn('users', 'password', {
    type: Sequelize.VARCHAR(255),
    allowNull: false,
    
    
  });

  await queryInterface.changeColumn('users', 'roles', {
    type: Sequelize.VARCHAR(255),
    allowNull: false,
    
    defaultValue: "user",
  });

  await queryInterface.changeColumn('users', 'refreshToken', {
    type: Sequelize.VARCHAR(255),
    allowNull: true,
    
    
  });

  await queryInterface.changeColumn('users', 'isActive', {
    type: Sequelize.TINYINT(1),
    allowNull: true,
    
    defaultValue: true,
  });
};
