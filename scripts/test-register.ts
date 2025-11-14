/**
 * Test Registration
 */

import { PlayerRepository } from '../server/database/repositories/player';
import { hashPassword } from '../server/utils/crypto';

async function testRegistration() {
	console.log('🧪 Testing registration...\n');

	try {
		const playerRepo = new PlayerRepository();

		// Test email check
		console.log('1. Testing email existence check...');
		const emailExists = playerRepo.emailExists('test@example.com');
		console.log(`   Email exists: ${emailExists}`);

		// Hash password
		console.log('\n2. Hashing password...');
		const password_hash = await hashPassword('Test123!');
		console.log(`   Hash length: ${password_hash.length}`);

		// Create player
		console.log('\n3. Creating player...');
		const player = playerRepo.create({
			email: 'test@example.com',
			username: 'testuser',
			password_hash,
			preferred_locale: 'en'
		});

		console.log(`   ✅ Player created:`, {
			id: player.id,
			email: player.email,
			username: player.username,
			created_at: player.created_at
		});

		console.log('\n✅ Registration test complete!');
	} catch (error) {
		console.error('❌ Registration test failed:', error);
		throw error;
	}
}

testRegistration().catch(() => process.exit(1));
