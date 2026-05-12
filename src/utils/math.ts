/**
 * Converts a hexadecimal color value into an RGB tuple
 *
 * @param hex The hexadecimal color value
 */
export const hexToRgb = (hex: string): [number, number, number] => {
    let clean = hex.replace('#', '');

    if (clean.length === 3) {
        clean = clean
            .split('')
            .map((char) => char + char)
            .join('');
    }

    const value = parseInt(clean, 16);

    return [
        (value >> 16) & 255,
        (value >> 8) & 255,
        value & 255
    ];
};

/**
 * Restricts a number to stay within a given range
 *
 * @param value The value to clamp
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Generates a random number between min and max
 *
 * @param min The minimum value
 * @param max The maximum value
 */
export const randomBetween = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

/**
 * Converts a level into the total amount of XP required
 *
 * @param level The target level
 */
export const levelToXp = (level: number) => {
    if (level <= 1) return 0
    return Math.floor(1000 * (Math.pow((level - 1), 2) / 4) + (3 * level) + 750);
}

/**
 * Calculates the current level from a total XP amount
 *
 * @param xp The total XP amount
 */
export const xpToLevel = (xp: number) => {
    const a = 1000 / 4;
    const b = 3 - 2 * a;
    const c = a + 750 - xp;

    const delta = b * b - 4 * a * c;
    if (delta <= 0) return 1;

    return Math.max(1, Math.floor((-b + Math.sqrt(delta)) / (2 * a)));
}

/**
 * Returns progression information for the next level
 *
 * @param xp The current total XP amount
 */
export const xpToNextLevel = (xp: number) => {
    const currentLevel = xpToLevel(xp);
    const currentLevelXp = levelToXp(currentLevel);
    const nextLevel = currentLevel + 1;
    const nextLevelXp = levelToXp(nextLevel);

    const xpProgress = xp - currentLevelXp;
    const xpForLevel = nextLevelXp - currentLevelXp;

    return {
        currentXp: xp,
        currentLevel,
        currentLevelXp,
        nextLevel,
        nextLevelXp,
        xpProgress,
        xpForLevel
    };
}