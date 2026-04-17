import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm'

import { Guild } from './guild'

@Entity()
export class GuildLevelReward {
    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @PrimaryColumn({ type: 'bigint' })
    atLevel: number;

    @ManyToOne(() => Guild, (guild) => guild.levelRewards, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'int', nullable: true })
    guildPointsReward?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    roleId?: string;

    @Column({ type: 'boolean', nullable: true })
    isStackable?: boolean;
}