export const TerrainType = {
    Sea: 'sea',
    Gold: 'gold',
    Brick: 'brick',
    Wood: 'wood',
    Sheep: 'sheep',
    Wheat: 'wheat',
    Ore: 'ore',
    Desert: 'desert',
} as const;

export type TerrainType = typeof TerrainType[keyof typeof TerrainType];

export const HarborType = {
    None: 'none',
    Wild: 'wild',
    Brick: 'brick',
    Wood: 'wood',
    Sheep: 'sheep',
    Wheat: 'wheat',
    Ore: 'ore',
} as const;

export type HarborType = typeof HarborType[keyof typeof HarborType];

export type NumberToken = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;

export interface HexConfig {
    q: number; // Axial coordinates
    r: number;
    terrain: TerrainType;
    numberToken?: NumberToken;
    harbor?: HarborType;
}

export interface RandomizerSettings {
    islands: number;
    minFieldsPerIsland: number;
    preventRedClustering: boolean;
    maxTouchingSameNumbers: number; // 0-3
    maxTouchingSameResources: number; // 0-3
    harborPlacement: 'random' | 'balanced';
}
