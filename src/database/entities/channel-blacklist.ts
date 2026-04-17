import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm'

import { Guild } from './guild'

export enum BlacklistScope {
    LEVEL = 'LEVEL',
    ECONOMY = 'ECONOMY',
    COMMAND = 'COMMAND',
    QUEST = 'QUEST',
    MESSAGE = 'MESSAGE',
}

@Entity()
export class ChannelBlacklist {
    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @PrimaryColumn({ type: 'enum', enum: BlacklistScope })
    scope: BlacklistScope;

    @PrimaryColumn({ type: 'bigint' })
    channelId: string;

    @ManyToOne(() => Guild, (guild) => guild.channelBlacklist, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}