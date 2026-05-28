import { BankProtectionRank, BankProtectionType } from '@/database/entities'
import { Gacha } from '@/core'

export const bankRankTable = new Gacha({
    [BankProtectionRank.X]: 1,
    [BankProtectionRank.S]: 9,
    [BankProtectionRank.A]: 12,
    [BankProtectionRank.B]: 15,
    [BankProtectionRank.C]: 18,
    [BankProtectionRank.D]: 12,
    [BankProtectionRank.E]: 8,
    [BankProtectionRank.F]: 5,
});

export const bankTypeTable = new Gacha({
    [BankProtectionType.HEIST_DEFENSE]: 40,
    [BankProtectionType.STASH]: 35,
    [BankProtectionType.ALARM]: 25,
});

export const getBankRankFactor = (rank: BankProtectionRank) => {
    switch (rank) {
        case BankProtectionRank.X: return 8;
        case BankProtectionRank.S: return 7;
        case BankProtectionRank.A: return 6;
        case BankProtectionRank.B: return 5;
        case BankProtectionRank.C: return 4;
        case BankProtectionRank.D: return 3;
        case BankProtectionRank.E: return 2;
        case BankProtectionRank.F: return 1;
    }
}