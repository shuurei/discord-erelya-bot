import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    PrimaryColumn,
    CreateDateColumn,
} from 'typeorm'

import { User } from './user'
import { Guild } from './guild'
import { BlacklistDerogation } from './blacklist-derogation'
// import { BlacklistStatus } from './BlacklistStatus'

export enum BlacklistStatus {
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  TREATED = 'TREATED',
}

@Entity()
export class Blacklist {
    @Column({ type: 'bigint', unique: true, nullable: true })
    threadId?: string;

    @Column({ type: 'text', nullable: true })
    context?: string;

    @Column({ type: 'text', nullable: true })
    reason?: string;

    @PrimaryColumn({ type: 'bigint' })
    targetId: string;

    @ManyToOne(() => User, (user) => user.blacklistsAsTarget, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'targetId' })
    target: User;

    @Column({ type: 'bigint' })
    authorId: string;

    @ManyToOne(() => User, (user) => user.blacklistsAsAuthor, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authorId' })
    author: User;

    @Column({ type: 'bigint', nullable: true })
    cleanerId?: string;

    @ManyToOne(() => User, (user) => user.blacklistsAsCleaner, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cleanerId' })
    cleaner?: User;

    @Column({ type: 'bigint' })
    guildId: string;

    @ManyToOne(() => Guild, (guild) => guild.blacklists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({
        type: 'enum',
        enum: BlacklistStatus,
        default: BlacklistStatus.PENDING,
    })
    status: BlacklistStatus;

    @CreateDateColumn()
    blacklistedAt: Date;

    @OneToMany(() => BlacklistDerogation, (d) => d.blacklist)
    derogations: BlacklistDerogation[];
}