/**
 * Database Connection Setup
 * Uses better-sqlite3 with WAL mode for concurrent reads
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createTablesSQL, createIndexesSQL } from './schema';

const DATABASE_PATH = process.env.DATABASE_PATH || './database/grindolia.db';

let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
export function getDatabase(): Database.Database {
	if (db) {
		return db;
	}

	// Create database connection
	db = new Database(DATABASE_PATH, {
		verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
	});

	// Enable WAL mode for concurrent reads
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	return db;
}

/**
 * Initialize database schema
 */
export function initializeDatabase(): void {
	const database = getDatabase();

	// Create tables
	database.exec(createTablesSQL);

	// Create indexes
	database.exec(createIndexesSQL);

	console.log('✅ Database schema initialized');
}

/**
 * Run migrations
 */
export function runMigrations(): void {
	const database = getDatabase();

	try {
		// Read and execute initial migration
		const migrationPath = join(process.cwd(), 'server/database/migrations/001_initial_schema.sql');
		const migrationSQL = readFileSync(migrationPath, 'utf-8');

		database.exec(migrationSQL);

		console.log('✅ Database migrations completed');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	}
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
	if (db) {
		db.close();
		db = null;
		console.log('✅ Database connection closed');
	}
}

/**
 * Execute a transaction
 */
export function transaction<T>(fn: (db: Database.Database) => T): T {
	const database = getDatabase();
	const transactionFn = database.transaction(fn);
	return transactionFn(database);
}

// Initialize database on module load in development
if (process.env.NODE_ENV === 'development') {
	initializeDatabase();
}
