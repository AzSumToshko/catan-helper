import { TerrainType } from '../types';
import type { NumberToken, HexConfig, RandomizerSettings } from '../types';
import { GAME_DATA } from '../data/gameData';
import { MAP_SLOTS } from '../data/mapSlots';

// --- Adjacency Logic ---

const getNeighbors = (index: number): number[] => {
    const slot1 = MAP_SLOTS[index];
    const neighbors: number[] = [];

    MAP_SLOTS.forEach((slot2, i) => {
        if (i === index) return;

        // Calculate distance based on q/r or left/top.
        // Let's use left/top percentages.
        // Horizontal distance for adjacency is approx X_SCALE (10).
        // Vertical distance is approx Y_SCALE (9.8).
        // Diagonal distance: sqrt( (5)^2 + (9.8)^2 ) ~ sqrt(25 + 96) ~ 11.
        // Let's use a threshold. Distance squared.

        const dx = slot1.left - slot2.left;
        const dy = slot1.top - slot2.top;
        const distSq = dx * dx + dy * dy;

        // Threshold: 10^2 + 10^2 = 200 is too much.
        // Adjacent hexes are roughly 10-11 units apart.
        // 12^2 = 144 seems like a safe upper bound for adjacency.
        // Let's check:
        // Horizontal neighbor: distance = 10. distSq = 100.
        // Vertical/Diagonal neighbor: distance ~ 11. distSq ~ 121.
        // Next closest (2 steps away): > 15. distSq > 225.
        // So threshold of 140-150 is good.

        if (distSq < 150) {
            neighbors.push(i);
        }
    });

    return neighbors;
};

// Precompute adjacency list
const ADJACENCY_LIST: number[][] = MAP_SLOTS.map((_, i) => getNeighbors(i));


// --- Helper Functions ---

const shuffle = <T>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

// --- Island Generation Logic ---

const generateIslandLayout = (settings: RandomizerSettings): TerrainType[] => {
    // 1. Prepare Land Tiles
    let landTiles: TerrainType[] = [];
    let landCount = 0;
    Object.entries(GAME_DATA.counts.fields.byType).forEach(([type, count]) => {
        if (type !== TerrainType.Sea) {
            for (let i = 0; i < count; i++) {
                landTiles.push(type as TerrainType);
                landCount++;
            }
        }
    });
    // Shuffle land tiles for later assignment
    landTiles = shuffle(landTiles);


    // 2. Initialize Grid with Sea


    // We need to group slots by Island ID.
    // 0 = Sea (initially everything)
    // 1..N = Island IDs
    const islandAssignments: number[] = new Array(MAP_SLOTS.length).fill(0);

    // 3. Place Seeds
    // We need 'settings.islands' number of seeds.
    // Retry Loop for the whole map generation if we get stuck
    let attempts = 0;
    const MAX_ATTEMPTS = 500;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;

        // Reset
        islandAssignments.fill(0);
        const islandFrontiers: number[][] = Array.from({ length: settings.islands }, () => []);
        const islandSizes: number[] = new Array(settings.islands + 1).fill(0); // 1-based index

        // Pick Seeds
        // Constraint: Seeds must not be neighbors.
        // Better: Pick random available, check if valid.

        const availableSlots = shuffle(MAP_SLOTS.map((_, i) => i));

        let seedsFound = true;
        for (let i = 1; i <= settings.islands; i++) {
            const seed = availableSlots.find(slot => {
                if (islandAssignments[slot] !== 0) return false;
                // Check neighbors for other islands (buffer)
                // Actually for seed, we just want it to be valid.
                // Strict buffer: no neighbor is another island.
                const neighbors = ADJACENCY_LIST[slot];
                const hasNeighborIsland = neighbors.some(n => islandAssignments[n] !== 0);
                if (hasNeighborIsland) return false;
                return true;
            });

            if (seed === undefined) {
                seedsFound = false;
                break;
            }

            // Assign Seed
            islandAssignments[seed] = i;
            islandSizes[i]++;
            islandFrontiers[i - 1].push(seed);

            // Remove seed from available so we don't pick it again (handled by check above)
        }

        if (!seedsFound) continue; // Retry

        // 4. Grow Islands
        // Round-robin expansion until all land tiles are placed.
        // Total Land needed: landCount.
        // Current Land placed: settings.islands.
        let placedCount = settings.islands;
        let stuck = false;

        while (placedCount < landCount) {
            let placedThisRound = false;

            // Try to expand each island once per round
            // Randomize order of islands to expand to prevent bias
            const islandOrder = shuffle(Array.from({ length: settings.islands }, (_, i) => i + 1));

            for (const islandId of islandOrder) {
                if (placedCount >= landCount) break;

                // Find valid expansion candidate
                // Frontier currently contains all slots of the island.
                // We should look at neighbors of the island's current slots.
                // Optimization: Keep a set of efficient candidates?
                // For now: Iterate all island slots, check their neighbors.

                const currentIslandSlots = islandAssignments
                    .map((id, idx) => id === islandId ? idx : -1)
                    .filter(idx => idx !== -1);

                // Potential candidates: Neighbors of current slots that are currently Sea (0)
                // And satisfy the buffer constraint (No neighbors belonging to OTHER islands).

                let validCandidates: number[] = [];

                // Collect all sea neighbors
                for (const slotIdx of currentIslandSlots) {
                    const neighbors = ADJACENCY_LIST[slotIdx];
                    for (const n of neighbors) {
                        if (islandAssignments[n] === 0) {
                            // Check buffer constraint
                            const nNeighbors = ADJACENCY_LIST[n];
                            const disjoint = nNeighbors.every(nn => {
                                const neighborId = islandAssignments[nn];
                                return neighborId === 0 || neighborId === islandId;
                            });

                            if (disjoint) {
                                if (!validCandidates.includes(n)) {
                                    validCandidates.push(n);
                                }
                            }
                        }
                    }
                }

                if (validCandidates.length > 0) {
                    // Pick one random candidate
                    const pick = validCandidates[Math.floor(Math.random() * validCandidates.length)];
                    islandAssignments[pick] = islandId;
                    islandSizes[islandId]++;
                    placedCount++;
                    placedThisRound = true;
                }
            }

            if (!placedThisRound && placedCount < landCount) {
                stuck = true;
                break;
            }
        }

        if (stuck) continue; // Retry configuration

        // 5. Validate Constraints
        // Min Fields Per Island
        const minSizeSatisfied = islandSizes.slice(1).every(size => size >= settings.minFieldsPerIsland);
        if (!minSizeSatisfied) continue;

        // 6. Map Assignments to Terrain Types with Resource Clustering Validation
        // Try multiple shuffles of land tiles to find one that satisfies clustering constraint
        // Adjust attempts based on difficulty: 1=easy (many attempts), 2=medium, 3=hard (few attempts)
        let validTerrainMap: TerrainType[] | null = null;

        // Scale attempts inversely with max cluster size
        // maxTouchingSameResources = 1: 300 attempts (normal/easy)
        // maxTouchingSameResources = 2: 150 attempts (medium)
        // maxTouchingSameResources = 3: 50 attempts (hard/rare)
        const baseAttempts = 300;
        const MAX_SHUFFLE_ATTEMPTS = Math.floor(baseAttempts / settings.maxTouchingSameResources);

        for (let shuffleAttempt = 0; shuffleAttempt < MAX_SHUFFLE_ATTEMPTS; shuffleAttempt++) {
            // Shuffle land tiles for this attempt
            const shuffledLandTiles = shuffle(landTiles);

            // Create terrain map
            const candidateMap: TerrainType[] = new Array(MAP_SLOTS.length).fill(TerrainType.Sea);

            let landIndex = 0;
            islandAssignments.forEach((islandId, slotIndex) => {
                if (islandId > 0) { // It's land
                    if (landIndex < shuffledLandTiles.length) {
                        candidateMap[slotIndex] = shuffledLandTiles[landIndex];
                        landIndex++;
                    } else {
                        candidateMap[slotIndex] = TerrainType.Desert; // Fallback
                    }
                } else {
                    candidateMap[slotIndex] = TerrainType.Sea;
                }
            });

            // Validate resource clustering
            if (validateResourceClustering(candidateMap, settings.maxTouchingSameResources)) {
                validTerrainMap = candidateMap;
                break;
            }
        }

        if (validTerrainMap) {
            return validTerrainMap;
        }

        // If we couldn't find valid terrain distribution, retry island generation
        continue;

    }

    if (attempts >= MAX_ATTEMPTS) {
        console.warn("Could not generate valid map with current settings. Falling back to random shuffle.");
        // Fallback: Just return a random shuffle of all slots if we failed (to avoid crash)
        const all = new Array(MAP_SLOTS.length).fill(TerrainType.Sea);
        MAP_SLOTS.slice(0, landTiles.length).forEach((_, i) => all[i] = landTiles[i]);
        return shuffle(all);
    }

    // Should not reach here - either returned valid map or fallback
    console.warn("Unexpected: reached end of generateIslandLayout without returning");
    const fallback = new Array(MAP_SLOTS.length).fill(TerrainType.Sea);
    MAP_SLOTS.slice(0, landTiles.length).forEach((_, i) => fallback[i] = landTiles[i]);
    return shuffle(fallback);
};

// --- Resource Clustering Validation ---

/**
 * Find the size of the largest connected component (cluster) for each resource type
 * Returns true if all clusters respect the maxTouchingSameResources constraint
 */
const validateResourceClustering = (terrainMap: TerrainType[], maxClusterSize: number): boolean => {
    const visited = new Array(terrainMap.length).fill(false);

    // BFS to find cluster size starting from a given index
    const getClusterSize = (startIdx: number, targetTerrain: TerrainType): number => {
        const queue: number[] = [startIdx];
        visited[startIdx] = true;
        let size = 0;

        while (queue.length > 0) {
            const current = queue.shift()!;
            size++;

            const neighbors = ADJACENCY_LIST[current];
            for (const neighbor of neighbors) {
                if (!visited[neighbor] && terrainMap[neighbor] === targetTerrain) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                }
            }
        }

        return size;
    };

    // Check all land tiles (skip Sea and Desert)
    for (let i = 0; i < terrainMap.length; i++) {
        const terrain = terrainMap[i];
        if (terrain === TerrainType.Sea || terrain === TerrainType.Desert) continue;

        if (!visited[i]) {
            const clusterSize = getClusterSize(i, terrain);
            if (clusterSize > maxClusterSize) {
                return false; // Found a cluster that's too large
            }
        }
    }

    return true;
};

// --- Number Clustering Validation ---

/**
 * Find the size of the largest connected component (cluster) for each number token
 * Returns true if all clusters respect the maxTouchingSameNumbers constraint
 * maxClusterSize interpretation: 0 = no touching (max 1), 1 = max 2 touching, 2 = max 3 touching
 */
const validateNumberClustering = (hexes: HexConfig[], maxClusterSize: number): boolean => {
    const visited = new Array(hexes.length).fill(false);

    // Actual max cluster size is maxClusterSize + 1
    // 0 -> 1 (no neighbors), 1 -> 2 (pairs), 2 -> 3 (triplets)
    const actualMaxSize = maxClusterSize + 1;

    // BFS to find cluster size starting from a given index
    const getClusterSize = (startIdx: number, targetNumber: NumberToken): number => {
        const queue: number[] = [startIdx];
        visited[startIdx] = true;
        let size = 0;

        while (queue.length > 0) {
            const current = queue.shift()!;
            size++;

            const neighbors = ADJACENCY_LIST[current];
            for (const neighbor of neighbors) {
                if (!visited[neighbor] && hexes[neighbor].numberToken === targetNumber) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                }
            }
        }

        return size;
    };

    // Check all hexes with number tokens
    for (let i = 0; i < hexes.length; i++) {
        const numberToken = hexes[i].numberToken;
        if (!numberToken) continue; // Skip hexes without numbers

        if (!visited[i]) {
            const clusterSize = getClusterSize(i, numberToken);
            if (clusterSize > actualMaxSize) {
                return false; // Found a cluster that's too large
            }
        }
    }

    return true;
};


export const generateMap = (settings: RandomizerSettings): HexConfig[] => {
    // 1. Generate Terrain Layout based on Islands Check
    const terrainMap = generateIslandLayout(settings);

    // 2. Prepare number tokens
    const tokens: NumberToken[] = [];
    Object.entries(GAME_DATA.counts.tokens.byValue).forEach(([value, count]) => {
        for (let i = 0; i < count; i++) {
            tokens.push(Number(value) as NumberToken);
        }
    });

    // 3. Assign tokens with validation (red number clustering + number clustering)
    // Adjust attempts based on difficulty of maxTouchingSameNumbers:
    // 0 = no touching (300 attempts - common/easy)
    // 1 = max 2 touching (150 attempts - medium)
    // 2 = max 3 touching (50 attempts - rare/hard)
    const baseTokenAttempts = 300;
    const MAX_TOKEN_ATTEMPTS = settings.maxTouchingSameNumbers === 0 ? baseTokenAttempts :
        settings.maxTouchingSameNumbers === 1 ? Math.floor(baseTokenAttempts / 2) :
            Math.floor(baseTokenAttempts / 6);

    let validHexes: HexConfig[] | null = null;

    for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt++) {
        const shuffledTokens = shuffle(tokens);

        // Get indices of land hexes (not Sea, not Desert)
        const landIndices: number[] = [];
        terrainMap.forEach((terrain, index) => {
            if (terrain !== TerrainType.Sea && terrain !== TerrainType.Desert) {
                landIndices.push(index);
            }
        });

        // Assign tokens to land hexes
        const candidateHexes: HexConfig[] = terrainMap.map((terrain, index) => {
            const slot = MAP_SLOTS[index];
            const hex: HexConfig = {
                q: slot.left,
                r: slot.top,
                terrain: terrain
            };
            return hex;
        });

        // Assign shuffled tokens to land hexes
        landIndices.forEach((landIdx, i) => {
            if (i < shuffledTokens.length) {
                candidateHexes[landIdx].numberToken = shuffledTokens[i];
            }
        });

        // Validate red number clustering if enabled
        let passedRedValidation = true;
        if (settings.preventRedClustering) {
            let hasRedCluster = false;

            // Check each hex with a red number (6 or 8)
            for (let i = 0; i < candidateHexes.length; i++) {
                const hex = candidateHexes[i];
                if (hex.numberToken === 6 || hex.numberToken === 8) {
                    // Check all neighbors
                    const neighbors = ADJACENCY_LIST[i];
                    for (const neighborIdx of neighbors) {
                        const neighborHex = candidateHexes[neighborIdx];
                        if (neighborHex.numberToken === 6 || neighborHex.numberToken === 8) {
                            hasRedCluster = true;
                            break;
                        }
                    }
                    if (hasRedCluster) break;
                }
            }

            passedRedValidation = !hasRedCluster;
        }

        // Validate number clustering
        const passedNumberValidation = validateNumberClustering(candidateHexes, settings.maxTouchingSameNumbers);

        if (passedRedValidation && passedNumberValidation) {
            validHexes = candidateHexes;
            break;
        }
    }

    // If we couldn't find a valid configuration, return the last attempt (best effort)
    if (!validHexes) {
        console.warn("Could not prevent red number clustering after max attempts. Returning best effort.");
        const shuffledTokens = shuffle(tokens);
        const landIndices: number[] = [];
        terrainMap.forEach((terrain, index) => {
            if (terrain !== TerrainType.Sea && terrain !== TerrainType.Desert) {
                landIndices.push(index);
            }
        });

        validHexes = terrainMap.map((terrain, index) => {
            const slot = MAP_SLOTS[index];
            const hex: HexConfig = {
                q: slot.left,
                r: slot.top,
                terrain: terrain
            };
            return hex;
        });

        landIndices.forEach((landIdx, i) => {
            if (i < shuffledTokens.length) {
                validHexes![landIdx].numberToken = shuffledTokens[i];
            }
        });
    }

    return validHexes;
};
