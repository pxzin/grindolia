"use strict";
/**
 * Database Connection Setup
 * Uses better-sqlite3 with WAL mode for concurrent reads
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
exports.runMigrations = runMigrations;
exports.closeDatabase = closeDatabase;
exports.transaction = transaction;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = require("fs");
const path_1 = require("path");
const schema_1 = require("./schema");
const DATABASE_PATH = process.env.DATABASE_PATH || './database/grindolia.db';
let db = null;
/**
 * Get or create database connection
 */
function getDatabase() {
    if (db) {
        return db;
    }
    // Create database connection
    db = new better_sqlite3_1.default(DATABASE_PATH, {
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
function initializeDatabase() {
    const database = getDatabase();
    // Create tables
    database.exec(schema_1.createTablesSQL);
    // Create indexes
    database.exec(schema_1.createIndexesSQL);
    console.log('✅ Database schema initialized');
}
/**
 * Run migrations
 */
function runMigrations() {
    const database = getDatabase();
    try {
        // Read and execute initial migration
        const migrationPath = (0, path_1.join)(process.cwd(), 'server/database/migrations/001_initial_schema.sql');
        const migrationSQL = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
        database.exec(migrationSQL);
        console.log('✅ Database migrations completed');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
/**
 * Close database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('✅ Database connection closed');
    }
}
/**
 * Execute a transaction
 */
function transaction(fn) {
    const database = getDatabase();
    const transactionFn = database.transaction(fn);
    return transactionFn(database);
}
// Initialize database on module load in development
if (process.env.NODE_ENV === 'development') {
    initializeDatabase();
}
