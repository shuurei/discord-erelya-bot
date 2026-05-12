import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../Guild'

export const defaultLevelModule = {
    // Boost Factor
    guildBoosterFactor: 0.2,
    tagSupporterFactor: 0.2,

    // Message
    isXpFromMessageEnabled: true,
    messageChance: 0.3,

    // Call
    isXpFromCallEnabled: true,
    callPrivatePenalty: 0.25,
    callMutedPenalty: 0.25,
    callDeafPenalty: 0.35,
    callCameraBonus: 0.15,
    callStreamBonus: 0.15,
    callGainIntervalMinutes: 15,

    // Growth
    maxLevel: 100
} as const;

@Entity()
export class LevelModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @ManyToOne(() => Guild, (guild) => guild.levelModule, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: false })
    enabled: boolean;

    // Boost Factor
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.guildBoosterFactor })
    guildBoosterFactor: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.tagSupporterFactor })
    tagSupporterFactor: number;

    // Mesage
    @Column({ type: 'boolean', default: defaultLevelModule.isXpFromMessageEnabled })
    isXpFromMessageEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.messageChance })
    messageChance: number;

    // Call
    @Column({ type: 'boolean', default: defaultLevelModule.isXpFromCallEnabled })
    isXpFromCallEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.callGainIntervalMinutes })
    callGainIntervalMinutes: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.callPrivatePenalty })
    callPrivatePenalty: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.callMutedPenalty })
    callMutedPenalty: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.callDeafPenalty })
    callDeafPenalty: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.callCameraBonus })
    callCameraBonus: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultLevelModule.callStreamBonus })
    callStreamBonus: number;

    // Growth
    @Column({ type: 'int', default: defaultLevelModule.maxLevel })
    maxLevel: number;
}