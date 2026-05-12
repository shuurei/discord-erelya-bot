import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../Guild'

export const defaultEconomyModule = {
    // Boost Factor
    guildBoosterFactor: 0.2,
    tagSupporterFactor: 0.2,

    // Message
    isGuildCoinsFromMessageEnabled: true,
    messageChance: 0.3,
    messageMinGain: 8,
    messageMaxGain: 24,

    // Call
    isGuildCoinsFromCallEnabled: true,
    callPrivatePenalty: 0.25,
    callMutedPenalty: 0.25,
    callDeafPenalty: 0.35,
    callCameraBonus: 0.15,
    callStreamBonus: 0.15,
    callGainIntervalMinutes: 15,
    callMinGain: 24,
    callMaxGain: 40,

    // Work
    isWorkEnabled: true,
    workCooldown: 60,
    workMinGain: 200,
    workMaxGain: 500,

    // Rob
    isRobEnabled: true,
    robSuccessChance: 0.3,
    robStealPercentage: 0.2,
    robCooldown: 60 * 60 * 1000,
    robbedCooldown: 3 * 60 * 60 * 1000,

    // Shop
    isShopEnabled: false,

    // Gambling
    isGamblingEnabled: false,

    // Discount
    supporterPriceDiscount: 0.3,
} as const;

@Entity()
export class EconomyModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @ManyToOne(() => Guild, (guild) => guild.economyModule, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: false })
    enabled: boolean;

    // Boost Factor
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.guildBoosterFactor  })
    guildBoosterFactor: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.tagSupporterFactor })
    tagSupporterFactor: number;

    // Message
    @Column({ type: 'boolean', default: defaultEconomyModule.isGuildCoinsFromMessageEnabled })
    isGuildCoinsFromMessageEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.messageChance })
    messageChance: number;
    @Column({ type: 'int', default: defaultEconomyModule.messageMinGain })
    messageMinGain: number;
    @Column({ type: 'int', default: defaultEconomyModule.messageMaxGain })
    messageMaxGain: number;

    // Call
    @Column({ type: 'boolean', default: defaultEconomyModule.isGuildCoinsFromCallEnabled })
    isGuildCoinsFromCallEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.callPrivatePenalty })
    callPrivatePenalty: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.callMutedPenalty })
    callMutedPenalty: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.callDeafPenalty })
    callDeafPenalty: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.callCameraBonus })
    callCameraBonus: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.callStreamBonus })
    callStreamBonus: number;
    @Column({ type: 'int', default: defaultEconomyModule.callGainIntervalMinutes })
    callGainIntervalMinutes: number;
    @Column({ type: 'int', default: defaultEconomyModule.callMinGain })
    callMinGain: number;
    @Column({ type: 'int', default: defaultEconomyModule.callMaxGain })
    callMaxGain: number;

    // Work
    @Column({ type: 'boolean', default: defaultEconomyModule.isWorkEnabled })
    isWorkEnabled: boolean;
    @Column({ type: 'int', default: defaultEconomyModule.workCooldown })
    workCooldown: number;
    @Column({ type: 'int', default: defaultEconomyModule.workMinGain })
    workMinGain: number;
    @Column({ type: 'int', default: defaultEconomyModule.workMaxGain })
    workMaxGain: number;

    // Rob
    @Column({ type: 'boolean', default: defaultEconomyModule.isRobEnabled })
    isRobEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.robSuccessChance })
    robSuccessChance: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.robStealPercentage })
    robStealPercentage: number;
    @Column({ type: 'int', default: defaultEconomyModule.robCooldown })
    robCooldown: number;
    @Column({ type: 'int', default: defaultEconomyModule.robbedCooldown })
    robbedCooldown: number;

    // Shop
    @Column({ type: 'boolean', default: defaultEconomyModule.isShopEnabled })
    isShopEnabled: boolean;

    // Gambling
    @Column({ type: 'boolean', default: defaultEconomyModule.isGamblingEnabled })
    isGamblingEnabled: boolean;

    // Discount
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEconomyModule.supporterPriceDiscount })
    supporterPriceDiscount: number;
}