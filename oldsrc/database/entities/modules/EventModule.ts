import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../Guild'

export const defaultEventModule = {
    // Global
    randomEventCooldown: 180,
    randomEventChance: 0.05,

    // Guild Coins
    isGuildCoinEventEnabled: true,
    guildCoinsChance: 0.4,
    guildCoinsMinGain: 1_000,
    guildCoinsMaxGain: 2_000,

    // Activity Xp
    isActivityXpEventEnabled: true,
    activityXpChance: 0.6,
    activityXpMinGain: 500,
    activityXpMaxGain: 800,
} as const;

@Entity()
export class EventModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @ManyToOne(() => Guild, (guild) => guild.eventModule, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: false })
    enabled: boolean;

    // Global
    @Column({ type: 'int', default: defaultEventModule.randomEventCooldown })
    randomEventCooldown: number;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEventModule.randomEventChance })
    randomEventChance: number;

    // Guild Coins
    @Column({ type: 'boolean', default: defaultEventModule.isGuildCoinEventEnabled })
    isGuildCoinEventEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEventModule.guildCoinsChance })
    guildCoinsChance: number;
    @Column({ type: 'int', default: defaultEventModule.guildCoinsMinGain })
    guildCoinsMinGain: number;
    @Column({ type: 'int', default: defaultEventModule.guildCoinsMaxGain })
    guildCoinsMaxGain: number;

    // Activity Xp
    @Column({ type: 'boolean', default: defaultEventModule.isActivityXpEventEnabled })
    isActivityXpEventEnabled: boolean;
    @Column({ type: 'float', precision: 6, scale: 2, default: defaultEventModule.activityXpChance })
    activityXpChance: number;
    @Column({ type: 'int', default: defaultEventModule.activityXpMinGain })
    activityXpMinGain: number;
    @Column({ type: 'int', default: defaultEventModule.activityXpMaxGain })
    activityXpMaxGain: number;
}