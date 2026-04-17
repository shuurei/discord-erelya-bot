import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm'

import { Guild } from './guild'

@Entity()
export class GuildModule {
    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @PrimaryColumn({ type: 'bigint' })
    name: string;

    @ManyToOne(() => Guild, (guild) => guild.modules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    @Column({ type: 'json' })
    settings: any;
}