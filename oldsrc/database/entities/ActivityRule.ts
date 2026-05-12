import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
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

    @PrimaryColumn({
        type: 'enum',
        enum: ActivityRuleType
    })
    type: ActivityRuleType;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({
        type: 'enum',
        enum: ActivityRuleMode,
        nullable: true,
        default: null
    })
    mode: ActivityRuleMode;

    @Column({ type: 'float', scale: 2, precision: 6, default: 1 })
    activityXpMultiplier: number;

    @Column({ type: 'float', scale: 2, precision: 6, default: 1  })
    guildCoinsMultiplier: number;
}