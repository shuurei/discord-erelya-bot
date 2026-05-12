export const UserEntityFlags = {
    DEVELOPER: 1 << 0,
    CLEANER: 1 << 1,
    BETA: 1 << 2,
    PARTNER: 1 << 3,
} as const;

export type UserEntityFlag = keyof typeof UserEntityFlags;