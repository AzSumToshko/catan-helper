export interface MapSlot {
    id: number;
    left: number;
    top: number;
    q: number;
    r: number;
}

const generateSeafarersGrid = (): MapSlot[] => {
    const slots: MapSlot[] = [];

    // Row Counts: 5, 6, 7, 6, 7, 6, 5
    // Total: 42
    const ROW_COUNTS = [5, 6, 7, 6, 7, 6, 5];

    // Horizontal Spacing: 1.0 (Unit Width)
    // Vertical Spacing: 0.88 (Approx sqrt(3)/2 * something)

    // Y-axis: Rows 0 to 6. Center is Row 3.
    // X-axis: Centered around 0.

    // Scale Factors (Percentage of container)
    // X: 10% unit
    // Y: 9.8% unit (Adjusted for vertical compression to match pointed hex aspect correctly, ~0.866 ratio)
    const X_SCALE = 10;
    const Y_SCALE = 9.8;

    ROW_COUNTS.forEach((count, rowIndex) => {
        // Calculate Y coordinate (relative to center row 3)
        const y = (rowIndex - 3) * 0.88;

        // Calculate Start X to center the row
        // Rows with 5: -2, -1, 0, 1, 2
        // Rows with 6: -2.5, -1.5, -0.5, 0.5, 1.5, 2.5
        // Rows with 7: -3, -2, -1, 0, 1, 2, 3
        const startX = -(count - 1) / 2;

        for (let i = 0; i < count; i++) {
            const x = startX + i;

            slots.push({
                id: slots.length,
                left: 50 + (x * X_SCALE),
                top: 50 + (y * Y_SCALE),
                q: x,
                r: rowIndex
            });
        }
    });

    return slots;
};

export const MAP_SLOTS: MapSlot[] = generateSeafarersGrid();
