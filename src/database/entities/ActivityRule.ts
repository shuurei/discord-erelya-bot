import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { enumType } from '@/utils'

import { Guild } from './Guild'

export enum ActivityRuleType {
    CHANNEL = 'channel',
    ROLE = 'role'
}

export enum ActivityRuleMode {
    WHITELIST = 'whitelist',
    BLACKLIST = 'blacklist'
}

@Entity()
export class ActivityRule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: enumType(), enum: ActivityRuleType })
    type: ActivityRuleType;

    @Column({ type: enumType(), enum: ActivityRuleMode, nullable: true, default: null })
    mode: ActivityRuleMode;

    @Column({ type: 'decimal', scale: 2, precision: 6, default: 1 })
    activityXpMultiplier: number;

    @Column({ type: 'decimal', scale: 2, precision: 6, default: 1 })
    guildCoinsMultiplier: number;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}