import { TerrainType, HarborType } from '../types';


export const GAME_DATA = {
    counts: {
        fields: {
            total: 42,
            byType: {
                [TerrainType.Sea]: 19,
                [TerrainType.Gold]: 2,
                [TerrainType.Brick]: 4,
                [TerrainType.Wood]: 4,
                [TerrainType.Sheep]: 4,
                [TerrainType.Wheat]: 5,
                [TerrainType.Ore]: 4,
            } // Total 42
        },
        tokens: {
            total: 23,
            byValue: {
                2: 1, 3: 3, 4: 3, 5: 3, 6: 2, 8: 2, 9: 3, 10: 3, 11: 2, 12: 1
            }
        },
        harbors: {
            [HarborType.Wild]: 5,
            [HarborType.Brick]: 1,
            [HarborType.Wood]: 1,
            [HarborType.Sheep]: 1,
            [HarborType.Wheat]: 1,
            [HarborType.Ore]: 1,
        }
    }
};
