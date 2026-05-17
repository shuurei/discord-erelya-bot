export class Gacha<T extends string> {
    private pool: { item: T; weight: number }[];
    private total: number;

    constructor(rates: Record<T, number>) {
        this.pool = (Object.entries(rates) as [T, number][]).map(([item, weight]) => ({ item, weight }));
        this.total = this.pool.reduce((sum, { weight }) => sum + weight, 0);
    }

    roll(exclude: T[] = []) {
        const available = this.pool.filter(({ item }) => !exclude.includes(item));
        if (available.length === 0) return null;

        const total = available.reduce((sum, { item: _, weight }) => sum + weight, 0);
        const roll = Math.random() * total;

        let cumulative = 0;
        for (const { item, weight } of available) {
            cumulative += weight;
            if (roll < cumulative) return item;
        }

        return available[available.length - 1].item;
    }

    odds(exclude: T[] = []): Record<T, number> {
        const available = this.pool.filter(({ item }) => !exclude.includes(item));
        const total = available.reduce((sum, { weight }) => sum + weight, 0);

        return Object.fromEntries(
            available.map(({ item, weight }) => [item, (weight / total) * 100])
        ) as Record<T, number>;
    }
}

export default Gacha