/**
 * Initialize Database
 * Run this to seed the database with initial data
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🌱 Initializing database...\n');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../server/database');
if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'game.db');

// Create database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ Database file created at:', dbPath);
console.log('\n📦 Please run the dev server (pnpm dev) to seed the database automatically.\n');
console.log('   The seeding happens on first server start.\n');

db.close();
