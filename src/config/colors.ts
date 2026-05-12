export const COLORS = {
    red: 0xff4C4C,
    green: 0x8EFF61,
    blue: 0x4A9BFF,
    gray: 0x696969,
    purple: 0xB16FFF,
    orange: 0xFF8E55,
    yellow: 0xF5CB3A,
    lightGray: 0xC2C2CC,
    indigo: 0X6886FF,
} as const;

export type Color = keyof typeof COLORS;