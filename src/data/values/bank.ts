import { BankProtectionType } from '@/database/entities'

export const bankProtectionTypeValues = {
    [BankProtectionType.HEIST_DEFENSE]: 8,
    [BankProtectionType.STASH]: 5,
    [BankProtectionType.ALARM]: 1.2,
} as const;