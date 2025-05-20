import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  roles: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    get() {
      const rawValue = this.getDataValue('roles');
      return rawValue ? rawValue.split(',') : ['user'];
    },
    set(value) {
      const rolesArray = Array.isArray(value) ? value : [value];
      this.setDataValue('roles', rolesArray.join(','));
    }
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password', 'refreshToken'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    },
    withRefreshToken: {
      attributes: { include: ['refreshToken'] }
    },
    withAll: {
      attributes: { include: ['password', 'refreshToken'] }
    }
  }
});

export default User;
