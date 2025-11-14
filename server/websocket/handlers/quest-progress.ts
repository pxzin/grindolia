/**
 * Quest Progress WebSocket Handler
 * Handles real-time quest progress updates
 */

import type { WebSocketMessage } from '../../../src/lib/types/websocket';
import type { WebSocketConnection } from '../server';
import { updateProgress } from '../../game/quest/manager';
import { getCharacterQuestById } from '../../database/repositories/character-quest';
import { CharacterRepository } from '../../database/repositories/character';
import { getDatabase } from '../../database/connection';

export interface QuestProgressPayload {
	characterQuestId: number;
	objectiveType: string;
	target: string;
	amount?: number;
}

/**
 * Handle quest progress update
 */
export async function handleQuestProgress(
	connection: WebSocketConnection,
	message: WebSocketMessage
): Promise<void> {
	try {
		const payload = message.payload as QuestProgressPayload;
		const { characterQuestId, objectiveType, target, amount = 1 } = payload;

		// Validate payload
		if (!characterQuestId || !objectiveType || !target) {
			if (connection.ws.readyState === 1) {
				connection.ws.send(
					JSON.stringify({
						type: 'quest:progress:error',
						timestamp: Date.now(),
						payload: { error: 'Invalid quest progress data' }
					})
				);
			}
			return;
		}

		// Get character quest
		const characterQuest = getCharacterQuestById(characterQuestId);

		if (!characterQuest) {
			if (connection.ws.readyState === 1) {
				connection.ws.send(
					JSON.stringify({
						type: 'quest:progress:error',
						timestamp: Date.now(),
						payload: { error: 'Quest not found' }
					})
				);
			}
			return;
		}

		// Get character and verify ownership
		const db = getDatabase();
		const characterRepo = new CharacterRepository(db);
		const character = characterRepo.findById(characterQuest.character_id);

		if (!character) {
			if (connection.ws.readyState === 1) {
				connection.ws.send(
					JSON.stringify({
						type: 'quest:progress:error',
						timestamp: Date.now(),
						payload: { error: 'Character not found' }
					})
				);
			}
			return;
		}

		if (character.player_id !== connection.userId) {
			if (connection.ws.readyState === 1) {
				connection.ws.send(
					JSON.stringify({
						type: 'quest:progress:error',
						timestamp: Date.now(),
						payload: { error: 'Access denied' }
					})
				);
			}
			return;
		}

		// Update progress
		const success = updateProgress(characterQuestId, objectiveType, target, amount);

		if (!success) {
			if (connection.ws.readyState === 1) {
				connection.ws.send(
					JSON.stringify({
						type: 'quest:progress:error',
						timestamp: Date.now(),
						payload: { error: 'Failed to update quest progress' }
					})
				);
			}
			return;
		}

		// Get updated quest
		const updatedQuest = getCharacterQuestById(characterQuestId);

		if (!updatedQuest) {
			if (connection.ws.readyState === 1) {
				connection.ws.send(
					JSON.stringify({
						type: 'quest:progress:error',
						timestamp: Date.now(),
						payload: { error: 'Failed to retrieve updated quest' }
					})
				);
			}
			return;
		}

		// Send success response
		if (connection.ws.readyState === 1) {
			connection.ws.send(
				JSON.stringify({
					type: 'quest:progress:updated',
					timestamp: Date.now(),
					payload: {
						characterQuestId,
						progress: updatedQuest.progress
					}
				})
			);
		}

		console.log('Quest progress updated', {
			userId: connection.userId,
			characterQuestId,
			objectiveType,
			target,
			amount
		});
	} catch (error) {
		console.error('Failed to handle quest progress:', error);

		if (connection.ws.readyState === 1) {
			connection.ws.send(
				JSON.stringify({
					type: 'quest:progress:error',
					timestamp: Date.now(),
					payload: { error: 'Internal server error' }
				})
			);
		}
	}
}
