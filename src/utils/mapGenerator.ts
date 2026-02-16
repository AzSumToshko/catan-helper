import { TerrainType } from '../types';
import type { HexConfig, RandomizerSettings, NumberToken } from '../types';
import { GAME_DATA } from '../data/gameData';
import { MAP_SLOTS } from '../data/mapSlots';

export const generateMap = (_settings: RandomizerSettings): HexConfig[] => {
    // 1. Flatten the fields from GAME_DATA
    let fields: TerrainType[] = [];
    Object.entries(GAME_DATA.counts.fields.byType).forEach(([type, count]) => {
        for (let i = 0; i < count; i++) {
            fields.push(type as TerrainType);
        }
    });

    // 2. Flatten the number tokens
    const tokens: NumberToken[] = [];
    Object.entries(GAME_DATA.counts.tokens.byValue).forEach(([value, count]) => {
        for (let i = 0; i < count; i++) {
            tokens.push(Number(value) as NumberToken);
        }
    });

    // Shuffle Fields
    const shuffledFields = [...fields].sort(() => Math.random() - 0.5);

    // Assign fields to MAP SLOTS
    const assignedHexes: HexConfig[] = [];

    // Use the predefined slots instead of calculating q/r grid
    MAP_SLOTS.slice(0, shuffledFields.length).forEach((slot, index) => {
        assignedHexes.push({
            q: slot.left, // Storing left % in q
            r: slot.top,  // Storing top % in r
            terrain: shuffledFields[index]
        });
    });

    // Assign Tokens to eligible fields (not Sea, not Desert)
    const shuffledTokens = [...tokens].sort(() => Math.random() - 0.5);
    let tokenIndex = 0;

    assignedHexes.forEach(hex => {
        if (hex.terrain !== TerrainType.Sea && hex.terrain !== TerrainType.Desert) {
            if (tokenIndex < shuffledTokens.length) {
                hex.numberToken = shuffledTokens[tokenIndex];
                tokenIndex++;
            }
        }
    });

    return assignedHexes;
};
