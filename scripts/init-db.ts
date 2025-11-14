/**
 * Database Initialization Script
 * Run with: tsx scripts/init-db.ts
 */

import { initializeDatabase } from '../server/database/connection';
import { seedDatabase } from '../server/database/seed';

console.log('🚀 Initializing database...\n');

try {
	// Initialize schema
	initializeDatabase();

	// Seed data
	seedDatabase();

	console.log('\n✅ Database initialization complete!');
	process.exit(0);
} catch (error) {
	console.error('❌ Database initialization failed:', error);
	process.exit(1);
}
