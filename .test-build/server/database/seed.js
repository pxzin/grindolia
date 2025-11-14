"use strict";
/**
 * Database Seeding
 * Initial data for character classes, zones, and starter content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCharacterClasses = seedCharacterClasses;
exports.seedZones = seedZones;
exports.seedQuests = seedQuests;
exports.seedItems = seedItems;
exports.seedMonsters = seedMonsters;
exports.seedDungeons = seedDungeons;
exports.seedDatabase = seedDatabase;
const connection_1 = require("./connection");
const character_class_1 = require("./repositories/character-class");
const zone_1 = require("./repositories/zone");
const quest_template_1 = require("./repositories/quest-template");
const item_template_1 = require("./repositories/item-template");
const dungeon_1 = require("./repositories/dungeon");
const dungeon_floor_1 = require("./repositories/dungeon-floor");
const monster_1 = require("./repositories/monster");
/**
 * Seed initial character classes
 */
function seedCharacterClasses() {
    const db = (0, connection_1.getDatabase)();
    const repo = new character_class_1.CharacterClassRepository(db);
    const classes = [
        {
            name: 'Warrior',
            description: 'A mighty fighter skilled in close combat and heavy armor. High HP and strength make warriors perfect for frontline battles.',
            base_stats: {
                hp: 120,
                strength: 15,
                intelligence: 5,
                dexterity: 8,
                vitality: 12
            },
            stat_growth: {
                hp_per_level: 15,
                strength_per_level: 3,
                intelligence_per_level: 1,
                dexterity_per_level: 1,
                vitality_per_level: 2
            },
            starting_equipment: [] // Will be populated with item IDs when items are created
        },
        {
            name: 'Mage',
            description: 'A master of arcane arts who wields devastating spells. High intelligence and magical power, but low physical defense.',
            base_stats: {
                hp: 80,
                strength: 5,
                intelligence: 18,
                dexterity: 7,
                vitality: 6
            },
            stat_growth: {
                hp_per_level: 8,
                strength_per_level: 1,
                intelligence_per_level: 4,
                dexterity_per_level: 1,
                vitality_per_level: 1
            },
            starting_equipment: []
        },
        {
            name: 'Rogue',
            description: 'A swift and cunning fighter who strikes from the shadows. High dexterity enables critical hits and dodging attacks.',
            base_stats: {
                hp: 100,
                strength: 10,
                intelligence: 8,
                dexterity: 16,
                vitality: 9
            },
            stat_growth: {
                hp_per_level: 12,
                strength_per_level: 2,
                intelligence_per_level: 1,
                dexterity_per_level: 3,
                vitality_per_level: 1
            },
            starting_equipment: []
        }
    ];
    let seededCount = 0;
    for (const classData of classes) {
        if (!repo.nameExists(classData.name)) {
            repo.create(classData);
            seededCount++;
            console.log(`  ✓ Seeded character class: ${classData.name}`);
        }
    }
    if (seededCount > 0) {
        console.log(`✅ Seeded ${seededCount} character classes`);
    }
    else {
        console.log('ℹ️  Character classes already seeded');
    }
}
/**
 * Seed starter zone
 */
function seedZones() {
    const db = (0, connection_1.getDatabase)();
    // Check if starter zone exists
    const checkStmt = db.prepare('SELECT COUNT(*) as count FROM zones WHERE name = ?');
    const result = checkStmt.get('Starter Plains');
    if (result.count === 0) {
        (0, zone_1.createZone)({
            name: 'Starter Plains',
            description: 'A peaceful meadow where new adventurers begin their journey. Gentle creatures roam the grasslands.',
            min_level: 1,
            max_level: 5,
            theme: 'grassland'
        });
        console.log('  ✓ Seeded zone: Starter Plains');
    }
}
/**
 * Seed tutorial quest
 */
function seedQuests() {
    const db = (0, connection_1.getDatabase)();
    // Check if tutorial quest exists
    const checkStmt = db.prepare('SELECT COUNT(*) as count FROM quest_templates WHERE title = ?');
    const result = checkStmt.get('Welcome to the New World');
    if (result.count === 0) {
        // Get starter zone ID
        const zoneStmt = db.prepare('SELECT id FROM zones WHERE name = ?');
        const zone = zoneStmt.get('Starter Plains');
        (0, quest_template_1.createQuestTemplate)({
            title: 'Welcome to the New World',
            description: 'You have been transported to a mysterious new world. Explore your surroundings and learn the basics of survival.',
            zone_id: zone?.id || null,
            min_level: 1,
            max_level: null,
            objectives: [
                {
                    type: 'explore',
                    description: 'Explore the Starter Plains',
                    target: 'starter_plains',
                    required: 1,
                    current: 0
                },
                {
                    type: 'kill',
                    description: 'Defeat 3 Slimes',
                    target: 'slime',
                    required: 3,
                    current: 0
                }
            ],
            rewards: {
                xp: 100,
                currency: 50,
                items: []
            },
            is_repeatable: false,
            cooldown_hours: null
        });
        console.log('  ✓ Seeded quest: Welcome to the New World');
    }
}
/**
 * Seed starting equipment items
 */
function seedItems() {
    const db = (0, connection_1.getDatabase)();
    const items = [
        {
            name: 'Rusty Sword',
            description: 'A basic sword, worn but still functional.',
            type: 'weapon',
            rarity: 'common',
            level_requirement: 1,
            stats: { damage: 5, strength: 2 },
            effects: null,
            max_stack: 1,
            icon_path: null
        },
        {
            name: 'Wooden Staff',
            description: 'A simple wooden staff imbued with minor magical properties.',
            type: 'weapon',
            rarity: 'common',
            level_requirement: 1,
            stats: { damage: 4, intelligence: 3 },
            effects: null,
            max_stack: 1,
            icon_path: null
        },
        {
            name: 'Iron Dagger',
            description: 'A sharp dagger perfect for quick strikes.',
            type: 'weapon',
            rarity: 'common',
            level_requirement: 1,
            stats: { damage: 4, dexterity: 3 },
            effects: null,
            max_stack: 1,
            icon_path: null
        },
        {
            name: 'Leather Armor',
            description: 'Basic leather protection for adventurers.',
            type: 'armor',
            rarity: 'common',
            level_requirement: 1,
            stats: { defense: 5, vitality: 2 },
            effects: null,
            max_stack: 1,
            icon_path: null
        },
        {
            name: 'Health Potion',
            description: 'Restores 50 HP when consumed.',
            type: 'consumable',
            rarity: 'common',
            level_requirement: 1,
            stats: null,
            effects: { heal_hp: 50 },
            max_stack: 99,
            icon_path: null
        }
    ];
    let seededCount = 0;
    for (const item of items) {
        const checkStmt = db.prepare('SELECT COUNT(*) as count FROM item_templates WHERE name = ?');
        const result = checkStmt.get(item.name);
        if (result.count === 0) {
            (0, item_template_1.createItemTemplate)(item);
            seededCount++;
            console.log(`  ✓ Seeded item: ${item.name}`);
        }
    }
    if (seededCount > 0) {
        console.log(`✅ Seeded ${seededCount} items`);
    }
}
/**
 * Seed monsters for dungeons
 */
function seedMonsters() {
    const db = (0, connection_1.getDatabase)();
    const monsterRepo = new monster_1.MonsterRepository(db);
    const monsters = [
        // Floor 1 monsters
        {
            name: 'Slime',
            description: 'A gelatinous creature that bounces around mindlessly.',
            base_level: 1,
            base_hp: 30,
            base_strength: 3,
            base_intelligence: 1,
            base_dexterity: 2,
            xp_reward: 10,
            currency_reward: 5,
            monster_type: 'basic',
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 0.3,
                        min_quantity: 1,
                        max_quantity: 1
                    }
                ]
            }
        },
        {
            name: 'Goblin Scout',
            description: 'A sneaky goblin armed with a rusty dagger.',
            base_level: 2,
            base_hp: 40,
            base_strength: 5,
            base_intelligence: 2,
            base_dexterity: 6,
            xp_reward: 15,
            currency_reward: 8,
            monster_type: 'basic',
            loot_table: {
                items: [
                    {
                        item_template_id: 3, // Iron Dagger
                        drop_chance: 0.1,
                        min_quantity: 1,
                        max_quantity: 1
                    }
                ]
            }
        },
        // Floor 2-3 monsters
        {
            name: 'Cave Bat',
            description: 'A vicious bat with razor-sharp fangs.',
            base_level: 3,
            base_hp: 35,
            base_strength: 4,
            base_intelligence: 2,
            base_dexterity: 10,
            xp_reward: 20,
            currency_reward: 10,
            monster_type: 'basic',
            loot_table: {
                items: []
            }
        },
        {
            name: 'Skeleton Warrior',
            description: 'An undead soldier wielding a chipped sword.',
            base_level: 4,
            base_hp: 60,
            base_strength: 8,
            base_intelligence: 3,
            base_dexterity: 5,
            xp_reward: 30,
            currency_reward: 15,
            monster_type: 'undead',
            loot_table: {
                items: [
                    {
                        item_template_id: 1, // Rusty Sword
                        drop_chance: 0.15,
                        min_quantity: 1,
                        max_quantity: 1
                    }
                ]
            }
        },
        // Floor 4-5 monsters
        {
            name: 'Dark Mage',
            description: 'A corrupted spellcaster channeling dark energy.',
            base_level: 5,
            base_hp: 50,
            base_strength: 4,
            base_intelligence: 12,
            base_dexterity: 6,
            xp_reward: 40,
            currency_reward: 20,
            monster_type: 'magic',
            loot_table: {
                items: [
                    {
                        item_template_id: 2, // Wooden Staff
                        drop_chance: 0.2,
                        min_quantity: 1,
                        max_quantity: 1
                    }
                ]
            }
        },
        {
            name: 'Stone Golem',
            description: 'A massive construct of animated stone.',
            base_level: 6,
            base_hp: 100,
            base_strength: 12,
            base_intelligence: 2,
            base_dexterity: 3,
            xp_reward: 50,
            currency_reward: 25,
            monster_type: 'construct',
            loot_table: {
                items: [
                    {
                        item_template_id: 4, // Leather Armor
                        drop_chance: 0.25,
                        min_quantity: 1,
                        max_quantity: 1
                    }
                ]
            }
        },
        // Boss monster
        {
            name: 'Dungeon Overlord',
            description: 'The fearsome master of this dark domain.',
            base_level: 7,
            base_hp: 150,
            base_strength: 15,
            base_intelligence: 10,
            base_dexterity: 8,
            xp_reward: 100,
            currency_reward: 50,
            monster_type: 'boss',
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 1.0,
                        min_quantity: 2,
                        max_quantity: 3
                    }
                ]
            }
        }
    ];
    let seededCount = 0;
    for (const monsterData of monsters) {
        const existing = monsterRepo.findByName(monsterData.name);
        if (!existing) {
            monsterRepo.create(monsterData);
            seededCount++;
            console.log(`  ✓ Seeded monster: ${monsterData.name}`);
        }
    }
    if (seededCount > 0) {
        console.log(`✅ Seeded ${seededCount} monsters`);
    }
    else {
        console.log('ℹ️  Monsters already seeded');
    }
}
/**
 * Seed starter dungeon with 5 floors
 */
function seedDungeons() {
    const db = (0, connection_1.getDatabase)();
    const dungeonRepo = new dungeon_1.DungeonRepository(db);
    const floorRepo = new dungeon_floor_1.DungeonFloorRepository(db);
    const monsterRepo = new monster_1.MonsterRepository(db);
    // Create starter dungeon
    const dungeonName = 'Dark Caverns';
    let dungeon = dungeonRepo.findByName(dungeonName);
    if (!dungeon) {
        dungeon = dungeonRepo.create({
            name: dungeonName,
            description: 'A mysterious underground labyrinth filled with dangerous creatures. The deeper you go, the stronger they become.',
            min_level: 1,
            max_floors: 5,
            theme: 'cave'
        });
        console.log(`  ✓ Seeded dungeon: ${dungeonName}`);
    }
    // Get monster IDs
    const slime = monsterRepo.findByName('Slime');
    const goblin = monsterRepo.findByName('Goblin Scout');
    const bat = monsterRepo.findByName('Cave Bat');
    const skeleton = monsterRepo.findByName('Skeleton Warrior');
    const mage = monsterRepo.findByName('Dark Mage');
    const golem = monsterRepo.findByName('Stone Golem');
    const boss = monsterRepo.findByName('Dungeon Overlord');
    // Create floors
    const floors = [
        {
            floor_number: 1,
            difficulty_multiplier: 1.0,
            monster_count: 3,
            boss_monster_id: undefined,
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 0.5,
                        min_quantity: 1,
                        max_quantity: 2,
                        rarity: 'common'
                    }
                ],
                currency_min: 10,
                currency_max: 20
            }
        },
        {
            floor_number: 2,
            difficulty_multiplier: 1.3,
            monster_count: 4,
            boss_monster_id: undefined,
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 0.6,
                        min_quantity: 1,
                        max_quantity: 2,
                        rarity: 'common'
                    }
                ],
                currency_min: 20,
                currency_max: 35
            }
        },
        {
            floor_number: 3,
            difficulty_multiplier: 1.6,
            monster_count: 4,
            boss_monster_id: undefined,
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 0.7,
                        min_quantity: 2,
                        max_quantity: 3,
                        rarity: 'common'
                    }
                ],
                currency_min: 30,
                currency_max: 50
            }
        },
        {
            floor_number: 4,
            difficulty_multiplier: 2.0,
            monster_count: 5,
            boss_monster_id: undefined,
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 0.8,
                        min_quantity: 2,
                        max_quantity: 4,
                        rarity: 'common'
                    }
                ],
                currency_min: 40,
                currency_max: 70
            }
        },
        {
            floor_number: 5,
            difficulty_multiplier: 2.5,
            monster_count: 3,
            boss_monster_id: boss?.id,
            loot_table: {
                items: [
                    {
                        item_template_id: 5, // Health Potion
                        drop_chance: 1.0,
                        min_quantity: 3,
                        max_quantity: 5,
                        rarity: 'common'
                    }
                ],
                currency_min: 75,
                currency_max: 100
            }
        }
    ];
    let seededCount = 0;
    for (const floorData of floors) {
        const existing = floorRepo.findByDungeonAndFloor(dungeon.id, floorData.floor_number);
        if (!existing) {
            floorRepo.create({
                dungeon_id: dungeon.id,
                ...floorData
            });
            seededCount++;
            console.log(`  ✓ Seeded floor ${floorData.floor_number} for ${dungeonName}`);
        }
    }
    if (seededCount > 0) {
        console.log(`✅ Seeded ${seededCount} dungeon floors`);
    }
    else {
        console.log('ℹ️  Dungeon floors already seeded');
    }
}
/**
 * Run all seed functions
 */
function seedDatabase() {
    console.log('🌱 Seeding database...');
    try {
        seedCharacterClasses();
        seedZones();
        seedQuests();
        seedItems();
        seedMonsters();
        seedDungeons();
        console.log('✅ Database seeding completed');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}
// Run seed if called directly (CommonJS only)
// if (require.main === module) {
// 	seedDatabase();
// }
