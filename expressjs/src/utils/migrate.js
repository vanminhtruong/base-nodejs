import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { exec } from 'child_process';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  modelsDir: path.resolve(__dirname, '../models'),
  migrationsDir: path.resolve(__dirname, '../database/migrations'),
  dbConfig: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  }
};

/**
 * Generate a migration file name with timestamp
 */
function generateMigrationFileName(modelName) {
  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '')
    .split('.')[0];
  return `${timestamp}-${modelName.toLowerCase()}.js`;
}

/**
 * Create migration file for a model
 */
async function createMigrationForModel(modelName) {
  try {
    // Connect to the database
    const sequelize = new Sequelize(config.dbConfig);
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Import the model
    const modelPath = path.join(config.modelsDir, `${modelName}.model.js`);
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model file ${modelPath} not found`);
    }
    
    const modelModule = await import(`file://${modelPath}`);
    const model = modelModule.default;
    
    if (!model || !model.tableName) {
      throw new Error(`Model ${modelName} is not properly defined or exported`);
    }
    
    // Get table name and model attributes
    const tableName = model.tableName;
    const attributes = {};
    
    // Convert model attributes to migration format
    for (const [name, def] of Object.entries(model.rawAttributes)) {
      // Skip Sequelize internal fields
      if (['createdAt', 'updatedAt'].includes(name) && !def.primaryKey) {
        continue;
      }
      
      let type = def.type.key;
      
      // Handle special types
      if (type === 'STRING' && def.type._length) {
        type = `STRING(${def.type._length})`;
      }
      
      attributes[name] = {
        type,
        allowNull: def.allowNull !== false,
        primaryKey: !!def.primaryKey,
        autoIncrement: !!def.autoIncrement,
        unique: !!def.unique,
        defaultValue: def.defaultValue
      };
    }
    
    // Check if table exists in database
    const tableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes(tableName));
    
    let migrationContent;
    let migrationType;
    
    if (!tableExists) {
      // Table doesn't exist, generate a create table migration
      migrationType = 'create';
      migrationContent = `// Create table migration for ${tableName}

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('${tableName}', {
    ${Object.entries(attributes).map(([name, attr]) => {
      return `${name}: {
      type: Sequelize.${attr.type},
      allowNull: ${attr.allowNull},
      ${attr.primaryKey ? 'primaryKey: true,' : ''}
      ${attr.autoIncrement ? 'autoIncrement: true,' : ''}
      ${attr.unique ? 'unique: true,' : ''}
      ${attr.defaultValue !== undefined ? `defaultValue: ${JSON.stringify(attr.defaultValue)},` : ''}
    }`;
    }).join(',\n    ')},
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('${tableName}');
};
`;
    } else {
      // Table exists, generate an alter table migration
      // Get table schema from database
      const tableInfo = await sequelize.getQueryInterface().describeTable(tableName);
      
      // Compare model with database schema
      const addedColumns = {};
      const changedColumns = {};
      const removedColumns = [];
      
      // Check for added or modified columns
      for (const [columnName, columnDef] of Object.entries(attributes)) {
        const dbColumn = tableInfo[columnName];
        
        if (!dbColumn) {
          // Column doesn't exist in database, it's a new column
          addedColumns[columnName] = columnDef;
        } else {
          // Column exists, check if it has changed
          let hasChanged = false;
          
          // Check type changes (simple comparison, might need refinement)
          if (columnDef.type.toUpperCase() !== dbColumn.type.toUpperCase()) {
            hasChanged = true;
          }
          
          // Check allowNull changes
          if (columnDef.allowNull !== dbColumn.allowNull) {
            hasChanged = true;
          }
          
          // Check unique constraint changes
          if (!!columnDef.unique !== !!dbColumn.unique) {
            hasChanged = true;
          }
          
          // If column has changed, add it to changes
          if (hasChanged) {
            changedColumns[columnName] = {
              ...columnDef,
              original: {
                type: dbColumn.type.toUpperCase(),
                allowNull: dbColumn.allowNull,
                unique: !!dbColumn.unique,
                defaultValue: dbColumn.defaultValue
              }
            };
          }
        }
      }
      
      // Check for removed columns
      for (const [columnName, columnDef] of Object.entries(tableInfo)) {
        // Skip if it's the Sequelize internal fields
        if (['createdAt', 'updatedAt'].includes(columnName)) {
          continue;
        }
        
        if (!attributes[columnName]) {
          // Column exists in database but not in model, it's been removed
          removedColumns.push({
            name: columnName,
            type: columnDef.type.toUpperCase(),
            allowNull: columnDef.allowNull,
            unique: !!columnDef.unique,
            defaultValue: columnDef.defaultValue
          });
        }
      }
      
      // Check if there are any changes
      const hasChanges = (
        Object.keys(addedColumns).length > 0 ||
        Object.keys(changedColumns).length > 0 ||
        removedColumns.length > 0
      );
      
      if (!hasChanges) {
        console.log(`No changes detected for model ${modelName}`);
        await sequelize.close();
        return null;
      }
      
      // Generate migration for changes
      migrationType = 'alter';
      
      // Build up operations
      const upOperations = [];
      const downOperations = [];
      
      // Handle added columns
      if (Object.keys(addedColumns).length > 0) {
        for (const [columnName, columnDef] of Object.entries(addedColumns)) {
          upOperations.push(`  await queryInterface.addColumn('${tableName}', '${columnName}', {
    type: Sequelize.${columnDef.type},
    allowNull: ${columnDef.allowNull},
    ${columnDef.primaryKey ? 'primaryKey: true,' : ''}
    ${columnDef.autoIncrement ? 'autoIncrement: true,' : ''}
    ${columnDef.unique ? 'unique: true,' : ''}
    ${columnDef.defaultValue !== undefined ? `defaultValue: ${JSON.stringify(columnDef.defaultValue)},` : ''}
  });`);
          
          downOperations.push(`  await queryInterface.removeColumn('${tableName}', '${columnName}');`);
        }
      }
      
      // Handle changed columns
      if (Object.keys(changedColumns).length > 0) {
        for (const [columnName, columnDef] of Object.entries(changedColumns)) {
          upOperations.push(`  await queryInterface.changeColumn('${tableName}', '${columnName}', {
    type: Sequelize.${columnDef.type},
    allowNull: ${columnDef.allowNull},
    ${columnDef.primaryKey ? 'primaryKey: true,' : ''}
    ${columnDef.autoIncrement ? 'autoIncrement: true,' : ''}
    ${columnDef.unique ? 'unique: true,' : ''}
    ${columnDef.defaultValue !== undefined ? `defaultValue: ${JSON.stringify(columnDef.defaultValue)},` : ''}
  });`);
          
          // For down migration, we need the original column definition
          if (columnDef.original) {
            downOperations.push(`  await queryInterface.changeColumn('${tableName}', '${columnName}', {
    type: Sequelize.${columnDef.original.type},
    allowNull: ${columnDef.original.allowNull},
    ${columnDef.original.unique ? 'unique: true,' : ''}
    ${columnDef.original.defaultValue !== undefined ? `defaultValue: ${JSON.stringify(columnDef.original.defaultValue)},` : ''}
  });`);
          }
        }
      }
      
      // Handle removed columns
      if (removedColumns.length > 0) {
        for (const column of removedColumns) {
          upOperations.push(`  await queryInterface.removeColumn('${tableName}', '${column.name}');`);
          
          downOperations.push(`  await queryInterface.addColumn('${tableName}', '${column.name}', {
    type: Sequelize.${column.type},
    allowNull: ${column.allowNull},
    ${column.unique ? 'unique: true,' : ''}
    ${column.defaultValue !== undefined ? `defaultValue: ${JSON.stringify(column.defaultValue)},` : ''}
  });`);
        }
      }
      
      // Generate migration content
      migrationContent = `// Alter table migration for ${tableName}

export const up = async (queryInterface, Sequelize) => {
${upOperations.join('\n\n')}
};

export const down = async (queryInterface, Sequelize) => {
${downOperations.join('\n\n')}
};
`;
    }
    
    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(config.migrationsDir)) {
      fs.mkdirSync(config.migrationsDir, { recursive: true });
    }
    
    // Write migration file
    const migrationFileName = generateMigrationFileName(`${migrationType}-${modelName}`);
    const migrationPath = path.join(config.migrationsDir, migrationFileName);
    fs.writeFileSync(migrationPath, migrationContent);
    
    console.log(`Migration file created: ${migrationFileName}`);
    
    // Apply the migration directly
    console.log('\nApplying migration...');
    
    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`CREATE TABLE IF NOT EXISTS SequelizeMeta (name VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY);`);
    
    // Check if migration is already in SequelizeMeta
    const [results] = await sequelize.query(`SELECT name FROM SequelizeMeta WHERE name = '${migrationFileName}';`);
    
    if (results.length === 0) {
      // Import the migration module
      const migrationModule = await import(`file://${migrationPath}`);
      
      // Execute up migration
      await migrationModule.up(sequelize.getQueryInterface(), Sequelize);
      
      // Record migration in SequelizeMeta
      await sequelize.query(`INSERT INTO SequelizeMeta (name) VALUES ('${migrationFileName}');`);
      
      console.log(`Migration ${migrationFileName} applied successfully.`);
    } else {
      console.log(`Migration ${migrationFileName} already applied.`);
    }
    
    // Close database connection
    await sequelize.close();
    
    return migrationFileName;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Get model name from command line arguments
const modelName = process.argv[2];

if (!modelName) {
  console.error('Please provide a model name');
  process.exit(1);
}

// Run the migration
console.log(`Generating and applying migration for model: ${modelName}\n`);

createMigrationForModel(modelName).then(result => {
  if (result) {
    console.log('\nMigration completed successfully!');
  } else {
    console.error('\nMigration failed or no changes detected.');
    process.exit(1);
  }
});
