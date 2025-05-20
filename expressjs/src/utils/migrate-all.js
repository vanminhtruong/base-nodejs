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
 * Get all model files from the models directory
 * @returns {Array} Array of model file names without extension
 */
function getAllModelFiles() {
  const files = fs.readdirSync(config.modelsDir);
  return files
    .filter(file => file.endsWith('.model.js'))
    .map(file => file.replace('.model.js', ''));
}

/**
 * Run migrations for all models using the existing migrate.js script
 */
async function migrateAllModels() {
  try {
    const modelFiles = getAllModelFiles();
    console.log(`Found ${modelFiles.length} models to migrate: ${modelFiles.join(', ')}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const modelName of modelFiles) {
      console.log(`\n====== Migrating model: ${modelName} ======`);
      
      // Use dynamic import to directly call the migration function
      try {
        // Import the migrate.js module
        const migrateModule = await import('./migrate.js');
        
        // Call the createMigrationForModel function directly
        console.log(`Running migration for model: ${modelName}`);
        const result = await migrateModule.createMigrationForModel(modelName);
        
        if (result) {
          console.log(`Migration for ${modelName} completed successfully!`);
          successCount++;
        } else {
          console.log(`No changes detected for model ${modelName} or migration failed.`);
        }
      } catch (error) {
        console.error(`Error migrating ${modelName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n====== Migration Summary ======`);
    console.log(`Total models: ${modelFiles.length}`);
    console.log(`Successful migrations: ${successCount}`);
    console.log(`Failed migrations: ${errorCount}`);
    
    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the migration
console.log('Starting automatic migration for all models...\n');
migrateAllModels();
