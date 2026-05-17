export const UserEntityFlags = {
    DEVELOPER: 1 << 0,
    TESTER: 1 << 2,
    PARTNER: 1 << 3,
} as const;

export type UserEntityFlag = keyof typeof UserEntityFlags;