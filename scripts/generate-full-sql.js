#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../packages/database/prisma/migrations');
const outputFile = path.join(__dirname, '../full-database-schema.sql');

// Get all migration directories, sorted by name (timestamp)
const migrations = fs.readdirSync(migrationsDir)
  .filter(dir => {
    const dirPath = path.join(migrationsDir, dir);
    return fs.statSync(dirPath).isDirectory() && dir !== 'migration_lock.toml';
  })
  .sort();

console.log(`Found ${migrations.length} migrations`);

let fullSQL = `-- Complete Database Schema for Rallly
-- Generated from Prisma migrations
-- Run this SQL script in your Supabase SQL Editor
-- 
-- Note: This includes all migrations in order.
-- Make sure you're running this on an empty database.

`;

migrations.forEach((migration, index) => {
  const migrationSQL = path.join(migrationsDir, migration, 'migration.sql');
  if (fs.existsSync(migrationSQL)) {
    const sql = fs.readFileSync(migrationSQL, 'utf8');
    fullSQL += `\n-- Migration ${index + 1}: ${migration}\n`;
    fullSQL += sql;
    fullSQL += '\n\n';
  }
});

fs.writeFileSync(outputFile, fullSQL);
console.log(`✅ Generated ${outputFile}`);
console.log(`📝 Total migrations: ${migrations.length}`);
console.log(`📊 File size: ${(fullSQL.length / 1024).toFixed(2)} KB`);
console.log(`\nYou can now copy the contents of ${outputFile} and paste it into Supabase SQL Editor.`);
