import { applicationEmojiHelperSync, clamp } from '@/utils'

export interface CreateProgressBarOptions {
    length?: number;
    filledChar?: string;
    emptyChar?: string;
    asciiChar?: boolean;
    useDefaultChar?: boolean; 
    showPercentage?: boolean
};

export const createProgressBar = (ratio: number, options?: CreateProgressBarOptions) => {
    const { whiteRectEmoji, greenRectEmoji } = applicationEmojiHelperSync();

    const {
        length = 10,
        filledChar = `${options?.asciiChar ? '▰' : greenRectEmoji ?? '▰'}`,
        emptyChar = `${options?.asciiChar ? '▱' : whiteRectEmoji ?? '▱'}`,
        showPercentage = false
    } = options ?? {};

    const clamped = clamp(ratio, 0, 1);
    const filledCount = clamped === 0
        ? 0
        : Math.max(1 , Math.round(clamped * length));
    const emptyCount = length - filledCount;

    const bar = filledChar.repeat(filledCount) + emptyChar.repeat(emptyCount);
    const percentage = showPercentage ? ` **${Math.round(clamped * 100)}%**` : '';

    return bar.concat(percentage);
}