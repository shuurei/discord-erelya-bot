import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    CreateDateColumn,
} from 'typeorm'

import { Blacklist } from './blacklist'
import { Guild } from './guild'

@Entity({ name: 'blacklist_derogation' })
export class BlacklistDerogation {
    @PrimaryColumn({ type: 'bigint' })
    userId: string;

    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @ManyToOne(() => Blacklist, (b) => b.derogations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'targetId' })
    blacklist: Blacklist;

    @ManyToOne(() => Guild, (g) => g.derogations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean' })
    authorized: boolean;

    @CreateDateColumn()
    decidedAt: Date;
}